import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {listedTopics} from './subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const catalogue = JSON.parse(read('research/icm2026-section-coverage.json'));
const plenaries = JSON.parse(read('research/icm2026-plenary.json'));
const plenaryTopics = structuredClone(plenaries.subjects);
for (const file of ['research/icm2026-plenary-applied-reports.json', 'research/icm2026-plenary-dynamics-probability.json', 'research/icm2026-plenary-ramsey-formalization.json']) {
  if (!fs.existsSync(path.join(root, file))) continue;
  for (const [id, topics] of Object.entries(JSON.parse(read(file)).leading_topics))
    plenaryTopics[id] = [...new Set([...(plenaryTopics[id] ?? []), ...topics])];
}
const trees = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true})) {
  if (!file.endsWith('.tree')) continue;
  const id = path.basename(file, '.tree');
  assert(!trees.has(id), `Duplicate tree ID ${id}`);
  trees.set(id, read(`trees/${file}`));
}
const sorted = values => [...values].sort();
// Speaker cards omit some middle initials and accents used by the proceedings.
const nameKey = name => name.normalize('NFD').replace(/\p{M}/gu, '')
  .replace(/\b[A-Z]\.\s*/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
assert.equal(new Set(catalogue.reports.map(report => report.outline)).size, 43);
assert.equal(catalogue.reports.length, 43);
const results = [];
for (const section of catalogue.sections) {
  const expected = catalogue.reports.filter(report => report.sections.includes(section.number));
  const speakers = expected.flatMap(report => report.speakers);
  assert.equal(new Set(speakers).size, speakers.length, `${section.slug}: duplicate speaker`);
  assert.equal(speakers.length, section.speakers);
  assert.equal(expected.length, section.reports);
  assert.equal(expected.filter(report => report.primary === section.number).length, section.primary_reports);
  assert.equal(expected.filter(report => report.primary !== section.number).length, section.cross_listed_reports);
  const manifest = JSON.parse(read(`research/icm2026-${section.slug}.json`));
  const papers = [...manifest.papers, ...(manifest.cross_listed_reports ?? [])];
  assert.deepEqual(sorted(papers.map(paper => paper.outline)), sorted(expected.map(report => report.outline)),
    `${section.slug}: manifest differs from independently checked roster`);
  const landing = trees.get(section.landing);
  assert(landing, `Missing landing ${section.landing}`);
  const heading = '\\strong{研究专题}';
  const start = landing.indexOf(heading);
  assert(start >= 0, `Missing research heading ${section.landing}`);
  const end = landing.indexOf('\n\\strong{', start + heading.length);
  const links = listedTopics(landing.slice(start + heading.length, end < 0 ? undefined : end));
  const leading = plenaryTopics[section.landing] ?? [];
  assert.deepEqual(links.slice(0, leading.length), leading, `${section.landing}: plenary order`);
  assert.deepEqual(sorted(links.slice(leading.length)), sorted(expected.map(report => report.outline)),
    `${section.landing}: missing, duplicated or incorrectly grouped report`);
  for (const report of expected) {
    const paper = papers.find(paper => paper.outline === report.outline);
    const credited = paper.authors ?? paper.author;
    const authors = Array.isArray(credited) ? credited : credited.split(';').map(name => name.trim());
    assert.deepEqual(sorted(authors.map(nameKey)), sorted(report.speakers.map(nameKey)),
      `${report.outline}: speaker grouping differs`);
    assert(trees.get(report.outline)?.includes('\\taxon{Outline}'), `Missing outline ${report.outline}`);
    assert(trees.get(paper.reference)?.includes('\\taxon{Reference}'), `Missing reference ${paper.reference}`);
    if (paper.source_manifest) {
      const source = JSON.parse(read(paper.source_manifest)).papers.find(item => item.outline === paper.outline);
      assert(source, `Missing reused source ${paper.outline}`);
      assert.equal(source.reference, paper.reference);
    }
  }
  results.push({section: section.slug, speakers: speakers.length, reports: expected.length, plenaries: leading.length, directEntries: links.length});
}
const numberTheory = JSON.parse(read('research/icm2026-number-theory.json'));
assert.equal(numberTheory.papers.find(paper => paper.outline === '0H40').status, catalogue.source_gap.status);
console.log(JSON.stringify({checkedOn: catalogue.checked_on, sections: results, uniqueReports: 43,
  reportMemberships: results.reduce((sum, section) => sum + section.reports, 0),
  limitation: 'Verifies the recorded catalogue, source pages and navigation, not complete proof coverage.'}, null, 2));
