import assert from 'node:assert/strict';
import test from 'node:test';

// Finite-model regressions, not substitutes for the proofs in the 4V notes.
const bits = mask => {
  let count = 0;
  for (; mask; mask &= mask - 1) count++;
  return count;
};
const choose = (n, k) => {
  if (k < 0 || k > n) return 0;
  let value = 1;
  for (let j = 1; j <= k; j++) value = value * (n - j + 1) / j;
  return Math.round(value);
};
const close = (a, b, message = '') =>
  assert(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${message}: ${a} != ${b}`);
const graph = (n, edges) => {
  const adjacency = Array(n).fill(0);
  for (const [u, v] of edges) {
    adjacency[u] |= 1 << v;
    adjacency[v] |= 1 << u;
  }
  return adjacency;
};
const edgesOf = g => g.flatMap((neighbors, u) =>
  Array.from({length: u}, (_, v) => [u, v]).filter(([, v]) => neighbors & (1 << v)));
const allGraphs = function* (n) {
  const edges = Array.from({length: n}, (_, u) => Array.from({length: u}, (_, v) => [u, v])).flat();
  for (let mask = 0; mask < 2 ** edges.length; mask++)
    yield graph(n, edges.filter((_, i) => mask & (1 << i)));
};
const independent = (g, set) => g.every((neighbors, v) => !(set & (1 << v)) || !(neighbors & set));
const independentSets = g => Array.from({length: 1 << g.length}, (_, i) => i).filter(set => independent(g, set));
const edgeCount = (g, set = (1 << g.length) - 1) =>
  g.reduce((sum, neighbors, v) => sum + ((set & (1 << v)) ? bits(neighbors & set) : 0), 0) / 2;
const triangles = g => {
  let count = 0;
  for (let u = 0; u < g.length; u++) for (let v = 0; v < u; v++) for (let w = 0; w < v; w++)
    if ((g[u] & (1 << v)) && (g[u] & (1 << w)) && (g[v] & (1 << w))) count++;
  return count;
};
const complement = g => g.map((neighbors, v) => ((1 << g.length) - 1) ^ neighbors ^ (1 << v));
const coefficients = g => {
  const result = Array(g.length + 1).fill(0);
  for (const set of independentSets(g)) result[bits(set)]++;
  return result;
};

test('4V02/03: exhaustive two-colour models give R(3,3)=6', () => {
  assert([...allGraphs(5)].some(g => triangles(g) === 0 && triangles(complement(g)) === 0));
  for (const g of allGraphs(6)) assert(triangles(g) > 0 || triangles(complement(g)) > 0);
  assert.equal(choose(4, 2), 6);
});

test('4V04/0D: first moments agree with exact enumeration, including p=0 and p=1', () => {
  const n = 4, k = 3, possibleEdges = choose(n, 2);
  for (const [numerator, denominator] of [[0, 1], [1, 3], [1, 2], [1, 1]]) {
    let weightedIndependent = 0, weightedMonochromatic = 0;
    for (const g of allGraphs(n)) {
      const e = edgeCount(g);
      const weight = numerator ** e * (denominator - numerator) ** (possibleEdges - e);
      weightedIndependent += weight * coefficients(g)[k];
      weightedMonochromatic += weight * (triangles(g) + triangles(complement(g)));
    }
    const absent = denominator - numerator;
    assert.equal(weightedIndependent, choose(n, k) * absent ** choose(k, 2) * denominator ** (possibleEdges - choose(k, 2)));
    assert.equal(weightedMonochromatic, choose(n, k) * (absent ** 3 + numerator ** 3) * denominator ** 3);
  }
});

test('4V07: closed-neighbourhood deletion has an exact triangle correction', () => {
  let triangleFreeCount = 0;
  for (let n = 1; n <= 5; n++) for (const g of allGraphs(n)) {
    const full = (1 << n) - 1;
    const remainders = g.map((neighbors, v) => full & ~(neighbors | (1 << v)));
    assert.equal(remainders.reduce((sum, set) => sum + bits(set), 0), n * (n - 1) - 2 * edgeCount(g));
    const baseline = n * edgeCount(g) - g.reduce((sum, neighbors) => sum + bits(neighbors) ** 2, 0);
    const remainingEdges = remainders.reduce((sum, set) => sum + edgeCount(g, set), 0);
    assert.equal(remainingEdges, baseline + 3 * triangles(g));
    if (triangles(g) === 0) {
      triangleFreeCount++;
      assert.equal(remainingEdges, baseline);
    }
  }
  assert.equal(triangleFreeCount, 439);
  const k3 = graph(3, [[0, 1], [0, 2], [1, 2]]);
  assert.equal(3 * edgeCount(k3) - k3.reduce((sum, neighbors) => sum + bits(neighbors) ** 2, 0), -3);
});

const shearer = d => d === 0 ? 1 : d === 1 ? 0.5 : (d * Math.log(d) - d + 1) / (d - 1) ** 2;
test('4V06/08/09: finite Shearer bounds handle degrees zero and one', () => {
  assert.equal(shearer(0), 1);
  assert.equal(shearer(1), 0.5);
  for (let n = 1; n <= 5; n++) for (const g of allGraphs(n)) if (triangles(g) === 0) {
    const alpha = Math.max(...independentSets(g).map(bits));
    assert(alpha + 1e-12 >= n * shearer(2 * edgeCount(g) / n));
    for (const k of [2, 3, 4, 5]) if (alpha < k) assert(n < k / shearer(k - 1));
  }
});

test('4V0B: every positive-probability outside condition has the claimed star law', () => {
  let zeroAvailable = 0, positiveAvailable = 0;
  for (let n = 1; n <= 5; n++) for (const g of allGraphs(n)) if (triangles(g) === 0) {
    const sets = independentSets(g), full = (1 << n) - 1;
    for (let v = 0; v < n; v++) {
      const outside = full & ~(g[v] | (1 << v)), groups = new Map();
      for (const set of sets) {
        const t = set & outside;
        if (!groups.has(t)) groups.set(t, []);
        groups.get(t).push(set);
      }
      for (const [t, extensions] of groups) {
        const m = g.filter((neighbors, u) => (g[v] & (1 << u)) && !(neighbors & t)).length;
        assert.equal(extensions.length, 2 ** m + 1);
        assert.equal(extensions.filter(set => set & (1 << v)).length, 1);
        assert.equal(extensions.reduce((sum, set) => sum + bits(set & g[v]), 0), m === 0 ? 0 : m * 2 ** (m - 1));
        if (m === 0) zeroAvailable++; else positiveAvailable++;
      }
    }
  }
  assert(zeroAvailable > 0 && positiveAvailable > 0);
});

test('4V0B/0C: complete graphs refute omission of the triangle-free hypothesis', () => {
  const k3 = graph(3, [[0, 1], [0, 2], [1, 2]]);
  assert.equal(independentSets(k3).length, 4);
  assert.notEqual(independentSets(k3).length, 2 ** bits(k3[0]) + 1);
  const d = 8192, n = d + 1;
  assert(n / (n + 1) < n * Math.log2(d) / (12 * d));
});

test('4V0C: local dichotomy includes m=0 and the real degree-bound endpoint', () => {
  for (const d of [16, 16.5, 32, 100, 4096]) for (let m = 0; m <= d; m++) {
    const power = 2 ** -m;
    const localExpectation = (m / 2 + d * power) / (1 + power);
    assert(localExpectation + 1e-12 >= Math.log2(d) / 6);
  }
});

const multiply = (a, b) => {
  const result = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { result[i + j] += x * y; }));
  return result;
};
test('4V0F/0G: blow-up independence polynomials agree coefficient by coefficient', () => {
  for (let n = 1; n <= 4; n++) for (const g of allGraphs(n)) for (const s of [1, 2]) {
    const blownEdges = edgesOf(g).flatMap(([u, v]) =>
      Array.from({length: s * s}, (_, j) => [u * s + Math.floor(j / s), v * s + j % s]));
    const actual = coefficients(graph(n * s, blownEdges));
    const substituted = Array(n * s + 1).fill(0), inner = Array.from({length: s + 1}, (_, k) => k ? choose(s, k) : 0);
    let power = [1];
    coefficients(g).forEach(count => {
      power.forEach((value, k) => { substituted[k] += count * value; });
      power = multiply(power, inner);
    });
    assert.deepEqual(actual, substituted);
    assert.equal(actual.findLastIndex(x => x > 0), s * coefficients(g).findLastIndex(x => x > 0));
  }
});

const permutations = values => values.length ? values.flatMap((v, i) =>
  permutations(values.filter((_, j) => i !== j)).map(tail => [v, ...tail])) : [[]];
test('4V0I: permutation superposition expectation and overlapping edge colours', () => {
  for (const g of [graph(3, [[0, 1], [1, 2]]), graph(4, [[0, 1], [2, 3]]), graph(5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]])]) {
    const n = g.length, perms = permutations(Array.from({length: n}, (_, i) => i));
    for (let k = 2; k <= n; k++) {
      let total = 0, witnesses = 0;
      for (const perm of perms) {
        const copy = graph(n, edgesOf(g).map(([u, v]) => [perm[u], perm[v]]));
        const union = g.map((neighbors, v) => neighbors | copy[v]);
        const count = coefficients(union)[k];
        total += count;
        if (count === 0) {
          witnesses++;
          const blue = copy.map((neighbors, v) => neighbors & ~g[v]);
          assert.equal(triangles(g), 0);
          assert.equal(triangles(blue), 0);
          assert.equal(coefficients(union)[k], 0);
          assert(g.every((neighbors, v) => !(neighbors & blue[v])));
        }
      }
      const count = coefficients(g)[k];
      assert.equal(total * choose(n, k), perms.length * count ** 2);
      if (count ** 2 < choose(n, k)) assert(witnesses > 0);
    }
  }
  assert.equal(triangles(graph(3, [[0, 1], [1, 2], [0, 2]])), 1);
});

test('4V0K: one combined expectation supports simultaneous size and deletion claims', () => {
  for (let n = 0; n <= 4; n++) for (const g of allGraphs(n)) for (let k = 2; k <= n + 1; k++) {
    const independentK = independentSets(g).filter(set => bits(set) === k);
    let best = 0;
    for (let set = 0; set < (1 << n); set++)
      if (!independentK.some(i => (set & i) === i)) best = Math.max(best, bits(set));
    for (const p of [0, 0.25, 0.5, 1]) {
      let expected = 0, maxCombined = -Infinity;
      for (let set = 0; set < (1 << n); set++) {
        const size = bits(set), bad = independentK.filter(i => (set & i) === i);
        const combined = size - bad.length;
        expected += p ** size * (1 - p) ** (n - size) * combined;
        maxCombined = Math.max(maxCombined, combined);
        let remaining = set;
        for (const i of bad) remaining &= ~(i & -i);
        assert(bits(remaining) >= combined);
        assert(!independentK.some(i => (remaining & i) === i));
      }
      close(expected, p * n - p ** k * independentK.length);
      assert(maxCombined + 1e-10 >= expected);
      assert(best + 1e-10 >= expected);
    }
  }
});

const encode = (g, membership, s, order = Array.from({length: g.length}, (_, i) => i)) => {
  let candidates = (1 << g.length) - 1, fingerprint = 0;
  while (bits(fingerprint) < s) {
    assert(candidates !== 0, 'cannot select s fingerprint vertices');
    let vertex = -1, degree = -1;
    for (const v of order) if (candidates & (1 << v)) {
      const current = bits(g[v] & candidates);
      if (current > degree) { degree = current; vertex = v; }
    }
    candidates &= ~(1 << vertex);
    if (membership & (1 << vertex)) {
      fingerprint |= 1 << vertex;
      candidates &= ~g[vertex];
    }
  }
  return {fingerprint, candidates};
};

test('4V0L/0M: final unordered fingerprints reconstruct containers with fixed ties', () => {
  let sharedFingerprints = 0;
  for (let n = 1; n <= 5; n++) for (const g of allGraphs(n)) for (let s = 1; s <= n; s++) {
    const seen = new Map(), encoded = new Set();
    for (const i of independentSets(g)) if (bits(i) >= s) {
      const {fingerprint: t, candidates: a} = encode(g, i, s);
      assert.equal(t & i, t);
      assert.equal(t & a, 0);
      assert.equal((i & ~t) & ~a, 0);
      assert.deepEqual(encode(g, t, s), {fingerprint: t, candidates: a});
      if (seen.has(t)) { sharedFingerprints++; assert.equal(seen.get(t), a); }
      seen.set(t, a);
      const code = `${t}:${i & ~t}`;
      assert(!encoded.has(code));
      encoded.add(code);
    }
  }
  assert(sharedFingerprints > 0);
  const empty = graph(3, []), t = 1 << 1;
  assert.notEqual(encode(empty, t, 1).candidates, encode(empty, t, 1, [2, 1, 0]).candidates);
});

test('4V0M: exhaustive valid supersaturation parameters bound all independent k-sets', () => {
  let cases = 0, nonemptyRemainders = 0;
  for (let n = 2; n <= 5; n++) for (const g of allGraphs(n)) {
    const sets = independentSets(g), counts = coefficients(g);
    for (let r = 1; r <= n; r++) {
      let beta = Infinity;
      for (let u = 1; u < (1 << n); u++) if (bits(u) >= r)
        beta = Math.min(beta, edgeCount(g, u) / bits(u) ** 2);
      if (!(beta > 0)) continue;
      for (let s = 1; s <= n; s++) if (n * Math.exp(-beta * s) <= r) {
        cases++;
        for (let k = s; k <= n; k++) assert(counts[k] <= choose(n, s) * choose(r, k - s));
        for (const i of sets) if (bits(i) >= s) {
          const {candidates} = encode(g, i, s);
          assert(bits(candidates) <= r);
          if (bits(i) > s) nonemptyRemainders++;
        }
      }
    }
  }
  assert(cases > 0 && nonemptyRemainders > 0);
});

test('4V0M: a global edge density cannot replace the all-large-subsets condition', () => {
  // K_50 together with 50 isolated vertices; choose 41 of the isolated vertices.
  const n = 100, beta = choose(50, 2) / n ** 2, r = 30, s = 10, k = 41;
  assert(n * Math.exp(-beta * s) <= r);
  assert.equal(choose(r, k - s), 0);
  assert(50 >= k);
  assert(0 < beta * k ** 2);
});

test('4V0P/0Q: exact subset discrepancies give the threshold and ceiling direction', () => {
  let thresholdCases = 0;
  for (let n = 1; n <= 5; n++) for (const g of allGraphs(n)) for (const p of [0.25, 0.5, 1]) {
    let beta = 0;
    for (let u = 1; u < (1 << n); u++)
      beta = Math.max(beta, Math.abs(edgeCount(g, u) - p * choose(bits(u), 2)) / bits(u));
    assert(Math.max(...independentSets(g).map(bits)) <= 1 + 2 * beta / p + 1e-12);
    const r = Math.ceil(2 + 4 * beta / p);
    for (let u = 1; u < (1 << n); u++) if (bits(u) >= r) {
      thresholdCases++;
      assert(edgeCount(g, u) + 1e-12 >= p * bits(u) ** 2 / 4);
    }
  }
  assert(thresholdCases > 0);
  const n = 100, r = 50, p = 1, raw = 4 / p * Math.log(n / r);
  assert(n * Math.exp(-p * Math.ceil(raw) / 4) <= r);
  assert(n * Math.exp(-p * Math.floor(raw) / 4) > r);
  assert.equal(edgeCount(graph(1, [])), 0);
  assert(0 < 1 / 4, 'the additive 2 cannot be dropped at beta=0 and |U|=1');
});

test('4V0N: blockwise bipartition removes K4 only under the block-intersection premise', () => {
  const blocks = [[0, 1, 2, 3], [3, 4, 5, 6]];
  const hasK4 = g => {
    for (let set = 0; set < (1 << g.length); set++) if (bits(set) === 4 && edgeCount(g, set) === 6) return true;
    return false;
  };
  for (let choices = 0; choices < 256; choices++) {
    const edges = blocks.flatMap((block, b) => block.flatMap((u, i) =>
      block.slice(0, i).filter((v, j) => ((choices >> (4 * b + i)) & 1) !== ((choices >> (4 * b + j)) & 1)).map(v => [u, v])));
    assert(!hasK4(graph(7, edges)));
  }
  const k4 = graph(4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]);
  assert(edgesOf(k4).every(edge => triangles(graph(4, [edge])) === 0));
  assert(hasK4(k4), 'using each edge as a block violates the three-vertices-in-one-block premise');
});

test('4V0V: mixed moments equal exact weighted coordinate-square sums', () => {
  const weights = [1, 2, 3], denominator = 6;
  const features = [[[1, -2], [-1, 3], [2, 1]], [[-2, 1], [1, -1], [3, 2]]];
  const dot = (a, b) => a.reduce((sum, x, j) => sum + x * b[j], 0);
  for (let a = 0; a <= 3; a++) for (let b = 0; b <= 3; b++) {
    let directNumerator = 0;
    for (let u = 0; u < 3; u++) for (let v = 0; v < 3; v++)
      directNumerator += weights[u] * weights[v] * dot(features[0][u], features[0][v]) ** a * dot(features[1][u], features[1][v]) ** b;
    const slots = [...Array(a).fill(0), ...Array(b).fill(1)];
    let squareNumerator = 0;
    for (let coordinates = 0; coordinates < 2 ** slots.length; coordinates++) {
      let meanNumerator = 0;
      for (let u = 0; u < 3; u++) meanNumerator += weights[u] * slots.reduce((product, i, h) => product * features[i][u][(coordinates >> h) & 1], 1);
      squareNumerator += meanNumerator ** 2;
    }
    assert.equal(directNumerator, squareNumerator);
    assert(directNumerator >= 0);
    if (a === 0 && b === 0) assert.equal(directNumerator, denominator ** 2);
  }
});

test('4V0V: independence, identical laws and joint moments are genuinely needed', () => {
  // Identical symmetric marginals but anti-coupled U'=-U give a negative first moment.
  assert.equal((1 * -1 + -1 * 1) / 2, -1);
  // Independent constants with different laws also give a negative inner product.
  assert.equal(1 * -1, -1);
  // Every marginal integer moment is nonnegative; the mixed first moment is negative.
  const pairs = [[1, -1], [-1, 1]];
  for (let m = 0; m <= 8; m++) for (let i = 0; i < 2; i++)
    assert(pairs.reduce((sum, pair) => sum + pair[i] ** m, 0) >= 0);
  assert.equal(pairs.reduce((sum, [x, y]) => sum + x * y, 0) / 2, -1);
});

test('4V0T: a red path in a triangle is not induced, and edgeless colour conditions are vacuous', () => {
  const inducedPath = g => g.length === 3 && edgeCount(g) === 2;
  const red = graph(3, [[0, 1], [1, 2]]), host = graph(3, [[0, 1], [1, 2], [0, 2]]);
  assert(inducedPath(red));
  assert(!inducedPath(host));
  assert(edgesOf(graph(3, [])).every(() => false));
});
