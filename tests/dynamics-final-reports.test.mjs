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
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const record = json('research/icm2026-dynamics-final-reports.json');
const coverage = json('research/icm2026-dynamics-section-coverage.json');
const snapshots = json('research/icm2026-dynamics-final-reports-snapshots.json');

test('all ten primary reports and three cross-listed topics are present exactly once', () => {
  assert.equal(record.subject, '0069');
  assert.deepEqual(record.reports.map(row => row.outline), ['3600', '3700', '3800', '3900']);
  assert.deepEqual(record.reports.map(row => row.doi), [
    '10.1137/25M1807101', '10.1137/25M1811756', '10.1137/25M1804315', '10.1137/25M1805928',
  ]);
  assert.deepEqual(coverage.reports.slice(6).map(row => row.doi), record.reports.map(row => row.doi));
  assert.equal(coverage.counts.primary_reports, 10);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, 10);
  assert.equal(coverage.counts.cross_listed_reports_with_existing_topic, 3);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 0);
  assert.equal(coverage.counts.primary_speakers, 12);
  assert.equal(coverage.counts.joint_reports, 2);
  const expected = ['3000', '3100', '3200', '3300', '3400', '3500', '3600', '3700', '3800', '3900'];
  const topics = listedTopics(note('0069'));
  assert.deepEqual(topics.filter(id => expected.includes(id)), expected);
  for (const report of [...coverage.reports, ...coverage.cross_listed_reports]) {
    assert(report.outline && files.has(report.outline), report.doi);
    assert(report.reference && files.has(report.reference), report.doi);
    assert.equal(topics.filter(id => id === report.outline).length, 1, report.doi);
    assert.equal(report.on_subject_landing, true, report.doi);
  }
  for (const id of ['0V00', '0P00', '007B', '007C', '2D00', '2H00'])
    assert(topics.includes(id), `Lost existing topic ${id}`);
});

test('each final-batch page is individually recorded, reachable and source-bound', () => {
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
    assert(Array.isArray(report.remaining_branches), report.outline);
    assert(report.remaining_branches.length || report.unexpanded_deep_proofs?.length,
      `${report.outline}: record the boundary of locally reproduced proofs`);
    assert(note(report.reference).includes(report.doi), report.reference);
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      // Bibliography links in source metadata are also reader-visible routes.
      queue.push(...[...note(id).matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)].map(link => link[1]));
    }
    const branch = snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
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
        assert(links.includes(target), `${row.id}: missing dependency ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), target);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(branch.some(row => row.id === id), `Unrecorded ${id}`);
    assert(note(report.outline).split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), 'The research overview must tell a mathematical narrative');
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
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const scale = (a, t) => a.map(x => x * t);
const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const inverse = a => [a[0] / (a[0] ** 2 + a[1] ** 2), -a[1] / (a[0] ** 2 + a[1] ** 2)];
const sameComplex = (a, b) => a.forEach((x, i) => near(x, b[i]));

test('the horseshoe statement retains its fixed period bound and little sets have distinct base notation', () => {
  assert(note('360L').includes('r_n\\leq B'));
  assert(note('3605').includes('[Mandelbrot 集](3602)'));
  assert(note('3605').includes('有限吸引周期'));
  assert(note('360C').includes('K_j=f^j(K_*)'));
  assert(note('3609').includes('[拟共形同胚](3907)'));
});

test('quadratic fixed-point multipliers give the cardioid parameter with the correct factors', () => {
  for (const lambda of [[0, 0], [1, 0], [-1, 0], [0, 1], [0.3, -0.4]]) {
    const z = scale(lambda, 0.5);
    const c = add(scale(lambda, 0.5), scale(mul(lambda, lambda), -0.25));
    sameComplex(add(mul(z, z), c), z);
    sameComplex(scale(z, 2), lambda);
  }
  sameComplex(add([0.5, 0], [-0.25, 0]), [0.25, 0]);
});

test('the Joukowski map intertwines squaring and the quadratic map at minus two', () => {
  const J = w => add(w, inverse(w));
  for (const w of [[2, 0], [0, 2], [1, 1], [-0.3, 0.7]])
    sameComplex(J(mul(w, w)), add(mul(J(w), J(w)), [-2, 0]));
});

test('the two affine Cantor branches preserve the stationary mean and variance but not each measure separately', () => {
  const mean = 0.5, variance = 0.125;
  const branchMeans = [mean / 3, (mean + 2) / 3];
  near((branchMeans[0] + branchMeans[1]) / 2, mean);
  near(variance / 9 + ((branchMeans[0] - mean) ** 2 + (branchMeans[1] - mean) ** 2) / 2, variance);
  assert.notEqual(branchMeans[0], mean);
  assert.notEqual(branchMeans[1], mean);
});

test('coboundary Birkhoff sums telescope and hence have degenerate square-root fluctuations', () => {
  const T = x => (x + 1) % 7, u = x => x * x;
  const phi = x => u(T(x)) - u(x);
  for (let x = 0; x < 7; x++) for (const N of [1, 2, 7, 13, 100]) {
    let state = x, sum = 0;
    for (let n = 0; n < N; n++) { sum += phi(state); state = T(state); }
    assert.equal(sum, u(state) - u(x));
    assert(Math.abs(sum) <= 36);
  }
});

test('skew-product iteration uses the full cocycle sum', () => {
  const T = x => (2 * x) % 7, phi = x => x - 3;
  for (let x = 0; x < 7; x++) {
    let state = x, fiber = 5, sum = 0;
    for (let n = 1; n <= 8; n++) {
      const step = phi(state);
      fiber += step;
      sum += step;
      state = T(state);
      assert.equal(fiber, 5 + sum);
      assert.equal(state, (2 ** n * x) % 7);
    }
  }
});

test('circle Schwarz reflection is antiholomorphic, fixes the circle and is an involution', () => {
  const center = [0.5, -0.25], radius = 2;
  const reflect = z => {
    const w = add(z, scale(center, -1));
    return add(center, scale(inverse([w[0], -w[1]]), radius ** 2));
  };
  for (const z of [[4, 1], [-2, -3], [0, 0]]) sameComplex(reflect(reflect(z)), z);
  for (const angle of [0, 0.4, 1, 2, 3]) {
    const z = add(center, [radius * Math.cos(angle), radius * Math.sin(angle)]);
    sameComplex(reflect(z), z);
  }
});

test('the deleted cubic correspondence retains diagonal critical limits', () => {
  const Q = z => z ** 3 - 3 * z;
  for (const z of [-3, -1, 0, 1, 2]) for (const w of [-2, -1, 0, 1, 4]) {
    if (z !== w) near((Q(w) - Q(z)) / (w - z), w ** 2 + w * z + z ** 2 - 3);
  }
  for (const z of [-1, 1]) near(z ** 2 + z * z + z ** 2 - 3, 0);
});
