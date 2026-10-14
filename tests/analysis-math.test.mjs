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
// Equal surface tensions at a triple junction meet at 120 degrees.
const normals = [0, 1, 2].map(j => [Math.cos(2 * Math.PI * j / 3), Math.sin(2 * Math.PI * j / 3)]);
normals.reduce(cadd, [0, 0]).forEach(value => close(value, 0));
for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
  close(normals[i][0] * normals[j][0] + normals[i][1] * normals[j][1], -0.5);
}
for (const pressures of [[0, 1, 3], [-2, 4, 7]]) {
  close((pressures[0] - pressures[1]) + (pressures[1] - pressures[2])
    + (pressures[2] - pressures[0]), 0);
}

// Use Mirek's positive-sign transform and negative-sign inverse.
const phase = angle => [Math.cos(angle), Math.sin(angle)];
const mod = (x, q) => ((x % q) + q) % q;
for (const q of [3, 5, 8]) {
  const f = Array.from({length: q}, (_, x) => [Math.sin(x + 0.3), Math.cos(2 * x)]);
  const transform = f.map((_, k) => f.reduce((sum, value, x) =>
    cadd(sum, cmul(value, phase(2 * Math.PI * k * x / q))), [0, 0]));
  close(f.reduce((sum, [a, b]) => sum + a * a + b * b, 0),
    transform.reduce((sum, [a, b]) => sum + a * a + b * b, 0) / q);
  for (const degree of [1, 2, 3]) for (const count of [q, 2 * q, 2 * q + 1]) {
    const multiplier = transform.map((_, k) => cscale(Array.from({length: count}, (_, n) =>
      phase(2 * Math.PI * k * ((n + 1) ** degree) / q)).reduce(cadd, [0, 0]), 1 / count));
    for (let x = 0; x < q; x++) {
      const direct = cscale(Array.from({length: count}, (_, n) =>
        f[mod(x - (n + 1) ** degree, q)]).reduce(cadd, [0, 0]), 1 / count);
      const frequency = cscale(transform.reduce((sum, value, k) =>
        cadd(sum, cmul(cmul(value, multiplier[k]), phase(-2 * Math.PI * k * x / q))), [0, 0]), 1 / q);
      direct.forEach((value, j) => close(value, frequency[j]));
    }
    if (count % q === 0) {
      for (let k = 0; k < q; k++) {
        const period = cscale(Array.from({length: q}, (_, n) =>
          phase(2 * Math.PI * k * (n ** degree) / q)).reduce(cadd, [0, 0]), 1 / q);
        period.forEach((value, j) => close(value, multiplier[k][j]));
      }
    }
  }
}

// Quadratic complete sums have square-root size for odd composite moduli too.
const gcd = (a, b) => b ? gcd(b, a % b) : a;
for (const q of [3, 5, 9, 15, 21]) for (let a = 1; a < q; a++) {
  if (gcd(a, q) !== 1) continue;
  const sum = Array.from({length: q}, (_, r) => phase(2 * Math.PI * a * r * r / q))
    .reduce(cadd, [0, 0]);
  close(sum[0] ** 2 + sum[1] ** 2, q);
}

// A delta mass on Z tends pointwise to zero under averages, with l1 norm one.
for (const count of [4, 20, 100]) {
  const average = x => x >= 1 && x <= count ? 1 / count : 0;
  close(Array.from({length: count}, (_, j) => average(j + 1)).reduce((a, b) => a + b, 0), 1);
  close(Array.from({length: count}, (_, j) => average(j + 1) ** 2).reduce((a, b) => a + b, 0), 1 / count);
}

// In the exp(-ix xi) convention, the band [-b,b] has kernel sin(bx)/(pi x).
const simpson = (f, a, b, count = 4096) => {
  const step = (b - a) / count;
  let sum = f(a) + f(b);
  for (let i = 1; i < count; i++) sum += (i % 2 ? 4 : 2) * f(a + i * step);
  return step * sum / 3;
};
for (const bandwidth of [Math.PI / 2, Math.PI, 2 * Math.PI]) for (const x of [0, 0.2, 0.75, 2]) {
  const kernel = simpson(xi => Math.cos(x * xi), -bandwidth, bandwidth) / (2 * Math.PI);
  close(kernel, x === 0 ? bandwidth / Math.PI : Math.sin(bandwidth * x) / (Math.PI * x));
}
// A Gram Schur multiplier is a sum of diagonal Kraus maps.
const transpose = a => a[0].map((_, j) => a.map(row => row[j]));
const vectors = [[1, 2], [-1, 3], [2, -2]];
const gram = multiply(vectors, transpose(vectors));
const input = [[2, -1, 3], [4, 1, -2], [0, 2, 5]];
const schur = input.map((row, i) => row.map((value, j) => value * gram[i][j]));
const kraus = input.map((row, i) => row.map((value, j) =>
  vectors[0].reduce((sum, _, k) => sum + vectors[i][k] * value * vectors[j][k], 0)));
schur.forEach((row, i) => row.forEach((value, j) => close(value, kraus[i][j])));
const hsSquared = a => a.flat().reduce((sum, value) => sum + value * value, 0);
assert(hsSquared(schur) <= Math.max(...gram.flat().map(Math.abs)) ** 2 * hsSquared(input));
const conjugate = ([a, b]) => [a, -b];
const complexVectors = [[[1, 2], [-1, 1]], [[0, -1], [2, 3]], [[2, 0], [1, -2]]];
const complexGram = complexVectors.map(u => complexVectors.map(v =>
  u.reduce((sum, value, k) => cadd(sum, cmul(conjugate(value), v[k])), [0, 0])));
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
  const coefficient = [input[i][j], i - j];
  const product = cmul(complexGram[i][j], coefficient);
  const diagonalCompression = complexVectors[i].reduce((sum, value, k) =>
    cadd(sum, cmul(cmul(conjugate(value), coefficient), complexVectors[j][k])), [0, 0]);
  product.forEach((value, k) => close(value, diagonalCompression[k]));
}

// Transposition on M_2 is positive but its second amplification is not.
const bell = [1, 0, 0, 1];
const bellProjection = bell.map(x => bell.map(y => x * y));
const partialTranspose = bellProjection.map((_, row) => bellProjection.map((__, col) => {
  const i = Math.floor(row / 2), a = row % 2, j = Math.floor(col / 2), b = col % 2;
  return bellProjection[2 * i + b][2 * j + a];
}));
const antisymmetric = [0, 1, -1, 0];
close(antisymmetric.reduce((sum, x, i) => sum + x * partialTranspose[i]
  .reduce((inner, value, j) => inner + value * antisymmetric[j], 0), 0), -2);

// Harmonic functions for an absorbing Markov chain need not multiply pointwise.
const markov = [[1, 0, 0], [0, 1, 0], [0.5, 0.5, 0]];
const apply = f => markov.map(row => row.reduce((sum, value, j) => sum + value * f[j], 0));
const harmonic = [1, -1, 0], square = harmonic.map(x => x * x);
assert.deepEqual(apply(harmonic), harmonic);
assert.notDeepEqual(apply(square), square);
assert.deepEqual(apply(apply(square)), apply(square));

// A nonconstant quadratic phase separates U^3 from U^2 on an odd prime field.
for (const q of [3, 5, 7]) {
  const f = x => phase(2 * Math.PI * mod(x * x, q) / q);
  const conjugate = ([a, b]) => [a, -b];
  let u2 = [0, 0], u3 = [0, 0];
  for (let x = 0; x < q; x++) for (let h = 0; h < q; h++) for (let k = 0; k < q; k++) {
    const face = t => cmul(cmul(f(t), conjugate(f(t + h))),
      cmul(conjugate(f(t + k)), f(t + h + k)));
    u2 = cadd(u2, face(x));
    for (let l = 0; l < q; l++) u3 = cadd(u3, cmul(face(x), conjugate(face(x + l))));
  }
  close(u2[0] / q ** 3, 1 / q);
  close(u2[1], 0);
  close(u3[0] / q ** 4, 1);
  close(u3[1], 0);
  for (let frequency = 0; frequency < q; frequency++) {
    const coefficient = cscale(Array.from({length: q}, (_, x) =>
      cmul(f(x), phase(2 * Math.PI * frequency * x / q))).reduce(cadd, [0, 0]), 1 / q);
    close(coefficient[0] ** 2 + coefficient[1] ** 2, 1 / q);
  }
}
// Exact quadrature checks the signs in the one- and two-frequency identities.
// The modulus exceeds every possible integer phase, so no wraparound survives.
const q = 32, count = 3;
const sequences = Array.from({length: 3}, (_, j) => Array.from({length: 5}, (_, x) =>
  [Math.sin(x + j + 0.2), Math.cos(2 * x - j)]));
const at = (j, x) => sequences[j][x] ?? [0, 0];
const negativeTransform = sequences.map(f => Array.from({length: q}, (_, k) =>
  f.reduce((sum, value, x) => cadd(sum, cmul(value, phase(-2 * Math.PI * k * x / q))), [0, 0])));
let directPair = [0, 0], directTriple = [0, 0], frequencyPair = [0, 0], frequencyTriple = [0, 0];
for (let x = 0; x < 5; x++) for (let y = 1; y <= count; y++) {
  directPair = cadd(directPair, cscale(cmul(at(0, x), at(1, x + y * y)), 1 / count));
  directTriple = cadd(directTriple, cscale(cmul(cmul(at(0, x), at(1, x + y)), at(2, x + y * y)), 1 / count));
}
for (let r = 0; r < q; r++) {
  const sum = cscale(Array.from({length: count}, (_, y) =>
    phase(2 * Math.PI * r * (y + 1) ** 2 / q)).reduce(cadd, [0, 0]), 1 / count);
  frequencyPair = cadd(frequencyPair, cscale(cmul(cmul(negativeTransform[0][mod(-r, q)],
    negativeTransform[1][r]), sum), 1 / q));
  for (let s = 0; s < q; s++) {
    const kernel = cscale(Array.from({length: count}, (_, y) =>
      phase(2 * Math.PI * (r * (y + 1) + s * (y + 1) ** 2) / q)).reduce(cadd, [0, 0]), 1 / count);
    frequencyTriple = cadd(frequencyTriple, cscale(cmul(cmul(cmul(negativeTransform[0][mod(-r - s, q)],
      negativeTransform[1][r]), negativeTransform[2][s]), kernel), 1 / (q * q)));
  }
}
directPair.forEach((value, j) => close(value, frequencyPair[j]));
directTriple.forEach((value, j) => close(value, frequencyTriple[j]));
await import('./fourier-restriction-math.test.mjs');
console.log('Analysis finite examples passed, including Schur/Kraus identities, failure of complete positivity for transposition, harmonic products, quadratic Gowers energies and polynomial Fourier identities. These calculations do not prove the general research theorems.');
