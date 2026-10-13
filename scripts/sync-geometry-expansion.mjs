import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
const batchFiles = ['shen', 'xie', 'zhuang', 'integration']
  .map(name => `research/geometry-${name}.json`);
const batches = batchFiles.map(file => ({file, ...read(file)}));
const manifest = read('research/icm2026-geometry.json');
const audit = read('research/site-evergreen-audit.json');
const required = read('research/prerequisite-required-links.json');
const narratives = read('research/topic-narratives.json');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const entries = batches.flatMap(batch => batch.entries);
const ids = new Set(entries.map(([id]) => id));
if (ids.size !== entries.length) throw new Error('Duplicate IDs between geometry batches');
for (const name of ['shen', 'xie', 'zhuang']) {
  const paper = batches.find(batch => batch.papers?.[name])?.papers[name];
  if (paper?.status !== 'selected-branches-integrated') {
    throw new Error(`Report ${name} is still being edited`);
  }
}
for (const id of files.keys()) {
  if (/^0[JKL][0-9A-Z]{2}$/.test(id) && !ids.has(id)) {
    throw new Error(`New geometry page has no batch review: ${id}`);
  }
}
const snapshots = new Map(manifest.notes.map(note => [note.id, note]));
const changedSnapshots = new Map();

// Update only this batch. Replaying older subject reviews would undo later repairs.
for (const [id, prerequisites, reason] of entries) {
  const file = files.get(id);
  if (!file || !reason) throw new Error(`Missing source or review for ${id}`);
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const title = source.match(/\\title\{([^}]+)\}/)?.[1];
  const taxon = source.match(/\\taxon\{([^}]+)\}/)?.[1];
  if (!title || !taxon) throw new Error(`Missing metadata in ${id}`);
  const sha256 = crypto.createHash('sha256').update(source).digest('hex');
  audit.reviews[id] = {...audit.reviews[id], title, action: '几何报告增补与逐页核对', reason};
  const navigation = ['Outline', 'Reference'].includes(taxon);
  if (navigation) delete audit.prerequisites[id];
  else audit.prerequisites[id] = prerequisites;
  required.pages[id] = {targets: navigation ? [] : prerequisites, sha256};
  const snapshot = {id, title, taxon, path: file, sha256};
  changedSnapshots.set(id, snapshot);
  snapshots.set(id, snapshot);
}

for (const batch of batches) {
  for (const [id] of batch.entries) {
    if (!(batch.existing_note_ids ?? []).includes(id) && !manifest.new_note_ids.includes(id)) {
      manifest.new_note_ids.push(id);
    }
  }
  for (const [id, update] of Object.entries(batch.papers ?? {})) {
    const paper = manifest.papers.find(paper => paper.id === id);
    if (!paper) throw new Error(`Unknown report ${id}`);
    Object.assign(paper, update, {integration_record: batch.file});
    const existing = narratives.pages.find(page => page.id === paper.outline);
    const row = {id: paper.outline, path: files.get(paper.outline),
      question: update.question, previous_targets: existing?.previous_targets ?? []};
    if (!row.question || !row.path) throw new Error(`Missing narrative record for ${id}`);
    if (existing) Object.assign(existing, row);
    else narratives.pages.push(row);
  }
}
for (const field of ['proofs_written', 'proofs_with_external_inputs', 'research_statements_without_local_proof']) {
  const additions = batches.flatMap(batch => batch[field] ?? []);
  if (additions.some(id => typeof id !== 'string' || !ids.has(id))) {
    throw new Error(`Unreviewed proof-status entry in ${field}`);
  }
  manifest[field] = [...new Set([...(manifest[field] ?? []).filter(id => !ids.has(id)), ...additions])];
}
const proofIds = new Set(manifest.proofs_written);
for (const id of batches.flatMap(batch => batch.research_statements_without_local_proof ?? [])) {
  if (proofIds.has(id)) throw new Error(`Cited statement also labelled locally proved: ${id}`);
}
manifest.date = '2026-10-13';
manifest.status = 'all-report-topics-integrated; selected-proofs-and-explicit-external-inputs';
manifest.expansion_records = batchFiles;
if (manifest.papers.some(paper => !paper.outline || !paper.reference)) {
  throw new Error('Cannot mark report topics integrated while an outline or reference is missing');
}
manifest.notes = manifest.new_note_ids.map(id => {
  if (!snapshots.has(id)) throw new Error(`No source snapshot for ${id}`);
  return snapshots.get(id);
});

// A shared navigation page can also have a snapshot in another report manifest.
const numberTheory = read('research/icm2026-number-theory.json');
let sharedChanged = false;
for (const note of numberTheory.notes) {
  if (changedSnapshots.has(note.id)) {
    Object.assign(note, changedSnapshots.get(note.id));
    sharedChanged = true;
  }
}
write('research/site-evergreen-audit.json', audit);
write('research/prerequisite-required-links.json', required);
write('research/topic-narratives.json', narratives);
write('research/icm2026-geometry.json', manifest);
if (sharedChanged) write('research/icm2026-number-theory.json', numberTheory);
console.log(JSON.stringify({reviewed: ids.size, reports: manifest.papers.length,
  integratedReports: manifest.papers.filter(paper => paper.outline).length}));
