import assert from 'node:assert/strict';

const close = (actual, expected) => assert(Math.abs(actual - expected) < 1e-9,
  `${actual} differs from ${expected}`);

// A rectangular convex body has a weighted cross-polytope as its polar.
for (const radii of [[1, 2], [2, 3, 4]]) {
  const vertices = Array.from({length: 2 ** radii.length}, (_, mask) =>
    radii.map((radius, i) => (mask & (1 << i) ? 1 : -1) * radius));
  for (const y of [radii.map((_, i) => i + 1), radii.map((r, i) => (i % 2 ? -1 : 1) / r)]) {
    const support = Math.max(...vertices.map(x => x.reduce((sum, v, i) => sum + v * y[i], 0)));
    close(support, radii.reduce((sum, r, i) => sum + r * Math.abs(y[i]), 0));
    const normalized = y.map(v => v / support);
    close(radii.reduce((sum, r, i) => sum + r * Math.abs(normalized[i]), 0), 1);
  }
}

// The Fenchel gap for a positive quadratic is a nonnegative square.
for (const a of [0.25, 1, 3, 7]) for (const x of [-3, -1, 0, 2]) for (const y of [-4, 0, 1, 5]) {
  const gap = a * x * x / 2 + y * y / (2 * a) - x * y;
  close(gap, a * (x - y / a) ** 2 / 2);
  assert(gap >= -1e-12);
}

const multiply = (a, b) => a.map(row => b[0].map((_, j) =>
  row.reduce((sum, x, k) => sum + x * b[k][j], 0)));
const trace = a => a.reduce((sum, row, i) => sum + row[i], 0);
const identity = n => Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => +(i === j)));
const cycle = n => Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) =>
  +(j === (i + 1) % n || i === (j + 1) % n)));
const countWalks = (adjacency, start, length) => {
  let counts = adjacency.map((_, i) => +(i === start));
  for (let t = 0; t < length; t++) {
    counts = adjacency.map((_, j) => counts.reduce((sum, count, i) => sum + count * adjacency[i][j], 0));
  }
  return counts[start];
};

// Spectral moments and rooted closed walks give the same normalized trace.
for (const n of [9, 12]) {
  const adjacency = cycle(n);
  let power = identity(n);
  for (let k = 0; k <= 6; k++) {
    close(trace(power), adjacency.reduce((sum, _, i) => sum + countWalks(adjacency, i, k), 0));
    close(trace(power), Array.from({length: n}, (_, j) => (2 * Math.cos(2 * Math.PI * j / n)) ** k)
      .reduce((a, b) => a + b, 0));
    power = multiply(power, adjacency);
  }
}

// A fixed K_6 component disappears from the root law but retains eigenvalue 5.
const errors = [20, 80, 320].map(n => {
  const fourthMoment = (6 * n + 5 ** 4 + 5) / (n + 6);
  assert.equal(Math.max(2, 5), 5);
  close((n / (n + 6)) * 6 + (6 / (n + 6)) * (5 ** 4 + 5) / 6, fourthMoment);
  return fourthMoment - 6;
});
assert(errors[0] > errors[1] && errors[1] > errors[2] && errors[2] > 0);

const determinant = matrix => {
  const a = matrix.map(row => [...row]);
  let result = 1;
  for (let i = 0; i < a.length; i++) {
    const pivot = a.findIndex((row, j) => j >= i && Math.abs(row[i]) > 1e-12);
    if (pivot < 0) return 0;
    if (pivot !== i) { [a[i], a[pivot]] = [a[pivot], a[i]]; result *= -1; }
    result *= a[i][i];
    for (let j = i + 1; j < a.length; j++) {
      const scale = a[j][i] / a[i][i];
      for (let k = i; k < a.length; k++) a[j][k] -= scale * a[i][k];
    }
  }
  return result;
};
for (const [vertices, edges] of [[2, [[0, 1]]], [3, [[0, 1], [1, 2], [2, 0]]],
  [2, [[0, 0], [0, 1], [0, 1]]]]) {
  const oriented = edges.flatMap(([a, b]) => [[a, b], [b, a]]);
  const adjacency = Array.from({length: vertices}, () => Array(vertices).fill(0));
  for (const [a, b] of oriented) adjacency[b][a]++;
  const degree = adjacency.map(row => row.reduce((a, b) => a + b, 0));
  for (const u of [0.1, 0.2, 0.35]) {
    const lhs = oriented.map(([start], f) => oriented.map(([, end], e) =>
      +(f === e) - u * +(start === end && f !== (e ^ 1))));
    const rhs = adjacency.map((row, i) => row.map((x, j) =>
      +(i === j) - u * x + (i === j ? u * u * (degree[i] - 1) : 0)));
    close(determinant(lhs), (1 - u * u) ** (edges.length - vertices) * determinant(rhs));
  }
}
// The catenoid's null differential has a nonzero imaginary period.
const cadd = ([a, b], [c, d]) => [a + c, b + d];
const cmul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
const cscale = ([a, b], t) => [a * t, b * t];
const points = 512;
const periods = [[0, 0], [0, 0], [0, 0]];
for (let j = 0; j < points; j++) {
  const t = 2 * Math.PI * j / points;
  const inverse = [Math.cos(t), -Math.sin(t)];
  const inverseSquared = cmul(inverse, inverse);
  const phi = [cscale(cadd([1, 0], cscale(inverseSquared, -1)), 0.5),
    cmul([0, 0.5], cadd([1, 0], inverseSquared)), inverse];
  const squareSum = phi.map(z => cmul(z, z)).reduce(cadd, [0, 0]);
  close(squareSum[0], 0);
  close(squareSum[1], 0);
  const dz = cscale([-Math.sin(t), Math.cos(t)], 2 * Math.PI / points);
  phi.forEach((coefficient, k) => { periods[k] = cadd(periods[k], cmul(coefficient, dz)); });
}
periods.forEach(([real, imaginary], k) => {
  close(real, 0);
  close(imaginary, k === 2 ? 2 * Math.PI : 0);
});
console.log('Analysis examples: polar support, quadratic conjugacy, closed-walk moments, a spectral outlier, Ihara–Bass with loops and parallel edges, and the catenoid null differential and flux passed. These finite checks do not prove the general theorems.');
