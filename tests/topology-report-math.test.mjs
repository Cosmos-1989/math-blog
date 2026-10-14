import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const record = JSON.parse(fs.readFileSync(path.join(root, 'research/icm2026-topology-oct14.json')));
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), file]));
const source = id => fs.readFileSync(path.join(root, 'trees', files.get(id)), 'utf8');

test('ellipsoid lattice count obeys the area bounds, including rational multiplicities', () => {
  for (const [a, b] of [[1, 1], [2, 3], [3, 7]]) {
    for (let L = 0; L <= 80; L++) {
      let count = 0;
      for (let m = 0; a * m <= L; m++) count += Math.floor((L - a * m) / b) + 1;
      assert(count >= L * L / (2 * a * b));
      assert(count <= (L + a + b) ** 2 / (2 * a * b));
    }
  }
});

test('ball capacity indexing starts at zero and preserves triangular multiplicities', () => {
  const sums = [];
  for (let m = 0; m <= 30; m++) for (let n = 0; n <= 30 - m; n++) sums.push(m + n);
  sums.sort((a, b) => a - b);
  for (let d = 0; d <= 30; d++) {
    for (let k = d * (d + 1) / 2; k < (d + 1) * (d + 2) / 2; k++) assert.equal(sums[k], d);
  }
});

test('max-convolution normalization gives sum of volumes', () => {
  for (const [V, W] of [[1, 1], [1, 3], [2, 5]]) {
    for (const k of [100, 1000]) {
      const values = Array.from({length: k + 1}, (_, i) => 2 * Math.sqrt(V * i) + 2 * Math.sqrt(W * (k - i)));
      const ratio = Math.max(...values) ** 2 / k;
      assert(ratio <= 4 * (V + W) + 1e-10);
      assert(Math.abs(ratio - 4 * (V + W)) < 0.005);
    }
  }
});

test('small spectral gap bound is a telescoping estimate', () => {
  const n = 10000, c = i => 2 * Math.sqrt(i);
  for (const epsilon of [0.01, 0.1, 0.5]) {
    let count = 0;
    for (let j = 1; j <= n; j++) if (c(j) - c(j - 1) >= epsilon) count++;
    assert(count * epsilon <= c(n) + 1e-9);
  }
});

test('mirror Hessian and duality plot center agree with formulas', () => {
  assert.equal(2 * 2 - 1 * 1, 3);
  for (let d = 0; d < 6; d++) for (let w = 0; w < 6; w++) {
    for (let a = 0; a <= d; a++) for (let b = 0; b <= w; b++) {
      const x2 = d - a, y2 = 2 * (w - b) - x2;
      assert.equal((a + x2) / 2, d / 2);
      assert.equal((2 * b - a + y2) / 2, w - d / 2);
    }
  }
});

test('report coverage, theorem hypotheses and research statuses are retained', () => {
  const subject = source(record.subject);
  for (const report of record.reports) {
    assert(subject.includes(`](${report.outline})`));
    assert(source(report.outline).includes(`](${report.reference})`));
    assert(report.reading_scope && report.deferred.length);
  }
  assert(subject.includes('](0BL0)'));
  assert(source('0BLG').includes('](1401)') && source('0BLG').includes('](150M)'));
  assert(source('0BLQ').includes('](150E)'));
  assert(source('140E').includes('挠元'));
  assert(source('140D').includes('全部有限'));
  assert(source('1408').includes('平移不变'));
  assert(source('1409').includes('sigma\\ne 0'));
  assert(source('140R').includes('保持取向与体积'));
  assert(source('140X').includes('相同标准辛球'));
  assert(source('140T').includes('单轨道假设'));
  assert(source('150L').includes('猜想'));
  assert(source('150F').includes('lim_{I^{\\mathrm{op}}}'));
  assert(source('140H').includes('至少一条闭轨道'));
  assert(source('160Y').includes('闭[正规子群](00BF)'));
  assert(source('160I').includes('](1616)'));
  assert(source('160P').includes('同伦有下界'));
  assert(source('160T').includes('2i-j'));
  assert(source('160Z').includes('将发表'));
  assert(source('1610').includes('](063B)'));
  for (const id of Object.keys(record.prerequisites)) {
    assert(!/F_\{mathrm|\[群\]\(00B7\)|\[线性对偶\]\(001G\)/.test(source(id)), id);
  }
});
