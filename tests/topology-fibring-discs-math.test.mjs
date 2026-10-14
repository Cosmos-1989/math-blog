import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const record = JSON.parse(read('research/icm2026-topology-fibring-discs.json'));
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const note = id => read(files.get(id));

test('three distinct report entrances and complete batch registration', () => {
  assert.deepEqual(record.reports.map(report => report.outline), ['1700', '1800', '1900']);
  for (const report of record.reports) {
    assert(note('0066').includes(`](${report.outline})`));
    assert(note(report.reference).includes(report.source_url) || note(report.reference).includes(report.proceedings)
      || report.source_url.replace('/doi/full/', '/doi/').endsWith(note(report.reference).match(/https:\/\/doi.org\/([^)]*)/)[1]));
  }
  for (const [id, file] of files) {
    if (!/trees\/math\/topology\/(virtual-fibring|disc-presheaves|fibered-surface-links)\//.test(file)) continue;
    assert(Object.hasOwn(record.prerequisites, id), `unregistered ${id}`);
  }
});

test('finite cyclic group invariant-subspace trace has finite-index scaling', () => {
  for (let order = 1; order <= 16; order++) {
    const diagonalProjection = 1 / order;
    const groupDimension = diagonalProjection;
    const trivialSubgroupDimension = Array(order).fill(diagonalProjection).reduce((a, b) => a + b, 0);
    assert(Math.abs(trivialSubgroupDimension - order * groupDimension) < 1e-12);
  }
});

test('formal Novikov geometric inverse works degree by degree', () => {
  const multiply = (a, b, degree) => Array.from({length: degree + 1}, (_, n) =>
    Array.from({length: n + 1}, (_, j) => (a[j] ?? 0) * (b[n - j] ?? 0)).reduce((x, y) => x + y, 0));
  for (let degree = 1; degree < 15; degree++) {
    const q = [0, 2, -1], inverse = Array(degree + 1).fill(0);
    let power = [1];
    for (let n = 0; n <= degree; n++) {
      power.forEach((x, i) => { inverse[i] += (n % 2 ? -1 : 1) * x; });
      power = multiply(power, q, degree);
    }
    assert.deepEqual(multiply([1, 2, -1], inverse, degree), [1, ...Array(degree).fill(0)]);
  }
});

test('two-point configuration coordinates and reconstruction', () => {
  for (let d = 1; d <= 8; d++) {
    const x = Array.from({length: d}, (_, i) => i - 3);
    const y = Array.from({length: d}, (_, i) => 2 * i + 4);
    const c = x.map((v, i) => (v + y[i]) / 2);
    const difference = y.map((v, i) => v - x[i]);
    assert.deepEqual(c.map((v, i) => v - difference[i] / 2), x);
    assert.deepEqual(c.map((v, i) => v + difference[i] / 2), y);
  }
});

test('ribbon disk cap count and genus-two enlargement count', () => {
  for (let minima = 1; minima < 30; minima++) {
    const bands = minima - 1;
    assert.equal(bands - minima + 1, 0);
  }
  for (let chi = -12; chi <= 12; chi += 2) {
    for (let k = Math.max(0, chi / 2 - 1); k <= 15; k++) {
      const m = Math.max(1, chi / 2);
      const newMinima = m + k, newBands = m - chi / 2 + 2 * k;
      const halfCritical = newBands - newMinima + 1;
      assert(halfCritical >= 0);
      assert.equal(2 * halfCritical, 2 - (chi - 2 * k));
    }
  }
});

test('critical-value velocity and descending fibre Morse index are distinct from slice index', () => {
  for (const lambda of [0, 1, 2, 3]) {
    for (const velocity of [-2, 2]) {
      const hessianOnDescendingFibre = Array.from({length: 3}, (_, j) => (j < lambda ? -1 : 1) / velocity);
      const fibreIndex = hessianOnDescendingFibre.filter(x => x < 0).length;
      assert.equal(fibreIndex, velocity > 0 ? lambda : 3 - lambda);
    }
  }
});

test('source statements retain theorem hypotheses and conjectural boundaries', () => {
  assert(note('170D').includes('非零同态'));
  assert(note('170H').includes('0\\le i\\le n'));
  assert(note('1712').includes('\\taxon{Conjecture}'));
  assert(note('180H').includes('d-3'));
  assert(note('180B').includes('没有闭[连通分支]'));
  assert.match(note('180R'), /d\\ne\s*4,5,7/);
  assert(note('180V').includes('每个有限的'));
  assert(note('180V').includes('未解问题'));
  assert(note('190D').includes('至少出现一次'));
  assert(note('190J').includes('同时安排'));
  assert(note('190L').includes('均为指标二'));
  assert(note('190O').includes('仍为开放问题'));
});
