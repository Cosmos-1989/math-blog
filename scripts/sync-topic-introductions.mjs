import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizeFormat} from './note-editorial-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const source = id => fs.readFileSync(path.join(root, files.get(id)), 'utf8');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const links = text => [...text.matchAll(/\]\(([^)\s]+)\)/g)].map(match => match[1])
  .filter(id => !/^(https?:|mailto:|#)/.test(id));
const groups = ['logic', 'algebra', 'geometry', 'number-theory', 'other', 'analysis'];
const records = groups.map(group => {
  const file = `research/narrative-review-2026-10-13-${group}.json`;
  return {file, ...read(file)};
});
const topics = records.flatMap(record => record.pages.map(page => ({...page, record: record.file})));
const subjects = links(source('0060'));
if (new Set(topics.map(page => page.id)).size !== topics.length) {
  throw new Error('Expected distinct, individually reviewed topic overviews');
}
if (subjects.length !== 20) throw new Error('Expected 20 subject introductions');
for (const page of topics) {
  if (!page.question || !page.reason || !Array.isArray(page.previous_targets)
      || !page.verified_notes?.length || page.path !== files.get(page.id)) {
    throw new Error(`Incomplete editorial review: ${page.id}`);
  }
}
const pages = [...topics, ...['index', ...subjects].map(id => ({id, path: files.get(id),
  role: id === 'index' ? 'home' : 'subject',
  reason: id === 'index' ? '说明从前沿报告出发、按需深入概念与证明的读法，并核对 Deligne 引文及其解释。'
    : '用学科的研究对象、主要问题及相邻领域替代泛化导航提示，保留原专题目录。'}))];
const audit = read('research/site-evergreen-audit.json');
const required = read('research/prerequisite-required-links.json');
const narratives = read('research/topic-narratives.json');
const snapshots = new Map();
for (const page of pages) {
  const text = normalizeFormat(source(page.id));
  const taxon = text.match(/\\taxon\{([^}]+)\}/)?.[1] ?? 'Outline';
  if (taxon !== 'Outline' || required.pages[page.id]?.targets.length || audit.prerequisites[page.id]?.length) {
    throw new Error(`Editorial scope must not alter atomic prerequisites: ${page.id}`);
  }
  fs.writeFileSync(path.join(root, page.path), text);
  const snapshot = {id: page.id, path: page.path, title: text.match(/\\title\{([^}]+)\}/)?.[1], taxon, sha256: hash(text)};
  snapshots.set(page.id, snapshot);
  required.pages[page.id] = {...required.pages[page.id], targets: [], sha256: snapshot.sha256};
  audit.reviews[page.id] = {...audit.reviews[page.id], title: snapshot.title,
    narrative_review: {date: '2026-10-13', question: page.question, reason: page.reason,
      record: page.record ?? 'research/narrative-review-2026-10-13.json',
      scope: 'Overview prose and its linked mathematical statements; no change to proof status.'}};
  if (page.question) {
    const previous = narratives.pages.find(row => row.id === page.id);
    const row = {id: page.id, path: page.path, question: page.question,
      previous_targets: [...new Set([...(previous?.previous_targets ?? []), ...page.previous_targets])]};
    if (previous) Object.assign(previous, row);
    else narratives.pages.push(row);
  }
}
// Refresh edited source snapshots only; do not replay historical prerequisite or proof decisions.
for (const name of ['icm2026-logic', 'icm2026-algebra', 'icm2026-geometry', 'icm2026-number-theory', 'bourbaki-2026-06', 'icm2026-analysis']) {
  const file = `research/${name}.json`;
  const manifest = read(file);
  let changed = false;
  for (const note of manifest.notes ?? []) if (snapshots.has(note.id)) {
    Object.assign(note, snapshots.get(note.id));
    changed = true;
  }
  if (changed) write(file, manifest);
}
if (narratives.date !== '2026-10-13' && narratives.validation) {
  narratives.previous_validation = {date: narratives.date, ...narratives.validation};
  delete narratives.validation;
}
narratives.date = '2026-10-13';
narratives.scope = `${topics.length} report-level and independent topic overviews linked from the subject pages, including thematic connection pages.`;
write('research/topic-narratives.json', narratives);
write('research/site-evergreen-audit.json', audit);
write('research/prerequisite-required-links.json', required);
const review = {
  date: '2026-10-13',
  scope: `Homepage, 20 subject introductions and ${topics.length} topic overviews. This record concerns narrative prose; report imports separately record their atomic statements and proofs.`,
  source_basis: 'Full overview texts and the linked statements recorded by each reviewer. This editorial pass does not extend the reading scope or proof coverage of the report imports.',
  quote: {url: 'https://galoisrepresentations.org/2026/07/22/xena-on-counterexamples/',
    author: 'Frank Calegari', date: '2026-07-22',
    quotation: 'All problems in mathematics are psychological.',
    provenance: 'Calegari attributes the wording to Deligne through a lecture by Mark Kisin, and publishes Deligne\'s reply confirming its approximate sense while qualifying its universality.',
    interpretation: 'Psychological blocks can prevent recognition of things that later seem obvious. The homepage translates the short quotation and paraphrases this explanation.'},
  records: records.map(record => record.file),
  subjects,
  pages: pages.map(page => ({...page, ...snapshots.get(page.id)})),
  limitation: 'Source hashes, paragraph structure and link checks do not independently establish mathematical correctness or narrative quality.',
};
write('research/narrative-review-2026-10-13.json', review);
console.log(JSON.stringify({home: 1, subjects: subjects.length, topics: topics.length, reviewedPages: pages.length}));
