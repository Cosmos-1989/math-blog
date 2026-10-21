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
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const files = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(file => file.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  assert(!files.has(id), `Duplicate tree ID ${id}`);
  files.set(id, `trees/${file}`);
}
const note = id => read(files.get(id));
const record = json('research/icm2026-pde-second-reports.json');
const snapshots = json('research/icm2026-pde-second-reports-snapshots.json');
const coverage = json('research/icm2026-pde-section-coverage.json');

test('the second PDE batch follows the published order and preserves first-batch navigation', () => {
  assert.equal(record.subject, '006A');
  assert.deepEqual(record.reports.map(row => row.outline), ['4400', '4500', '4600']);
  assert.deepEqual(record.reports.map(row => row.doi), [
    '10.1137/25M1804406', '10.1137/25M1807137', '10.1137/25M1805783',
  ]);
  assert.deepEqual(coverage.reports.slice(4, 7).map(row => row.doi), record.reports.map(row => row.doi));
  const topics = listedTopics(note('006A'));
  assert.deepEqual(topics.slice(0, 10), [
    '2A00', '2700', '2C00', '4000', '4100', '4200', '4300', '4400', '4500', '4600',
  ]);
  for (const id of ['2G00', '1200', '2I00']) assert.equal(topics.filter(x => x === id).length, 1);
  for (const report of record.reports) {
    const entry = coverage.reports.find(row => row.doi === report.doi);
    assert.equal(entry.outline, report.outline);
    assert.equal(entry.on_subject_landing, true);
    assert.equal(entry.status, 'selected-branches-integrated');
  }
});

test('every atom has distinct content, an explicit source and linked prerequisites', () => {
  const required = json('research/prerequisite-required-links.json');
  const audit = json('research/site-evergreen-audit.json');
  const titles = new Map();
  for (const id of files.keys()) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  assert.equal(new Set(snapshots.notes.map(row => row.id)).size, snapshots.notes.length);
  for (const report of record.reports) {
    for (const key of ['question', 'reading_scope', 'proof_scope', 'claim_sources', 'version_url', 'license'])
      assert(report[key], `${report.outline}: missing ${key}`);
    assert(Array.isArray(report.remaining_branches), report.outline);
    assert(Array.isArray(report.unexpanded_deep_proofs), report.outline);
    assert(note(report.reference).includes(report.doi), report.reference);
    const branch = snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      queue.push(...Array.from(note(id).matchAll(/\]\(([^)]+)\)|\\transclude\{([^}]+)\}/g), match => match[1] ?? match[2]));
    }
    for (const row of branch) {
      const text = note(row.id);
      assert(reached.has(row.id), `Unreachable ${row.id}`);
      assert.equal(hash(text), row.sha256, row.id);
      assert.equal(hash(text), required.pages[row.id].sha256, row.id);
      assert(!text.includes('\\strong{相关页面}'), row.id);
      if (!['Outline', 'Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title), [row.id], row.title);
        assert(report.proof_scope[row.id] && report.claim_sources[row.id], row.id);
        assert.deepEqual(audit.prerequisites[row.id], record.prerequisites[row.id], row.id);
      }
      const links = bodyLinks(text).map(link => link.target);
      for (const target of record.prerequisites[row.id]) {
        assert(links.includes(target), `${row.id}: absent prerequisite ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), target);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(branch.some(row => row.id === id), `Unrecorded ${id}`);
    assert(note(report.outline).split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), 'An overview should tell a mathematical narrative');
  }
  const active = new Set(), done = new Set();
  function visit(id, route = []) {
    assert(!active.has(id), `Prerequisite cycle: ${[...route, id].join(' -> ')}`);
    if (done.has(id)) return;
    active.add(id);
    for (const target of audit.prerequisites[id] ?? []) {
      assert(files.has(target), `${id}: missing ${target}`);
      visit(target, [...route, id]);
    }
    active.delete(id);
    done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id => visit(id));
});

test('independent mathematical reviews refer to the exact current sources', () => {
  for (const name of ['deng', 'elgindi', 'faure']) {
    const review = json(`research/pde-${name}-review.json`);
    assert.equal(review.result, 'pass', name);
    assert.deepEqual(review.open_findings, [], name);
    assert(review.reviewed_files.length > 0, name);
    const report = record.reports.find(row => row.reference === `icm2026-${name}`);
    for (const row of snapshots.notes.filter(row => row.id.startsWith(report.prefix)))
      assert(review.reviewed_files.some(file => file.id === row.id), `${name}: unreviewed ${row.id}`);
    for (const row of review.reviewed_files) {
      assert.equal(row.path, files.get(row.id), row.id);
      assert.equal(row.sha256, hash(read(row.path)), `${name}: stale review ${row.id}`);
    }
  }
});

const near = (a, b, tolerance = 1e-10) => assert(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);

test('the hard-sphere collision reflection preserves momentum, energy and reversibility', () => {
  for (const [v, w, direction] of [
    [[1, 2, -3], [-2, 0, 1], [1, 0, 0]],
    [[0, -1, 4], [2, 3, -1], [1, 2, 3]],
    [[3, 3, 3], [3, 3, 3], [-2, 1, 4]],
  ]) {
    const length = Math.sqrt(dot(direction, direction));
    const normal = direction.map(x => x / length);
    const collide = (a, b) => {
      const impulse = dot(a.map((x, i) => x - b[i]), normal);
      return [a.map((x, i) => x - impulse * normal[i]), b.map((x, i) => x + impulse * normal[i])];
    };
    const [p, q] = collide(v, w), [backV, backW] = collide(p, q);
    v.forEach((x, i) => {
      near(p[i] + q[i], x + w[i]);
      near(backV[i], x);
      near(backW[i], w[i]);
    });
    near(dot(p, p) + dot(q, q), dot(v, v) + dot(w, w));
  }
});

test('Couette characteristics solve the transport equation with the correct time sign', () => {
  for (const t of [0, 0.25, 2]) for (const x of [-1, 0.5, 2]) for (const y of [-2, 0, 1]) {
    const phase = x - t * y;
    const fx = Math.cos(phase) * Math.exp(-y * y);
    const ft = -y * Math.cos(phase) * Math.exp(-y * y);
    near(ft + y * fx, 0);
    const fy = (-t * Math.cos(phase) - 2 * y * Math.sin(phase)) * Math.exp(-y * y);
    near(fy + t * fx, -2 * y * Math.sin(phase) * Math.exp(-y * y));
  }
});

test('Euler self-similar vorticity gives the same exponent to transport and stretching', () => {
  for (const lambda of [0.5, 1, 2.5]) {
    const vorticity = -1, velocity = lambda - 1, spatialDerivative = -lambda;
    near(vorticity - 1, velocity + spatialDerivative + vorticity);
    near(vorticity - 1, vorticity + spatialDerivative + velocity);
  }
});
