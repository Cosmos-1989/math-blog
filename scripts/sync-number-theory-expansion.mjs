import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2) + '\n');
const batches = ['rational-points', 'modularity-approximation', 'probability',
  'combinatorics-spectra', 'computation', 'orbit-method']
  .map(slug => ({file: `research/number-theory-${slug}.json`, ...read(`research/number-theory-${slug}.json`)}));
const manifest = read('research/icm2026-number-theory.json');
const audit = read('research/site-evergreen-audit.json');
const narratives = read('research/topic-narratives.json');
const required = read('research/prerequisite-required-links.json');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const entries = batches.flatMap(batch => batch.entries);
const ids = new Set(entries.map(([id]) => id));
if (ids.size !== entries.length) throw new Error('Duplicate IDs between report batches');
const snapshots = new Map(manifest.notes.map(note => [note.id, note]));
for (const [id, prerequisites, reason] of entries) {
  const file = files.get(id);
  if (!file) throw new Error(`Missing note ${id}`);
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const title = source.match(/\\title\{([^}]+)\}/)?.[1];
  const taxon = source.match(/\\taxon\{([^}]+)\}/)?.[1];
  if (!title || !taxon) throw new Error(`Missing note metadata ${id}`);
  audit.reviews[id] = {...audit.reviews[id], title, action: '数论报告增补', reason};
  if (taxon === 'Outline' || taxon === 'Reference') delete audit.prerequisites[id];
  else audit.prerequisites[id] = prerequisites;
  snapshots.set(id, {id, title, taxon, path: file, sha256: crypto.createHash('sha256').update(source).digest('hex')});
  required.pages[id] = {targets: ['Outline', 'Reference'].includes(taxon) ? [] : prerequisites,
    sha256: crypto.createHash('sha256').update(source).digest('hex')};
}
// Earlier mathematical reviews remain authoritative. Only changed navigation
// and the explicitly owned new notes receive fresh snapshots or dependencies.
for (const id of ['0063', '0064', '0065']) {
  const file = files.get(id), source = fs.readFileSync(path.join(root, file), 'utf8');
  audit.reviews[id] = {...audit.reviews[id], reason: '保留既有专题，增加数论报告及几何交叉入口'};
  if (snapshots.has(id)) snapshots.set(id, {...snapshots.get(id), sha256: crypto.createHash('sha256').update(source).digest('hex')});
  if (required.pages[id]) required.pages[id].sha256 = crypto.createHash('sha256').update(source).digest('hex');
}
const newPapers = batches.flatMap(batch => batch.papers);
if (newPapers.length !== 10 || new Set(newPapers.map(paper => paper.outline)).size !== 10) {
  throw new Error('Expected ten distinct new report topics');
}
const newOutlines = new Set(newPapers.map(paper => paper.outline));
manifest.papers = [...manifest.papers.filter(paper => !newOutlines.has(paper.outline)), ...newPapers];
manifest.entries = [...manifest.entries.filter(([id]) => !ids.has(id)), ...entries];
manifest.notes = [...snapshots.values()];
manifest.date = '2026-10-13';
manifest.scope = 'Twelve primary Number Theory report topics. Eleven proceedings reports and Nelson theme from identified primary literature. Atomic foundations, selected report results and explicit elementary proofs; deferred research proofs and branches are recorded per report.';
manifest.expansion_batches = batches.map(batch => batch.file);
const proofIds = value => typeof value === 'string' ? [value] : value.ids ?? [value.id];
for (const field of ['proofs_written', 'research_statements_without_local_proof']) {
  manifest[field] = [...new Set([
    ...manifest[field].flatMap(proofIds).filter(id => !ids.has(id)),
    ...batches.flatMap(batch => batch[field] ?? []).flatMap(proofIds),
  ])];
  if (manifest[field].some(id => !id)) throw new Error(`Missing ID in ${field}`);
}
for (const paper of newPapers) {
  const existing = narratives.pages.find(page => page.id === paper.outline);
  const row = {id: paper.outline, path: files.get(paper.outline),
    question: paper.question ?? `本专题如何从基本对象走向 ${paper.title} 中的主要问题与结果？`,
    previous_targets: existing?.previous_targets ?? []};
  if (existing) Object.assign(existing, row);
  else narratives.pages.push(row);
}
const geometry = read('research/icm2026-geometry.json');
for (const id of ['0BF1', '0BF4', '0BGJ']) {
  const source = fs.readFileSync(path.join(root, files.get(id)), 'utf8');
  const sha256 = crypto.createHash('sha256').update(source).digest('hex');
  audit.reviews[id] = {...audit.reviews[id], reason: '扩充到一般域，供数域算术复用；保留复几何解释与既有前置关系'};
  if (required.pages[id]) required.pages[id].sha256 = sha256;
  const note = geometry.notes.find(note => note.id === id);
  if (note) note.sha256 = sha256;
}
const monk = geometry.papers.find(paper => paper.id === 'monk-naud');
const source = newPapers.find(paper => paper.outline === '0GS0');
if (monk && source) Object.assign(monk, {status: 'selected-branches-integrated',
  outline: source.outline, reference: source.reference,
  reading_scope: source.reading_scope, deferred: source.deferred,
  integration_record: 'research/number-theory-combinatorics-spectra.json'});
write('research/site-evergreen-audit.json', audit);
write('research/topic-narratives.json', narratives);
write('research/prerequisite-required-links.json', required);
write('research/icm2026-number-theory.json', manifest);
write('research/icm2026-geometry.json', geometry);
console.log(JSON.stringify({newNotes: ids.size, newReports: newPapers.length, reports: manifest.papers.length}));
