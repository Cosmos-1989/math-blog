import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const review = JSON.parse(read('research/narrative-review-2026-10-13.json'));
const pages = new Map(review.pages.map(page => [page.id, page]));
const topicPages = review.pages.filter(page => page.question);
assert.equal(pages.size, 1 + review.subjects.length + topicPages.length);
assert.equal(review.subjects.length, 20);
for (const page of pages.values()) {
  const text = read(page.path);
  assert.equal(crypto.createHash('sha256').update(text).digest('hex'), page.sha256, `${page.id}: stale review`);
  assert(!text.includes('按学科查找概念，或沿专题阅读定义、例子与定理'), `${page.id}: obsolete home introduction`);
  assert(!text.includes('选择感兴趣的研究专题'), `${page.id}: navigation placeholder`);
  if (page.question) {
    assert(page.verified_notes.length, `${page.id}: no reviewed mathematical context`);
    assert.equal(page.taxon, 'Outline');
  }
}
const home = read(pages.get('index').path);
for (const phrase of ['ICM', 'Bourbaki', '渗透式', 'Deligne', review.quote.url]) {
  assert(home.includes(phrase), `Homepage missing ${phrase}`);
}
// Check scope independently of the review's own list so a newly exposed topic cannot be missed.
const allNotes = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), read(`trees/${file}`)]));
for (const id of review.subjects) {
  const text = allNotes.get(id);
  assert(pages.has(id), `${id}: unreviewed subject`);
  for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = match[1];
    if (allNotes.get(target)?.includes('\\taxon{Outline}')) {
      assert(pages.has(target), `${id}: topic ${target} absent from overview review`);
    }
  }
}
console.log(JSON.stringify({home: 1, subjects: review.subjects.length, topicOverviews: topicPages.length, currentSnapshots: pages.size,
  result: 'pass', limitation: 'Checks scope, source snapshots and introduction regressions, not mathematical exposition quality.'}, null, 2));
