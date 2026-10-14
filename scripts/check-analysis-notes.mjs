import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('research/icm2026-analysis.json'));
const expected = new Map([
  ['Shiri Artstein-Avidan', ['0R00', '10.1137/25M1803334']],
  ['Charles Bordenave', ['0S00', '10.1137/25M1805862']],
  ['Franc Forstnerič', ['0T00', '10.1137/25M1802808']],
  ['Emanuel Milman', ['0U00', '10.1137/25M1804224']],
  ['Mariusz Mirek', ['0V00', '10.1137/25M1805837']],
  ['Joaquim Ortega-Cerdà', ['0W00', '10.1137/25M1804261']],
  ['Javier Parcet', ['0X00', '10.1137/25M1803371']],
  ['Sarah Peluse', ['0GO0', '10.1137/25M1806259']],
  ['Jesse Peterson', ['0Z00', '10.1137/25M1807204']],
  ['Thomas Schlumprecht', ['1000', '10.1137/25M1799519']],
  ['Andreas Seeger', ['1100', 'ICM-slides.pdf']],
  ['Hong Wang', ['1200', '10.1137/25M1806156']],
  ['Ruixiang Zhang', ['1300', '10.1137/25M1806272']],
]);
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const links = source => [...source.matchAll(/\]\(([^)\s]+)\)|\\transclude\{([^}]+)\}/g)]
  .map(match => match[1] ?? match[2]).filter(id => !/^(https?:|mailto:|#)/.test(id));
const errors = [];
const ids = new Set(manifest.notes.map(note => note.id));
if (manifest.section !== 8 || manifest.reports.length !== expected.size) errors.push('Wrong selected report set');
if (new Set(manifest.reports.map(report => report.speaker)).size !== expected.size) errors.push('Duplicate report');
if (ids.size !== manifest.notes.length) errors.push('Duplicate source snapshot');
const subject = read(files.get(manifest.subject));
for (const report of manifest.reports) {
  const [outline, sourceIdentifier] = expected.get(report.speaker) ?? [];
  if (outline !== report.outline || !report.source_url?.includes(sourceIdentifier)) errors.push(`Wrong source: ${report.speaker}`);
  if (!report.reading_scope || !report.sources?.length || !Array.isArray(report.deferred)) {
    errors.push(`Missing source/proof scope: ${report.speaker}`);
  }
  if (!links(subject).includes(report.outline)) errors.push(`Missing subject entry: ${report.outline}`);
  for (const id of [report.outline, report.reference]) if (!files.has(id)) errors.push(`Missing entry: ${id}`);
  if (!files.has(report.outline)) continue;
  const text = read(files.get(report.outline));
  if (!text.includes('\\taxon{Outline}') || !links(text).includes(report.reference)) {
    errors.push(`Missing survey/source: ${report.outline}`);
  }
  const reached = new Set(), queue = [report.outline];
  while (queue.length) {
    const id = queue.pop();
    if (reached.has(id) || !files.has(id)) continue;
    reached.add(id);
    queue.push(...links(read(files.get(id))));
  }
  const record = JSON.parse(read(report.record));
  for (const [id] of record.entries) {
    if (!reached.has(id)) errors.push(`Not reachable from ${report.outline}: ${id}`);
    if (!ids.has(id)) errors.push(`Unregistered note: ${id}`);
  }
}
for (const note of manifest.notes) {
  if (files.get(note.id) !== note.path) { errors.push(`Wrong source path: ${note.id}`); continue; }
  if (crypto.createHash('sha256').update(read(note.path)).digest('hex') !== note.sha256) {
    errors.push(`Stale snapshot: ${note.id}`);
  }
  if (['Theorem', 'Lemma', 'Proposition', 'Corollary'].includes(note.taxon)
      && !manifest.proofs_written.includes(note.id)
      && !manifest.research_statements_without_local_proof.includes(note.id)) {
    errors.push(`Unclassified theorem proof: ${note.id}`);
  }
}
for (const id of files.keys()) {
  if (/^(?:0[R-Z]|1[0-3])[0-9A-Z]{2}$/.test(id) && !ids.has(id)) errors.push(`Unreviewed new note: ${id}`);
}
for (const id of ['0GO0', 'icm2026-peluse-combinatorics']) {
  if (!manifest.reused_note_ids?.includes(id) || manifest.new_note_ids.includes(id)) {
    errors.push(`Existing Peluse note counted as new: ${id}`);
  }
}
if (files.has('0Y00')) errors.push('Duplicate Peluse overview; retain 0GO0');
const analysisNarratives = JSON.parse(read('research/narrative-review-2026-10-13-analysis.json'));
const numberNarratives = JSON.parse(read('research/narrative-review-2026-10-13-number-theory.json'));
if (analysisNarratives.pages.some(page => page.id === '0GO0')
    || numberNarratives.pages.filter(page => page.id === '0GO0').length !== 1) {
  errors.push('Cross-listed Peluse topic must keep its original narrative registration');
}
const numberManifest = JSON.parse(read('research/icm2026-number-theory.json'));
const peluseSnapshot = manifest.notes.find(note => note.id === '0GO0');
if (numberManifest.notes.find(note => note.id === '0GO0')?.sha256 !== peluseSnapshot?.sha256) {
  errors.push('Peluse overview snapshots differ between the two subject imports');
}
const newIds = new Set(manifest.new_note_ids);
const reusedIds = new Set(manifest.reused_note_ids);
if (newIds.size + reusedIds.size !== ids.size
    || [...newIds].some(id => reusedIds.has(id) || !ids.has(id))
    || [...reusedIds].some(id => !ids.has(id))) {
  errors.push('New and reused note sets must partition the registered notes');
}
for (const field of ['proofs_written', 'proofs_with_external_inputs', 'research_statements_without_local_proof']) {
  for (const id of manifest[field]) if (!ids.has(id)) errors.push(`Unreviewed proof status: ${id}`);
}
for (const id of manifest.proofs_with_external_inputs) {
  if (!manifest.proofs_written.includes(id)) errors.push(`Conditional derivation not in proofs: ${id}`);
}
for (const id of manifest.research_statements_without_local_proof) {
  if (manifest.proofs_written.includes(id)) errors.push(`Cited theorem also marked proved: ${id}`);
}
console.log(JSON.stringify({reports: manifest.reports.length, pages: ids.size,
  proofPages: manifest.proofs_written.length, proofsWithExternalInputs: manifest.proofs_with_external_inputs.length,
  citedResults: manifest.research_statements_without_local_proof.length, errors,
  limitation: manifest.limitation}, null, 2));
if (errors.length) process.exitCode = 1;
