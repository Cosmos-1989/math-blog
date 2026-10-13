import assert from 'node:assert/strict';

// Exact finite-field examples supplement, but do not replace, the written proofs.
const prime = 101;
const mod = x => ((x % prime) + prime) % prime;
const inverse = x => {
  for (let y = 1; y < prime; y++) if (mod(x * y) === 1) return y;
  throw new Error('Division by zero');
};
const zero = () => Array.from({length: 3}, () => [0, 0, 0]);
const identity = () => Array.from({length: 3}, (_, i) => [0, 1, 2].map(j => Number(i === j)));
const add = (a, b) => a.map((row, i) => row.map((x, j) => mod(x + b[i][j])));
const scale = (a, c) => a.map(row => row.map(x => mod(x * c)));
const multiply = (a, b) => a.map(row => [0, 1, 2].map(j => mod(row.reduce((s, x, k) => s + x * b[k][j], 0))));
let spectralExamples = 0;
for (let a = 0; a < 6; a++) for (let b = a + 1; b < 7; b++) for (let c = b + 1; c < 8; c++) {
  const eigenvalues = [a, b, c];
  const diagonal = eigenvalues.map((x, i) => [0, 1, 2].map(j => i === j ? x : 0));
  const s = [[1, 2, 3], [0, 1, 4], [0, 0, 1]];
  const si = [[1, -2, 5], [0, 1, -4], [0, 0, 1]];
  const t = multiply(multiply(s, diagonal), si);
  const projections = eigenvalues.map((value, i) => eigenvalues.reduce((p, other, j) =>
    j === i ? p : multiply(p, scale(add(t, scale(identity(), -other)), inverse(mod(value - other)))), identity()));
  assert.deepEqual(projections.reduce(add, zero()), identity());
  for (let i = 0; i < 3; i++) {
    assert.deepEqual(multiply(t, projections[i]), scale(projections[i], eigenvalues[i]));
    for (let j = 0; j < 3; j++) {
      assert.deepEqual(multiply(projections[i], projections[j]), i === j ? projections[i] : zero());
    }
  }
  spectralExamples++;
}

// Unit boxes give explicit lower/upper bounds for monomial-ideal colengths.
let latticeExamples = 0;
for (const [a, b] of [[1, 1], [1, 2], [2, 3], [3, 5]]) for (const m of [1, 2, 10, 30, 120]) {
  let count = 0;
  for (let i = 0; a * i < m; i++) for (let j = 0; a * i + b * j < m; j++) count++;
  assert(m * m <= 2 * a * b * count);
  assert(2 * a * b * count <= (m + a + b) ** 2);
  // (a+b)^2/(ab) >= 4, with equality precisely at equal weights.
  assert((a + b) ** 2 >= 4 * a * b);
  assert.equal((a + b) ** 2 === 4 * a * b, a === b);
  latticeExamples++;
}
let cycleExamples = 0;
for (let seed = 0; seed < 24; seed++) {
  const cycles = Array.from({length: 13}, (_, length) => length ? (seed + 3 * length) % 4 : 0);
  const recovered = [0];
  for (let n = 1; n <= 12; n++) {
    let zeroMultipliers = 0, earlier = 0;
    for (let length = 1; length <= n; length++) if (n % length === 0) {
      zeroMultipliers += length * cycles[length];
      if (length < n) earlier += length * recovered[length];
    }
    recovered[n] = (zeroMultipliers - earlier) / n;
    assert.equal(recovered[n], cycles[n]);
  }
  cycleExamples++;
}
console.log(JSON.stringify({spectralExamples, latticeExamples, cycleExamples, arithmetic: 'exact integer / finite field',
  limitation: 'Checks explicit examples and normalizations, not the cited geometric theorems.'}));
