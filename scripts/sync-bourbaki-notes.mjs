import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, data) => fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
const names = ['aubrun', 'florio', 'petri', 'sabin'];
const records = [...names, 'integration'].map(name => {
  const file = `research/bourbaki-2026-06-${name}.json`;
  return {file, ...read(file)};
});
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree'))
  .map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const audit = read('research/site-evergreen-audit.json');
const required = read('research/prerequisite-required-links.json');
const narratives = read('research/topic-narratives.json');
const snapshots = new Map();
const existing = new Set(records.flatMap(record => record.existing_note_ids ?? []));

for (const record of records) {
  if (record.report && record.report.status !== 'selected-branches-integrated') {
    throw new Error(`Unfinished report: ${record.file}`);
  }
  for (const [id, prerequisites, reason] of record.entries) {
    if (snapshots.has(id)) throw new Error(`Overlapping review: ${id}`);
    const file = files.get(id);
    if (!file || !reason) throw new Error(`Missing note or review: ${id}`);
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    const title = text.match(/\\title\{([^}]+)\}/)?.[1];
    const taxon = text.match(/\\taxon\{([^}]+)\}/)?.[1];
    if (!title || !taxon) throw new Error(`Missing metadata: ${id}`);
    const sha256 = crypto.createHash('sha256').update(text).digest('hex');
    const navigation = ['Outline', 'Reference', 'Person'].includes(taxon);
    if (navigation && prerequisites.length) throw new Error(`Navigation has prerequisites: ${id}`);
    audit.reviews[id] = {...audit.reviews[id], title, action: 'Bourbaki 六月专题增补', reason};
    if (navigation) delete audit.prerequisites[id];
    else audit.prerequisites[id] = prerequisites;
    required.pages[id] = {targets: prerequisites, sha256};
    snapshots.set(id, {id, title, taxon, path: file, sha256});
  }
  if (record.report) {
    const {outline: id, question} = record.report;
    if (!question || !snapshots.has(id)) throw new Error(`Missing narrative: ${record.file}`);
    const previous = narratives.pages.find(page => page.id === id);
    const row = {id, path: files.get(id), question, previous_targets: previous?.previous_targets ?? []};
    if (previous) Object.assign(previous, row);
    else narratives.pages.push(row);
  }
}

// Refresh only edited source snapshots, without replaying older prerequisite reviews.
for (const slug of ['logic', 'algebra', 'geometry', 'number-theory']) {
  const file = `research/icm2026-${slug}.json`;
  const manifest = read(file);
  let changed = false;
  for (const note of manifest.notes ?? []) {
    if (snapshots.has(note.id)) {
      Object.assign(note, snapshots.get(note.id));
      changed = true;
    }
  }
  if (changed) write(file, manifest);
}
const manifest = {
  date: '2026-10-13',
  session: '2026-06-06',
  official_program: 'https://www.bourbaki.fr/seminaires/2025-26/index.html',
  expected_reports: 4,
  records: records.map(record => record.file),
  reports: records.filter(record => record.report).map(record => ({...record.report, record: record.file})),
  new_note_ids: [...snapshots.keys()].filter(id => !existing.has(id)),
  changed_existing_ids: [...existing],
  notes: [...snapshots.values()],
  limitation: 'Selected mathematical branches, explicit proofs and cited research inputs. Neither topic presence nor structural checks imply that all source proofs are reproduced locally.',
};
for (const field of ['proofs_written', 'proofs_with_external_inputs', 'research_statements_without_local_proof']) {
  manifest[field] = [...new Set(records.flatMap(record => record[field] ?? []))];
}
write('research/site-evergreen-audit.json', audit);
write('research/prerequisite-required-links.json', required);
write('research/topic-narratives.json', narratives);
write('research/bourbaki-2026-06.json', manifest);
console.log(JSON.stringify({reports: manifest.reports.length, newPages: manifest.new_note_ids.length,
  changedPages: existing.size, reviewedPages: snapshots.size}));
