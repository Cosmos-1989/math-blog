import assert from 'node:assert/strict';

const near = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance,
  `${a} differs from ${b}`);
const add = ([a, b], [c, d]) => [a + c, b + d];
const mul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
const norm2 = ([a, b]) => a * a + b * b;
const phase = t => [Math.cos(t), Math.sin(t)];

for (let d = 1; d <= 8; d++) {
  const q = 2 * (d + 2) / d;
  near(d - (d + 2) / q, d / 2);
  assert.ok(d - (d + 2) / (q - 0.1) < d / 2);
}

for (const coefficients of [ [[1, 2]], [[1, 2], [2, -3]],
  [[1, 0], [0, 1], [2, -1], [-3, 2]] ]) {
  let fourthMoment = 0;
  for (let mask = 0; mask < 2 ** coefficients.length; mask++) {
    const sum = coefficients.reduce((value, a, j) =>
      add(value, a.map(x => x * (mask & (1 << j) ? 1 : -1))), [0, 0]);
    fourthMoment += norm2(sum) ** 2 / 2 ** coefficients.length;
  }
  const squareSum = coefficients.reduce((s, a) => s + norm2(a), 0);
  const sumSquares = coefficients.reduce((s, a) => add(s, mul(a, a)), [0, 0]);
  near(fourthMoment, 2 * squareSum ** 2 + norm2(sumSquares)
    - 2 * coefficients.reduce((s, a) => s + norm2(a) ** 2, 0));
}

// Enumerate every choice of one affine line in each projective direction.
for (const q of [2, 3]) {
  for (let choice = 0; choice < q ** (q + 1); choice++) {
    let code = choice;
    const points = new Set();
    for (let direction = 0; direction <= q; direction++) {
      const b = code % q;
      code = Math.floor(code / q);
      for (let t = 0; t < q; t++) {
        const [x, y] = direction < q ? [t, (direction * t + b) % q] : [b, t];
        points.add(`${x},${y}`);
      }
    }
    assert.ok(points.size >= q * (q + 1) / 2);
  }
}

for (const a of [-1, 0.2, 2]) for (const b of [-0.5, 0, 3]) {
  for (const t of [-0.2, 0, 0.3]) {
    const x1 = b + t * a + t * t * b;
    const x2 = t * b + t * t * a + t ** 3 * b;
    near(x2, t * x1);
    near(-x1 + t * a + t * t * b, -b);
    near(-x2 + t * b + t * t * a + t ** 3 * b, 0);
  }
}

// The angle-frequency dual of aZ is (2pi/a)Z.
for (const a of [0.5, 1, 2.5]) for (const x of [0, 0.3, -0.7]) {
  let spatial = 0, spectral = 0;
  for (let m = -40; m <= 40; m++) {
    spatial += Math.exp(-((x + a * m) ** 2) / 2);
    const frequency = 2 * Math.PI * m / a;
    spectral += Math.sqrt(2 * Math.PI) / a
      * Math.exp(-(frequency ** 2) / 2) * Math.cos(x * frequency);
  }
  near(spatial, spectral);
}

for (const n of [1, 2, 5]) for (const k of [-1, 0, 2]) {
  for (const l of [-2, 0, 1]) {
    let sum = [0, 0];
    for (let m = -n; m <= n; m++) sum = add(sum, phase(2 * Math.PI * (k * m + l * m * m)));
    near(sum[0], 2 * n + 1);
    near(sum[1], 0);
  }
}

const f = x => add(phase(2 * Math.PI * x / 31).map(v => 0.8 * v),
  phase(6 * Math.PI * x / 31).map(v => 0.2 * v));
for (const k of [1.2, 1.5, 2]) {
  const count = Math.ceil(2 * k * k);
  const large = Array.from({ length: 30 }, (_, j) => j + 1)
    .filter(x => norm2(f(x)) >= 1 / (k * k)).slice(0, count);
  assert.equal(large.length, count);
  let maxPair = 0;
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
    maxPair = Math.max(maxPair, Math.sqrt(norm2(f(large[i] - large[j]))));
  }
  assert.ok(maxPair >= 1 / (2 * k * k));
}

const points = [[1, 1], [1, 2], [2, 1], [2, 2]];
let solutions = 0, integral = 0;
for (const a of points) for (const b of points) for (const c of points) for (const d of points) {
  if (a.every((v, j) => v + b[j] === c[j] + d[j])) solutions++;
}
// Nine grid points per coordinate integrate this finite Fourier polynomial exactly.
for (let x = 0; x < 9; x++) for (let y = 0; y < 9; y++) {
  const sum = points.reduce((s, [a, b]) => add(s, phase(2 * Math.PI * (a * x + b * y) / 9)), [0, 0]);
  integral += norm2(sum) ** 2 / 81;
}
assert.equal(solutions, 36);
near(integral, solutions);

console.log('Fourier restriction finite examples passed: Knapp scaling, complex fourth moments, finite-field Kakeya, curved compression, Poisson constants, lattice peaks, positive-definite pairs, and moment counting. Finite checks do not prove the general theorems.');
