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
const record = json('research/icm2026-dynamics-second-reports.json');
const coverage = json('research/icm2026-dynamics-section-coverage.json');
const snapshots = json('research/icm2026-dynamics-second-reports-snapshots.json');

test('the second Dynamics batch continues the official chapter order without losing earlier topics', () => {
  assert.equal(record.subject, '0069');
  assert.deepEqual(record.reports.map(row => row.outline), ['3300', '3400', '3500']);
  assert.deepEqual(record.reports.map(row => row.doi), [
    '10.1137/25M1807071', '10.1137/25M1807964', '10.1137/25M1807186',
  ]);
  assert.deepEqual(coverage.reports.slice(3, 6).map(row => row.doi), record.reports.map(row => row.doi));
  const integrated = coverage.reports.filter(row => row.outline).length;
  assert(integrated >= 6);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, integrated);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 10 - integrated);
  assert.equal(coverage.counts.cross_listed_reports_with_existing_topic, 3);
  const topics = listedTopics(note('0069'));
  const expected = ['3000', '3100', '3200', '3300', '3400', '3500'];
  assert.deepEqual(topics.filter(id => expected.includes(id)), expected);
  for (const row of [...coverage.reports, ...coverage.cross_listed_reports]) {
    assert.equal(row.on_subject_landing, Boolean(row.outline && topics.includes(row.outline)), row.doi);
    if (row.outline) assert.equal(topics.filter(id => id === row.outline).length, 1, row.doi);
  }
  for (const id of ['0V00', '0P00', '007B', '007C', '2D00', '2H00'])
    assert(topics.includes(id), `Lost earlier topic ${id}`);
});

test('second-batch pages retain sources, atomic prerequisites, unique titles and narrative reachability', () => {
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

const near = (a, b, tolerance = 1e-10) => assert(Math.abs(a - b) < tolerance, `${a} != ${b}`);

test('a finite Markov model has the Perron entropy and normalized first-return series', () => {
  const phi = (1 + Math.sqrt(5)) / 2;
  const P = [[1 / phi, 1 / phi ** 2], [1, 0]];
  const pi = [phi ** 2 / (phi ** 2 + 1), 1 / (phi ** 2 + 1)];
  for (const row of P) near(row.reduce((a, b) => a + b, 0), 1);
  for (let j = 0; j < 2; j++) near(pi.reduce((s, p, i) => s + p * P[i][j], 0), pi[j]);
  const entropy = -pi.reduce((s, p, i) =>
    s + p * P[i].reduce((t, q) => t + (q ? q * Math.log(q) : 0), 0), 0);
  near(entropy, Math.log(phi));
  near(1 / phi + 1 / phi ** 2, 1);
  // The two first-return loops have lengths one and two, so their generating function is entire.
  const meanReturn = 1 / phi + 2 / phi ** 2;
  near(meanReturn, 1 / pi[0]);
});

test('irreducibility alone does not remove the periodic obstruction to mixing', () => {
  const P = [[0, 1], [1, 0]], observable = [1, -1];
  let evolved = [...observable];
  for (let n = 0; n < 12; n++) {
    near((observable[0] * evolved[0] + observable[1] * evolved[1]) / 2, (-1) ** n);
    evolved = P.map(row => row.reduce((s, p, j) => s + p * evolved[j], 0));
  }
});

const multiply = (A, B) => A.map(row => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
const determinant3 = A => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1])
  - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0])
  + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

test('commuting integral automorphisms preserve each other\'s iterated orbits', () => {
  const A = [[0, 0, -1], [1, 0, 3], [0, 1, 0]];
  const B = A.map((row, i) => row.map((x, j) => x - Number(i === j)));
  assert.equal(determinant3(A), -1);
  assert.equal(determinant3(B), 1);
  assert.deepEqual(multiply(A, B), multiply(B, A));
  let power = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let n = 0; n < 8; n++) {
    assert.deepEqual(multiply(B, power), multiply(power, B));
    power = multiply(power, A);
  }
});

test('root commutators recover the missing direction on a Lyapunov wall', () => {
  const root = (i, j, t) => Array.from({length: 3}, (_, r) =>
    Array.from({length: 3}, (_, c) => Number(r === c) + (r === i && c === j ? t : 0)));
  for (const s of [-2, -0.5, 0, 1, 3]) for (const t of [-3, 0, 0.25, 2]) {
    const commutator = multiply(multiply(multiply(root(0, 2, s), root(2, 1, t)), root(0, 2, -s)), root(2, 1, -t));
    assert.deepEqual(commutator, root(0, 1, s * t));
  }
});

test('an unweighted full-shift operator must be normalized before it preserves probability', () => {
  for (const alphabet of [2, 3, 5]) {
    const values = Array.from({length: alphabet}, (_, i) => i * i - 2);
    const average = values.reduce((s, x) => s + x, 0) / alphabet;
    near(Array(alphabet).fill(1).reduce((s, x) => s + x / alphabet, 0), 1);
    near(values.reduce((s, x) => s + x / alphabet, 0), average);
    assert.equal(Array(alphabet).fill(1).reduce((s, x) => s + x, 0), alphabet);
  }
});

test('projectivizing a linear system gives the correct Riccati coefficients', () => {
  for (const [alpha, beta, gamma, delta] of [[1, 2, 3, 4], [0, 1, -2, 0], [-3, 0, 0, 2]]) {
    for (const u of [-2, -0.5, 0, 1, 3]) for (const v of [-2, -0.5, 1, 3]) {
      const y = u / v, du = alpha * u + beta * v, dv = gamma * u + delta * v;
      near((du * v - u * dv) / v ** 2, -gamma * y ** 2 + (alpha - delta) * y + beta);
    }
  }
});

test('a linear fractional coordinate change preserves the quadratic Riccati form', () => {
  const f = y => 2 * y ** 2 - 3 * y + 1;
  const [a, b, c, d] = [2, 1, 1, 1], determinant = a * d - b * c;
  for (const y of [-3, -0.3, 0, 0.2, 1, 4]) {
    const z = (a * y + b) / (c * y + d);
    const dz = determinant * f(y) / (c * y + d) ** 2;
    const transformed = (2 * (d * z - b) ** 2 - 3 * (d * z - b) * (a - c * z) + (a - c * z) ** 2) / determinant;
    near(dz, transformed);
  }
});
