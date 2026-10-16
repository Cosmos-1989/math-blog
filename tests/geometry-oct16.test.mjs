import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const record = JSON.parse(read('research/icm2026-geometry-oct16.json'));
const snapshots = JSON.parse(read('research/icm2026-geometry-oct16-snapshots.json'));
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree'))
  .map(file => [path.basename(file, '.tree'), 'trees/' + file]));
const note = id => read(files.get(id));
const targets = id => bodyLinks(note(id)).map(link => link.target);

test('three report identities and geometry landing are consistent', () => {
  assert.deepEqual(record.reports.map(row => row.speaker),
    ['Uri Bader', 'Jacob Bernstein', 'Richard Canary']);
  const topics = listedTopics(note('0065'));
  assert.deepEqual(topics.slice(0, 2), ['2C00', '2600']);
  const coverage = JSON.parse(read('research/icm2026-geometry-section-coverage.json'));
  assert.equal(coverage.counts.primary_reports_with_existing_topic,
    coverage.reports.filter(row => row.outline).length);
  assert.equal(coverage.counts.reports_without_dedicated_topic,
    coverage.reports.filter(row => !row.outline).length);
  for (const report of record.reports) {
    assert.equal(topics.filter(id => id === report.outline).length, 1);
    const entry = coverage.reports.find(row => row.speakers.includes(report.speaker));
    assert.equal(entry.outline, report.outline);
    assert.equal(entry.doi, report.doi);
    assert.equal(entry.on_subject_landing, true);
    assert(report.reading_scope && report.question && report.source_url);
    assert.equal(report.coverage_status, 'selected-branches-integrated');
    assert(report.deferred.length > 0);
  }
});

test('each note is registered, reachable, hashed and has explicit atomic prerequisites', () => {
  const reached = new Set(), queue = record.reports.map(report => report.outline);
  while (queue.length) {
    const id = queue.pop();
    if (reached.has(id) || !files.has(id)) continue;
    reached.add(id);
    queue.push(...targets(id));
  }
  for (const report of record.reports) {
    const text = note(report.outline);
    assert(text.includes('\\taxon{Outline}'));
    assert(text.split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(text));
    for (const id of files.keys()) if (id.startsWith(report.prefix)) {
      assert(Object.hasOwn(record.prerequisites, id), id + ': unregistered');
    }
  }
  for (const snapshot of snapshots.notes) {
    const {id} = snapshot, text = note(id);
    assert(reached.has(id), id + ': unreachable');
    assert.equal(crypto.createHash('sha256').update(text).digest('hex'), snapshot.sha256, id);
    const prerequisites = record.prerequisites[id];
    assert.equal(new Set(prerequisites).size, prerequisites.length);
    for (const target of prerequisites) {
      assert(targets(id).includes(target), id + ': missing ' + target);
      assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), target);
    }
  }
  assert(!files.has('2F01'), 'The existing spectral theorem must be reused');
  assert(targets('2F02').includes('0N0B'));
  assert.match(note('0N0B'), /Hermitian/);
});

test('new prerequisite edges contain no circular proof dependencies', () => {
  const complete = new Set(), active = new Set();
  function visit(id, trail = []) {
    if (complete.has(id) || !Object.hasOwn(record.prerequisites, id)) return;
    assert(!active.has(id), [...trail, id].join(' -> '));
    active.add(id);
    for (const target of record.prerequisites[id]) visit(target, [...trail, id]);
    active.delete(id);
    complete.add(id);
  }
  for (const id of Object.keys(record.prerequisites)) visit(id);
});

test('research hypotheses and proof boundaries survive editing', () => {
  assert.match(note('2D0C'), /\\taxon\{Conjecture\}/);
  assert.match(note('2D09'), /1\\leq j<r/);
  assert.match(note('2D0D'), /筹备中/);
  assert.match(note('2D0D'), /1\\leq p<\\infty/);
  assert.match(note('2D0F'), /H\^\{n\+1\}/);
  assert.match(note('2D0F'), /Hausdorff/);
  assert.match(note('2E0A'), /紧无边界/);
  assert.match(note('2E0F'), /2\\leq n\\leq\s*6/);
  assert.match(note('2E0F'), /连通/);
  assert.match(note('2E0M'), /\\lambda\(C\)<\\lambda/);
  assert.match(note('2F0I'), /有限\[正规子群\]\(00BF\)/);
  assert.match(note('2F0J'), /强不可约/);
  assert.match(note('2F0K'), /\(16,8\)/);
  assert.match(note('2F0E'), /端点/);
  assert.match(note('2F0L'), /x_0\\notin A_1\\cup A_2/);
  assert(targets('2E02').includes('0BAC'));
  assert(targets('2E02').includes('2E0P'));
  assert(targets('2D0G').includes('00Q6'));
  assert(!targets('2D0G').includes('00MS'));
  assert(!note('2E09').includes('^perp'));
});

test('round-flow scale, entropy constants and Clifford density agree numerically', () => {
  for (const n of [1, 2, 3, 6]) {
    const radius = 7, t = 0.3, r = Math.sqrt(radius ** 2 - 2 * n * t);
    const derivative = -n / r;
    assert(Math.abs(2 * r * derivative + 2 * n) < 1e-12);
    const T = radius ** 2 / (2 * n);
    assert(Math.abs(r / Math.sqrt(T - t) - Math.sqrt(2 * n)) < 1e-12);
  }
  assert(Math.abs(Math.sqrt(2 * Math.PI / Math.E) - 1.520346901066281) < 1e-12);
  assert(4 / Math.E < Math.sqrt(2 * Math.PI / Math.E));
  assert.equal((2 * Math.PI ** 2) / (4 * Math.PI), Math.PI / 2);
});

test('diagonal Cartan gaps separate the selected Anosov indices', () => {
  for (const b of [0, 0.3]) for (const n of [-7, -1, 1, 9]) {
    const exponents = [1, b, -b, -1].map(x => n * x).sort((x, y) => y - x);
    const gaps = exponents.slice(0, 3).map((x, i) => x - exponents[i + 1]);
    assert(Math.abs(gaps[0] - (1 - b) * Math.abs(n)) < 1e-12);
    assert(Math.abs(gaps[1] - 2 * b * Math.abs(n)) < 1e-12);
    assert(Math.abs(gaps[2] - gaps[0]) < 1e-12);
  }
});

test('finite-group averaging recovers a common affine fixed point', () => {
  const v = [2, -3], order = 5;
  const act = (g, x) => {
    const a = 2 * Math.PI * g / order;
    return [Math.cos(a) * x[0] - Math.sin(a) * x[1],
      Math.sin(a) * x[0] + Math.cos(a) * x[1]];
  };
  const b = g => v.map((x, i) => x - act(g, v)[i]);
  const average = [0, 0];
  for (let g = 0; g < order; g++) b(g).forEach((x, i) => average[i] += x / order);
  for (let g = 0; g < order; g++) {
    const moved = act(g, average).map((x, i) => x + b(g)[i]);
    moved.forEach((x, i) => assert(Math.abs(x - average[i]) < 1e-12));
  }
});
