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
const record = JSON.parse(read('research/icm2026-geometry-closing-kakeya.json'));
const snapshots = JSON.parse(read('research/icm2026-geometry-closing-kakeya-snapshots.json'));
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree'))
  .map(file => [path.basename(file, '.tree'), 'trees/' + file]));
const note = id => read(files.get(id));
const targets = id => bodyLinks(note(id)).map(link => link.target);
const navigationTargets = id => [...note(id).matchAll(/\]\(([A-Za-z0-9-]+)\)/g)]
  .map(match => match[1]);

test('geometry coverage registers the three reports without duplicating topics', () => {
  assert.deepEqual(record.reports.map(row => row.speaker),
    ['Otis Chodosh', 'Kei Irie', 'Joshua Zahl']);
  const topics = listedTopics(note('0065'));
  assert.deepEqual(topics.slice(0, 2), ['2C00', '2600']);
  const coverage = JSON.parse(read('research/icm2026-geometry-section-coverage.json'));
  assert.equal(coverage.counts.primary_reports_with_existing_topic, 7);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 8);
  for (const report of record.reports) {
    assert.equal(topics.filter(id => id === report.outline).length, 1);
    const entry = coverage.reports.find(row => row.speakers.includes(report.speaker));
    assert.equal(entry.outline, report.outline);
    assert.equal(entry.doi, report.doi);
    assert.equal(entry.on_subject_landing, true);
    assert(report.source_url && report.reading_scope && report.question);
    assert.equal(report.coverage_status, 'selected-branches-integrated');
    assert(report.deferred.length);
  }
});

test('reviewed pages are reachable, hashed and linked to atomic prerequisites', () => {
  const reached = new Set(), queue = record.reports.map(row => row.outline);
  while (queue.length) {
    const id = queue.pop();
    if (reached.has(id) || !files.has(id)) continue;
    reached.add(id);
    queue.push(...navigationTargets(id));
  }
  const snapshotIds = new Set(snapshots.notes.map(row => row.id));
  for (const report of record.reports) {
    const source = note(report.outline);
    assert(source.includes('\\taxon{Outline}'));
    assert(source.split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(source));
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(snapshotIds.has(id), 'Unreviewed note: ' + id);
  }
  for (const row of snapshots.notes) {
    assert(reached.has(row.id), 'Unreachable: ' + row.id);
    assert.equal(crypto.createHash('sha256').update(note(row.id)).digest('hex'), row.sha256, row.id);
    const prerequisites = record.prerequisites[row.id];
    assert.equal(prerequisites.length, new Set(prerequisites).size);
    for (const target of prerequisites) {
      assert(targets(row.id).includes(target), row.id + ' missing ' + target);
      assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), target);
    }
  }
  assert(targets('2I00').includes('1211'), 'Reuse the existing Wang-Zahl theorem');
  assert(targets('2H07').includes('140E'), 'Reuse the ECH Weyl theorem');
  assert(targets('2G03').includes('2E02'), 'Reuse the first variation calculation');
});

test('scoped prerequisite graph has no circular proof dependencies', () => {
  const done = new Set(), active = new Set();
  function visit(id, trail = []) {
    if (done.has(id) || !Object.hasOwn(record.prerequisites, id)) return;
    assert(!active.has(id), [...trail, id].join(' -> '));
    active.add(id);
    for (const target of record.prerequisites[id]) visit(target, [...trail, id]);
    active.delete(id);
    done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id => visit(id));
});

test('theorem assumptions and research boundaries remain explicit', () => {
  assert.match(note('2G03'), /紧支撑/);
  assert.match(note('2G0O'), /n\\le\s*5/);
  assert.match(note('2G0P'), /Baire/);
  assert.match(note('2G0D'), /1\/4/);
  assert.match(note('2H01'), /h:Y\\to\\mathbb R_\{\\geq\s*0\}/);
  assert.match(note('2H07'), /允许形式退化/);
  assert.match(note('2H0G'), /Assumption 1.3/);
  assert.match(note('2H0M'), /公告/);
  assert.match(note('2H0Q'), /c\^\{\(m-1\)\/2\}/);
  assert.match(note('2H0R'), /3\\leq\s*m\\leq\s*7/);
  assert.match(note('2H0R'), /bumpy/);
  assert.match(note('2I02'), /\\taxon\{Conjecture\}/);
  assert.match(note('2I03'), /\\geq A\^\{-\(n-1\)\}\\lambda\^nS/);
  assert.match(note('2I0C'), /连续/);
  assert.match(note('2I0K'), /\\delta\^2\\mu\^2/);
  assert.match(note('2I0J'), /j=1\}\^k/);
  assert.match(note('2I0J'), /\\int_\\Omega m\\geq c_1\\int m/);
  assert.match(note('2I05'), /极大/);
});

test('dual-number lines lie in the claimed set and have distinct parameters', () => {
  for (const p of [3, 5]) {
    const mod = n => ((n % p) + p) % p;
    const lines = new Set();
    for (let a = 0; a < p; a++) for (let b = 0; b < p; b++)
      for (let c = 0; c < p; c++) for (let d = 0; d < p; d++) {
        if (mod(a * d - b * c) !== 1) continue;
        for (let e = 0; e < p; e++) {
          const points = [];
          for (let u = 0; u < p; u++) for (let v = 0; v < p; v++) {
            const x1 = mod(a + c * u), y1 = mod(b + d * u);
            const x2 = mod(e * x1 + c * v), y2 = mod(e * y1 + d * v);
            assert.equal(mod(x1 * y2 - x2 * y1), v);
            points.push([x1, x2, y1, y2, u, v].join(','));
          }
          assert.equal(new Set(points).size, p * p);
          lines.add(points.sort().join(';'));
        }
      }
    assert.equal(lines.size, p * p * (p * p - 1));
  }
});

test('Heisenberg line identity holds for complex parameters', () => {
  const multiply = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
  for (const a of [-2, 0, 3]) for (const b of [-1, 2])
    for (const c of [0.25, 2]) for (const d of [-3, 1]) {
      const s = [0.4, -0.7], y = [c + b * s[0], d + b * s[1]];
      const z = multiply([c, -d], s);
      z[0] += a;
      assert(Math.abs(multiply(s, [y[0], -y[1]])[1] - z[1]) < 1e-12);
    }
});

test('critical tube and broad/narrow exponents have the stated scaling', () => {
  for (let n = 2; n <= 8; n++) {
    assert(Math.abs(n - (n - 1) * (n / (n - 1))) < 1e-12);
    assert(n - (n - 1) * (n / (n - 1) + 0.1) < 0);
  }
  const d = (4 ** 2 + 3 ** 2 + 4 - 3) / 8;
  assert.equal(d, 13 / 4);
  assert.equal(4 - d, 3 / 4);
  for (const delta of [0.1, 0.01]) {
    const mu = delta ** (-2 / 3);
    assert(Math.abs(delta ** 2 * mu ** 2 - 1 / mu) < 1e-12);
    const rho = Math.sqrt(delta), c = 0.4;
    const jacobian = rho / (delta * c * c);
    assert(Math.abs(jacobian * delta * rho * c * c - rho * rho) < 1e-12);
  }
});

test('Gauss scalar contraction and hyperbolic spectral threshold agree', () => {
  for (const principal of [[1, 2], [1, -1, 0], [2, 3, -5]]) {
    const H = principal.reduce((a, b) => a + b, 0);
    const norm = principal.reduce((a, b) => a + b * b, 0);
    let intrinsic = 0;
    for (let i = 0; i < principal.length; i++)
      for (let j = 0; j < principal.length; j++)
        if (i !== j) intrinsic += principal[i] * principal[j];
    assert.equal(intrinsic, H * H - norm);
  }
  assert.equal(4 / 4 - 1, 0);
  assert(5 / 4 - 1 > 0);
});

test('ellipsoid radial comparison preserves its periodic time', () => {
  const a = [2, 3, 6], q = 6, p = [3, 2, 1], weights = [0.2, 0.3, 0.5];
  const Qb = weights.reduce((sum, w, i) => sum + w * a[i] * p[i] / q, 0);
  assert.equal(Qb, 1);
  p.forEach((value, i) => assert.equal(q / a[i], value));
});
