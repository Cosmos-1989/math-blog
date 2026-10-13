import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizeFormat} from './note-editorial-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, data) => fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
const names = ['artstein-avidan', 'bordenave', 'forstneric'];
const records = names.map(name => {
  const file = `research/icm2026-analysis-${name}.json`;
  return {file, ...read(file)};
});
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const audit = read('research/site-evergreen-audit.json');
const required = read('research/prerequisite-required-links.json');
const snapshots = new Map();
const overviews = [];

for (const [recordIndex, record] of records.entries()) {
  const {report} = record;
  if (!report?.question || !report.reading_scope || !report.sources?.length
      || !Array.isArray(report.deferred)) throw new Error(`Missing source review: ${record.file}`);
  for (const [id, prerequisites, reason] of record.entries) {
    if (!id.startsWith(['0R', '0S', '0T'][recordIndex]) && id !== report.reference) {
      throw new Error(`Out-of-scope write: ${id}`);
    }
    if (snapshots.has(id)) throw new Error(`Overlapping review: ${id}`);
    const file = files.get(id);
    if (!file || !reason) throw new Error(`Missing note or review: ${id}`);
    const source = normalizeFormat(fs.readFileSync(path.join(root, file), 'utf8'));
    const title = source.match(/\\title\{([^}]+)\}/)?.[1];
    const taxon = source.match(/\\taxon\{([^}]+)\}/)?.[1];
    if (!title || !taxon) throw new Error(`Missing metadata: ${id}`);
    const navigation = ['Outline', 'Reference', 'Person'].includes(taxon);
    if (navigation && prerequisites.length) throw new Error(`Navigation has prerequisites: ${id}`);
    fs.writeFileSync(path.join(root, file), source);
    const sha256 = crypto.createHash('sha256').update(source).digest('hex');
    audit.reviews[id] = {...audit.reviews[id], title, action: '分析专题增补', reason};
    if (navigation) delete audit.prerequisites[id];
    else audit.prerequisites[id] = prerequisites;
    required.pages[id] = {targets: prerequisites, sha256};
    snapshots.set(id, {id, title, taxon, path: file, sha256});
  }
  const outline = snapshots.get(report.outline);
  if (outline?.taxon !== 'Outline' || !snapshots.has(report.reference)) {
    throw new Error(`Missing outline or reference: ${record.file}`);
  }
  overviews.push({id: report.outline, path: outline.path, question: report.question,
    previous_targets: [], reason: record.entries.find(row => row[0] === report.outline)[2],
    verified_notes: record.entries.filter(row => ![report.outline, report.reference].includes(row[0]))
      .map(row => row[0]),
    source_notes: report.reading_scope});
}

const manifest = {
  date: '2026-10-13', section: 8, subject: '0068',
  scope: 'Three selected Analysis reports requested by the user; not a complete section import.',
  proceedings: 'https://epubs.siam.org/doi/book/10.1137/1.9781611978674',
  records: records.map(record => record.file),
  reports: records.map(record => ({...record.report, record: record.file})),
  new_note_ids: [...snapshots.keys()], notes: [...snapshots.values()],
  limitation: 'Atomic explanations, local proofs and explicitly cited research results. Source coverage and link checks do not imply that all research proofs have been reproduced.',
};
for (const field of ['proofs_written', 'proofs_with_external_inputs', 'research_statements_without_local_proof']) {
  manifest[field] = [...new Set(records.flatMap(record => record[field] ?? []))];
}
write('research/site-evergreen-audit.json', audit);
write('research/prerequisite-required-links.json', required);
write('research/icm2026-analysis.json', manifest);
write('research/narrative-review-2026-10-13-analysis.json', {pages: overviews});
console.log(JSON.stringify({reports: records.length, newPages: snapshots.size}));
