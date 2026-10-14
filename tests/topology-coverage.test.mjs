import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const catalogue = JSON.parse(read('research/icm2026-topology.json'));
const plenaries = JSON.parse(read('research/icm2026-plenary.json'));
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const note = id => read(files.get(id));
const sorted = items => [...items].sort();

test('topology lists ten proceedings chapters and two cross-listed reports exactly once', () => {
  assert.equal(catalogue.reports.filter(report => report.kind === 'section').length, 10);
  assert.equal(catalogue.reports.filter(report => report.kind === 'cross-listed-special').length, 2);
  assert.equal(new Set(catalogue.reports.map(report => report.outline)).size, 12);
  assert.equal(new Set(catalogue.reports.map(report => report.speaker)).size, 12);
  const body = note(catalogue.subject).split('\\strong{研究专题}')[1].split('\\strong{其他专题}')[0];
  const leading = plenaries.subjects[catalogue.subject];
  assert.deepEqual(listedTopics(body).slice(0, leading.length), leading);
  assert.deepEqual(sorted(listedTopics(body).slice(leading.length)), sorted(catalogue.reports.map(report => report.outline)));
  for (const report of catalogue.reports) {
    assert(note(report.outline).includes('\\taxon{Outline}'), report.outline);
    assert(note(report.reference).includes('\\taxon{Reference}'), report.reference);
    if (report.existing_record) assert(fs.existsSync(path.join(root, report.existing_record)));
  }
  assert(!catalogue.reports.some(report => report.speaker === catalogue.excluded_plenary.speaker));
});

for (const slug of ['piccirillo', 'schlank', 'watanabe']) {
  test(`${slug}: source scope, note registration and atomic prerequisites agree`, () => {
    const file = `research/icm2026-topology-${slug}.json`;
    assert(catalogue.records.includes(file));
    const record = JSON.parse(read(file));
    assert.equal(record.reports.length, 1);
    const report = record.reports[0];
    const listed = catalogue.reports.find(row => row.outline === report.outline);
    assert(listed);
    assert.equal(listed.reference, report.reference);
    assert.equal(listed.title, report.title);
    for (const key of ['question', 'reading_scope', 'source_url', 'license']) assert(report[key], `${slug}: ${key}`);
    for (const key of ['proofs_written', 'proofs_with_external_inputs', 'research_results_cited', 'deferred']) {
      assert(Array.isArray(report[key]), `${slug}: ${key}`);
    }
    assert(!record.prerequisites[report.outline].length);
    assert(!record.prerequisites[report.reference].length);
    for (const [id, targets] of Object.entries(record.prerequisites)) {
      const text = note(id), links = new Set(bodyLinks(text).map(link => link.target));
      assert.equal(new Set(targets).size, targets.length, `${id}: duplicate prerequisites`);
      for (const target of targets) {
        assert(links.has(target), `${id}: unlinked prerequisite ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), `${id}: non-atomic prerequisite ${target}`);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix) && /^[0-9A-Z]{4}$/.test(id)) {
      assert(Object.hasOwn(record.prerequisites, id), `${slug}: unregistered page ${id}`);
    }
    for (const key of ['proofs_written', 'proofs_with_external_inputs', 'research_results_cited']) {
      for (const id of report[key]) assert(files.has(id), `${slug}/${key}: missing ${id}`);
    }
    const paragraphs = note(report.outline).split('\n').filter(line => line.startsWith('\\p{'));
    assert(paragraphs.length >= 5, `${slug}: overview reduced to a catalogue`);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), `${slug}: catalogue in overview`);
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (reached.has(id) || !files.has(id)) continue;
      reached.add(id);
      queue.push(...bodyLinks(note(id)).map(link => link.target));
    }
    for (const id of Object.keys(record.prerequisites)) {
      if (id !== report.reference) assert(reached.has(id), `${slug}: inaccessible note ${id}`);
    }
  });
}
