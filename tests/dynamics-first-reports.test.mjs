import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const files = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(file => file.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  assert(!files.has(id), `Duplicate tree ID ${id}`);
  files.set(id, `trees/${file}`);
}
const note = id => read(files.get(id));
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const record = json('research/icm2026-dynamics-first-reports.json');
const coverage = json('research/icm2026-dynamics-section-coverage.json');
const snapshots = json('research/icm2026-dynamics-first-reports-snapshots.json');

test('the first Dynamics batch follows the published chapter order and counts joint talks once', () => {
  assert.equal(record.subject, '0069');
  assert.deepEqual(record.reports.map(row => row.outline), ['3000', '3100', '3200']);
  assert.deepEqual(record.reports.map(row => row.doi), [
    '10.1137/25M1805564', '10.1137/25M1810787', '10.1137/25M1804078',
  ]);
  assert.deepEqual(coverage.reports.slice(0, 3).map(row => row.doi), record.reports.map(row => row.doi));
  assert.equal(coverage.reports.length, 10);
  assert.equal(coverage.counts.primary_reports, 10);
  const integrated = coverage.reports.filter(row => row.outline).length;
  assert(integrated >= 3);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, integrated);
  assert.equal(coverage.counts.cross_listed_reports_with_existing_topic, 3);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 10 - integrated);
  assert.equal(coverage.reports[2].speakers.length, 2);
  assert.equal(new Set(coverage.reports.map(row => row.doi)).size, 10);
  const topics = listedTopics(note('0069'));
  const leading = coverage.editorial_leading_topics.map(row => row.outline);
  assert.deepEqual(topics.slice(0, leading.length), leading);
  for (const row of [...coverage.reports, ...coverage.cross_listed_reports]) {
    assert.equal(row.on_subject_landing, Boolean(row.outline && topics.includes(row.outline)), row.doi);
    if (row.outline) assert.equal(topics.filter(id => id === row.outline).length, 1, row.doi);
  }
  for (const id of ['0V00', '0P00', '007B', '007C']) assert(topics.includes(id), `Lost earlier topic ${id}`);
});

test('every recorded Section 9 speaker belongs to exactly one primary or cross-listed report', () => {
  const roster = json('research/icm2026-section-nine-roster.json');
  const reports = [...coverage.reports, ...coverage.cross_listed_reports];
  const ids = reports.flatMap(row => row.speaker_ids);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), roster.speakers.map(row => row.speaker_id).sort());
  assert.equal(coverage.reports.flatMap(row => row.speakers).length, 12);
  assert.equal(coverage.cross_listed_reports.flatMap(row => row.speakers).length, 3);
  assert.deepEqual(coverage.cross_listed_reports.map(row => row.outline).sort(), ['007C', '2D00', '2H00']);
  assert.deepEqual(coverage.reports.filter(row => row.speakers.length === 2).map(row => row.doi),
    ['10.1137/25M1804078', '10.1137/25M1805928']);
  assert.deepEqual(reports.map(row => row.doi).sort(), [...new Set(reports.map(row => row.doi))].sort());
});

test('new Dynamics notes have source records, acyclic prerequisites and reachable atomic pages', () => {
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  const titles = new Map();
  for (const id of files.keys()) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  assert.equal(new Set(snapshots.notes.map(row => row.id)).size, snapshots.notes.length);
  for (const report of record.reports) {
    for (const key of ['reading_scope', 'question', 'proof_scope', 'claim_sources', 'license', 'version_url'])
      assert(report[key], `${report.outline}: missing ${key}`);
    assert(report.remaining_branches?.length, report.outline);
    assert(note(report.reference).includes(report.doi), report.reference);
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      queue.push(...[...note(id).matchAll(/\]\(([^)\s]+)\)/g)].map(match => match[1]));
    }
    const branch = snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
    for (const row of branch) {
      const text = note(row.id);
      assert(reached.has(row.id), `Unreachable ${row.id}`);
      assert.equal(digest(text), row.sha256, row.id);
      assert.equal(digest(text), required.pages[row.id].sha256, row.id);
      assert(!text.includes('\\strong{相关页面}'), row.id);
      if (!['Outline', 'Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title), [row.id], row.title);
        assert(report.proof_scope[row.id] && report.claim_sources[row.id], row.id);
        assert.deepEqual(audit.prerequisites[row.id], record.prerequisites[row.id], row.id);
      }
      const links = bodyLinks(text).map(link => link.target);
      for (const target of record.prerequisites[row.id]) {
        assert(links.includes(target), `${row.id}: missing dependency ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), target);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(branch.some(row => row.id === id), `Unrecorded ${id}`);
    assert(note(report.outline).split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), 'A research overview must not become a catalogue');
  }
  const active = new Set(), done = new Set();
  function visit(id, route = []) {
    assert(!active.has(id), `Prerequisite cycle: ${[...route, id].join(' -> ')}`);
    if (done.has(id)) return;
    active.add(id);
    for (const target of audit.prerequisites[id] ?? []) {
      assert(files.has(target), `${id}: missing prerequisite ${target}`);
      visit(target, [...route, id]);
    }
    active.delete(id);
    done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id => visit(id));
});

test('independent fair vertex labels give independent edge differences on finite forests', () => {
  const forests = [
    {vertices: 2, edges: [[0, 1]], components: 1},
    {vertices: 5, edges: [[0, 1], [0, 2], [1, 3], [1, 4]], components: 1},
    {vertices: 8, edges: [[0, 1], [1, 2], [3, 4], [3, 5], [5, 6]], components: 3},
  ];
  for (const {vertices, edges, components} of forests) {
    const counts = Array(2 ** edges.length).fill(0);
    for (let labels = 0; labels < 2 ** vertices; labels++) {
      const differences = edges.reduce((value, [a, b], i) =>
        value | ((((labels >> a) ^ (labels >> b)) & 1) << i), 0);
      counts[differences]++;
    }
    assert(counts.every(count => count === 2 ** components));
    const entropy = -counts.reduce((sum, count) => {
      const probability = count / 2 ** vertices;
      return sum + probability * Math.log(probability);
    }, 0);
    assert(Math.abs(entropy - edges.length * Math.log(2)) < 1e-12);
  }
  // A cycle has a parity constraint, explaining why the forest hypothesis matters.
  for (let labels = 0; labels < 8; labels++) {
    const a = labels & 1, b = (labels >> 1) & 1, c = (labels >> 2) & 1;
    assert.equal((a ^ b) ^ (b ^ c) ^ (c ^ a), 0);
  }
});

test('specular reflection preserves speed and tangential velocity and reverses the normal component', () => {
  const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
  for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) {
    const n = [Math.cos(i), Math.sin(i)], t = [-n[1], n[0]];
    const v = [Math.cos(j / 3), Math.sin(j / 3)];
    const reflected = v.map((x, k) => x - 2 * dot(v, n) * n[k]);
    assert(Math.abs(dot(reflected, reflected) - dot(v, v)) < 1e-12);
    assert(Math.abs(dot(reflected, t) - dot(v, t)) < 1e-12);
    assert(Math.abs(dot(reflected, n) + dot(v, n)) < 1e-12);
  }
});

test('the generalized Henon map has the stated inverse and signed area factor', () => {
  const polynomial = x => x * x + 0.3;
  for (const b of [-2, -0.1, 0.2, 1]) for (const x of [-3, -0.2, 0, 2])
    for (const y of [-1, 0.4, 3]) {
      const X = polynomial(x) - y, Y = b * x;
      assert(Math.abs(Y / b - x) < 1e-12);
      assert(Math.abs(polynomial(Y / b) - X - y) < 1e-12);
      const derivative = [[2 * x, -1], [b, 0]];
      assert.equal(derivative[0][0] * derivative[1][1] - derivative[0][1] * derivative[1][0], b);
    }
});

test('the elliptic billiard quadratic integral survives free motion and reflection', () => {
  const a = 3, b = 2, c2 = a * a - b * b;
  const invariant = (x, v) => (x[0] * v[1] - x[1] * v[0]) ** 2 - c2 * v[1] ** 2;
  for (let j = 0; j < 24; j++) for (let k = 0; k < 24; k++) {
    const x = [a * Math.cos(j), b * Math.sin(j)];
    const rawNormal = [x[0] / a ** 2, x[1] / b ** 2];
    const norm = Math.hypot(...rawNormal), n = rawNormal.map(value => value / norm);
    const v = [Math.cos(k / 3), Math.sin(k / 3)];
    const dot = v[0] * n[0] + v[1] * n[1];
    const reflected = v.map((value, i) => value - 2 * dot * n[i]);
    assert(Math.abs(invariant(x, reflected) - invariant(x, v)) < 1e-11);
    assert(Math.abs(invariant(x.map((value, i) => value + 1.7 * v[i]), v) - invariant(x, v)) < 1e-11);
  }
});

test('the circular inner-length action has the negative chord-length convention', () => {
  for (const radius of [0.5, 1, 3]) for (let n = 3; n <= 24; n++)
    for (let m = 1; m < n / 2; m++) {
      let perimeter = 0;
      for (let j = 0; j < n; j++) {
        const a = 2 * Math.PI * m * j / n, b = 2 * Math.PI * m * (j + 1) / n;
        perimeter += radius * Math.hypot(Math.cos(a) - Math.cos(b), Math.sin(a) - Math.sin(b));
      }
      const beta = -2 * radius * Math.sin(Math.PI * m / n);
      assert(Math.abs(-perimeter / n - beta) < 1e-12);
      const secondDerivative = 2 * radius * Math.PI ** 2 * Math.sin(Math.PI * m / n);
      assert(secondDerivative > 0);
    }
});
