import assert from 'node:assert/strict';
import test from 'node:test';

// Finite calculations supporting the notes, not proofs of the research inputs.
test('cup-product Leibniz signs hold over integers and a ring with torsion', () => {
  const coboundary = (cochain, vertices) => vertices.reduce((sum, _, i) =>
    sum + (-1) ** i * cochain(vertices.filter((_, j) => j !== i)), 0);
  for (let p = 0; p <= 3; p++) for (let q = 0; q <= 3; q++) {
    const alpha = vertices => vertices.reduce((a, v, i) => a + (i + 1) * (v + 2) ** 2, 3);
    const beta = vertices => vertices.reduce((a, v, i) => a + (i + 2) * (v + 1), 7);
    const vertices = Array.from({length: p + q + 2}, (_, i) => i);
    const cup = face => alpha(face.slice(0, p + 1)) * beta(face.slice(p));
    const left = coboundary(cup, vertices);
    const right = coboundary(alpha, vertices.slice(0, p + 2)) * beta(vertices.slice(p + 1))
      + (-1) ** p * alpha(vertices.slice(0, p + 1)) * coboundary(beta, vertices.slice(p));
    assert.equal(left, right);
    assert.equal(((left % 4) + 4) % 4, ((right % 4) + 4) % 4);
  }
});

test('diagonal four-manifold forms recover Euler characteristic and signature', () => {
  for (let positive = 0; positive <= 12; positive++) {
    for (let negative = 0; negative <= 12; negative++) {
      const b2 = positive + negative, signature = positive - negative;
      const chi = 2 + b2;
      assert.equal((b2 + signature) / 2, positive);
      assert.equal((b2 - signature) / 2, negative);
      assert.equal(2 * chi + 3 * signature, 4 + 5 * positive - negative);
    }
  }
  const cp2FiveBlowups = {positive: 1, negative: 5};
  const chi = 2 + cp2FiveBlowups.positive + cp2FiveBlowups.negative;
  const signature = cp2FiveBlowups.positive - cp2FiveBlowups.negative;
  assert.equal(chi, 8);
  assert.equal(signature, -4);
  assert.equal(2 * chi + 3 * signature, 4);
});

test('unimodular basis changes preserve the intersection determinant', () => {
  const determinant = m => m[0][0] * m[1][1] - m[0][1] * m[1][0];
  const multiply = (a, b) => a.map(row => b[0].map((_, j) =>
    row.reduce((sum, x, k) => sum + x * b[k][j], 0)));
  const transpose = m => m[0].map((_, j) => m.map(row => row[j]));
  for (const q of [[[0, 1], [1, 0]], [[1, 0], [0, -1]], [[1, 0], [0, 1]]]) {
    for (let n = -10; n <= 10; n++) {
      const change = [[1, n], [0, 1]];
      assert.equal(determinant(change), 1);
      assert.equal(determinant(multiply(multiply(transpose(change), q), change)), determinant(q));
    }
  }
});

test('p-rank and logarithmic order are distinct finite abelian group invariants', () => {
  for (const p of [2n, 3n, 5n]) {
    for (const exponents of [[], [1], [2], [1, 1], [1, 2, 4]]) {
      const order = exponents.reduce((total, exponent) => total * p ** BigInt(exponent), 1n);
      const logOrder = exponents.reduce((sum, exponent) => sum + exponent, 0);
      const rankModP = exponents.length;
      assert.equal(order, p ** BigInt(logOrder));
      assert(logOrder >= rankModP);
      assert.equal(logOrder === rankModP, exponents.every(exponent => exponent === 1));
    }
  }
});

test('stable suspension indexing keeps the stem fixed', () => {
  for (let stem = 0; stem <= 30; stem++) {
    for (let dimension = stem + 2; dimension <= stem + 12; dimension++) {
      const sourceDimension = stem + dimension;
      assert(sourceDimension <= 2 * dimension - 2);
      assert.equal(sourceDimension - dimension, (sourceDimension + 1) - (dimension + 1));
    }
  }
});

test('graph excess, order and configuration-integral degree use the same convention', () => {
  for (let vertices = 2; vertices <= 30; vertices++) {
    for (let edges = Math.ceil(3 * vertices / 2); edges <= 3 * vertices; edges++) {
      const k = edges - vertices, excess = 2 * edges - 3 * vertices;
      assert.equal(vertices, 2 * k - excess);
      assert.equal(edges, 3 * k - excess);
      for (let d = 4; d <= 15; d++) {
        assert.equal((d - 1) * edges - d * vertices, k * (d - 3) + excess);
      }
      if (excess > 0) {
        assert.equal((edges + 1) - (vertices + 1), k);
        assert.equal(2 * (edges + 1) - 3 * (vertices + 1), excess - 1);
      }
    }
  }
});

test('trivalent graph degrees lie in the exceptional even-dimensional bands', () => {
  for (let n = 3; n <= 15; n++) {
    for (let k = 2; k <= 20; k++) {
      const degree = k * (2 * n - 3);
      const lower = 2 * k * n - 4 * k - 1;
      const upper = 2 * k * n - 2 * k + 1;
      assert(degree >= lower && degree <= upper);
    }
  }
  assert.equal(2 * (4 - 3), 2);
});

test('all tetrahedron automorphisms preserve the even graph orientation', () => {
  const permutations = values => values.length ? values.flatMap((v, i) =>
    permutations(values.filter((_, j) => i !== j)).map(tail => [v, ...tail])) : [[]];
  const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  const labels = edges.map(edge => edge.join(','));
  for (const permutation of permutations([0, 1, 2, 3])) {
    const image = edges.map(edge => labels.indexOf(edge.map(v => permutation[v]).sort().join(',')));
    const inversions = image.reduce((sum, v, i) => sum + image.slice(i + 1).filter(w => w < v).length, 0);
    assert.equal(inversions % 2, 0);
  }
  assert.equal(3 * 4 / 2, 6);
  assert(5 > 3 * 2 / 2); // An excess-one precursor on three vertices cannot be simple.
});

test('five-leaf tree compatibility gives the ten-vertex fifteen-edge Lie-hedron', () => {
  const pairs = [];
  for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) pairs.push([a, b]);
  const neighbours = pairs.map(pair => pairs.filter(other => other.every(v => !pair.includes(v))));
  assert.equal(pairs.length, 10);
  assert(neighbours.every(adjacent => adjacent.length === 3));
  assert.equal(neighbours.reduce((sum, adjacent) => sum + adjacent.length, 0) / 2, 15);
});

test('odd-dimensional framing comparison has both adjacent rational homotopy groups zero', () => {
  for (let n = 2; n <= 20; n++) for (let k = 2; k <= 20; k++) {
    const d = 2 * n + 1, r = k * (d - 3);
    const rationalSoDegrees = Array.from({length: n}, (_, i) => 4 * i + 3);
    assert(!rationalSoDegrees.includes(r + d));
    assert(!rationalSoDegrees.includes(r + d - 1));
  }
  assert.equal(2 * 3 ** 2 + 8 * 3 + 10, 52);
});
