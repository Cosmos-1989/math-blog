import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('research/bourbaki-2026-06.json'));
const expected = new Map([[1253, 'Guillaume Aubrun'], [1254, 'Anna Florio'],
  [1255, 'Bram Petri'], [1256, 'Julien Sabin']]);
const errors = [];
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const links = text => [...text.matchAll(/\]\(([^)\s]+)\)|\\transclude\{([^}]+)\}/g)]
  .map(match => match[1] ?? match[2]).filter(id => !/^(https?:|mailto:|#)/.test(id));
if (manifest.session !== '2026-06-06' || manifest.reports.length !== 4) errors.push('Wrong session or report count');
const numbers = manifest.reports.map(report => Number(report.number));
if (new Set(numbers).size !== 4) errors.push('Duplicate report number');
const allIds = new Set(manifest.notes.map(note => note.id));
if (allIds.size !== manifest.notes.length) errors.push('Duplicate note snapshot');
for (const report of manifest.reports) {
  if (expected.get(Number(report.number)) !== report.speaker) errors.push(`Wrong speaker/number: ${report.speaker}`);
  if (!report.reading_scope || !report.source_url || !Array.isArray(report.deferred)) {
    errors.push(`Missing source scope: ${report.speaker}`);
  }
  for (const id of [report.outline, report.reference]) if (!files.has(id)) errors.push(`Missing report entry: ${id}`);
  if (!files.has(report.outline)) continue;
  const text = read(files.get(report.outline));
  if (!text.includes('\\taxon{Outline}')) errors.push(`Not an outline: ${report.outline}`);
  if (!links(text).includes(report.reference)) errors.push(`Source absent from survey: ${report.outline}`);
  const reached = new Set(), queue = [report.outline];
  while (queue.length) {
    const id = queue.pop();
    if (reached.has(id) || !files.has(id)) continue;
    reached.add(id);
    queue.push(...links(read(files.get(id))));
  }
  const batch = JSON.parse(read(report.record));
  for (const [id] of batch.entries) if (!reached.has(id)) errors.push(`Not reachable from ${report.outline}: ${id}`);
}
for (const note of manifest.notes) {
  if (files.get(note.id) !== note.path) { errors.push(`Source path differs: ${note.id}`); continue; }
  const hash = crypto.createHash('sha256').update(read(note.path)).digest('hex');
  if (hash !== note.sha256) errors.push(`Stale source snapshot: ${note.id}`);
}
for (const file of manifest.records) {
  const batch = JSON.parse(read(file));
  for (const [id] of batch.entries) if (!allIds.has(id)) errors.push(`Unregistered batch note: ${id}`);
}
for (const id of files.keys()) {
  if (/^0[NOPQ][0-9A-Z]{2}$/.test(id) && !allIds.has(id)) errors.push(`New note absent from record: ${id}`);
}
for (const field of ['proofs_written', 'proofs_with_external_inputs', 'research_statements_without_local_proof']) {
  for (const id of manifest[field]) if (!allIds.has(id)) errors.push(`Unreviewed proof status: ${id}`);
}
for (const id of manifest.proofs_with_external_inputs) {
  if (!manifest.proofs_written.includes(id)) errors.push(`Conditional proof not in derivations: ${id}`);
}
for (const id of manifest.research_statements_without_local_proof) {
  if (manifest.proofs_written.includes(id)) errors.push(`Cited result also marked proved: ${id}`);
}
console.log(JSON.stringify({session: manifest.session, reports: manifest.reports.length,
  newPages: manifest.new_note_ids.length, changedPages: manifest.changed_existing_ids.length,
  proofPages: manifest.proofs_written.length, proofsWithExternalInputs: manifest.proofs_with_external_inputs.length,
  citedResearchResults: manifest.research_statements_without_local_proof.length, errors,
  limitation: manifest.limitation}, null, 2));
if (errors.length) process.exitCode = 1;
