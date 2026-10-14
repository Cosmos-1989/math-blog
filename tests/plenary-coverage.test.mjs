import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const record = JSON.parse(read('research/icm2026-plenary.json'));
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const note = id => read(files.get(id));
const sorted = values => [...values].sort();

test('ordinary plenaries, special lectures and source gaps are distinguished', () => {
  assert.equal(new Set(record.ordinary_plenary_speakers).size, 19);
  assert.deepEqual(sorted([...record.reports, ...record.other_ordinary_plenaries].map(row => row.speaker)),
    sorted(record.ordinary_plenary_speakers));
  assert.equal(new Set(record.reports.map(row => row.outline)).size, record.reports.length);
  assert.equal(record.special_plenaries.length, 3);
  for (const row of record.special_plenaries) assert(!record.ordinary_plenary_speakers.includes(row.speaker));
  const ziegler = record.reports.find(row => row.speaker === 'Tamar Ziegler');
  assert.equal(ziegler.coverage_status, 'background-only');
  assert.equal(ziegler.pages, null);
  assert.match(note(ziegler.reference), /2014/);
  assert.match(note(ziegler.reference), /尚待/);
  assert.match(note('2505'), /猜想/);
});

test('six subject pages begin with shared plenary topics without replacing section reports', () => {
  assert.deepEqual(sorted(Object.keys(record.subjects)), ['0061', '0062', '0063', '0064', '0066', '0068']);
  const reports = new Set(record.reports.map(row => row.outline));
  for (const [id, leading] of Object.entries(record.subjects)) {
    const topics = listedTopics(note(id).split('\\strong{研究专题}')[1].split('\\strong{其他专题}')[0]);
    assert(leading.length);
    assert.deepEqual(topics.slice(0, leading.length), leading, id);
    assert.equal(new Set(topics).size, topics.length, id);
    assert(topics.length > leading.length, `${id}: lost existing reports`);
    for (const target of leading) assert(reports.has(target), `${id}: unrecorded plenary`);
  }
});

for (const report of record.reports) {
  test(`${report.speaker}: atomic notes, prerequisites and source scope`, () => {
    for (const key of ['question', 'reading_scope', 'source_url', 'coverage_status']) assert(report[key]);
    assert(note(report.outline).includes('\\taxon{Outline}'));
    assert(note(report.reference).includes('\\taxon{Reference}'));
    assert.equal(record.prerequisites[report.outline].length, 0);
    assert.equal(record.prerequisites[report.reference].length, 0);
    const paragraphs = note(report.outline).split('\n').filter(line => line.startsWith('\\p{'));
    assert(paragraphs.length >= 5, `${report.outline}: insufficient narrative`);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), 'Survey became a catalogue');
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (reached.has(id) || !files.has(id)) continue;
      reached.add(id);
      queue.push(...bodyLinks(note(id)).map(link => link.target));
    }
    const ids = [...files.keys()].filter(id => /^[0-9A-Z]{4}$/.test(id) && id.startsWith(report.prefix));
    for (const id of ids) {
      assert(Object.hasOwn(record.prerequisites, id), `${id}: unregistered`);
      assert(reached.has(id), `${id}: inaccessible`);
      const targets = record.prerequisites[id];
      const links = new Set(bodyLinks(note(id)).map(link => link.target));
      assert.equal(new Set(targets).size, targets.length, `${id}: duplicate dependency`);
      for (const target of targets) {
        assert(links.has(target), `${id}: prerequisite ${target} missing from body`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), `${id}: non-atomic prerequisite ${target}`);
      }
    }
    for (const key of ['proofs_written', 'proofs_with_external_inputs', 'research_results_cited', 'deferred']) {
      assert(Array.isArray(report[key]));
      if (key !== 'deferred') for (const id of report[key]) assert(files.has(id), `${report.speaker}: unknown ${id}`);
    }
  });
}
