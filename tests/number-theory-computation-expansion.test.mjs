import assert from 'node:assert/strict';

const mod = (a, p) => ((a % p) + p) % p;
const mm = (a, b) => a.map(row => b[0].map((_, j) =>
  row.reduce((sum, x, k) => sum + x * b[k][j], 0n)));
const rm = (a, p) => a.map(row => row.map(x => mod(x, p)));
const ident = d => Array.from({ length: d }, (_, i) =>
  Array.from({ length: d }, (_, j) => BigInt(i === j)));
const bits = x => (x < 0n ? -x : x).toString(2).length + 1;
const matrixBits = a => a.flat().reduce((n, x) => n + bits(x), 0);

function tree(A, m, lo, hi) {
  if (hi - lo === 1) return { lo, P: A[lo], M: m[lo] };
  const mid = (lo + hi) >> 1;
  const L = tree(A, m, lo, mid), R = tree(A, m, mid, hi);
  return { lo, L, R, P: mm(L.P, R.P), M: L.M * R.M };
}
function descend(node, v, outputs) {
  v = rm(v, node.M);
  if (!node.L) { outputs[node.lo] = v; return; }
  descend(node.L, v, outputs);
  descend(node.R, mm(v, node.L.P), outputs);
}
function product(m, lo = 0, hi = m.length) {
  if (lo === hi) return 1n;
  if (hi - lo === 1) return m[lo];
  const mid = (lo + hi) >> 1;
  return product(m, lo, mid) * product(m, mid, hi);
}
function treeBits(node) {
  return bits(node.M) + matrixBits(node.P)
    + (node.L ? treeBits(node.L) + treeBits(node.R) : 0);
}
function forest(A, m, initial, blocks) {
  assert.equal(A.length % blocks, 0);
  const size = A.length / blocks, outputs = [], states = [];
  let Q = product(m), U = rm(initial, Q), maxTreeBits = 0;
  for (let b = 0; b < blocks; b++) {
    const lo = b * size, hi = lo + size, node = tree(A, m, lo, hi);
    maxTreeBits = Math.max(maxTreeBits, treeBits(node));
    states.push({ lo, Q, U });
    descend(node, rm(U, node.M), outputs);
    assert.equal(Q % node.M, 0n);
    Q /= node.M;
    U = rm(mm(U, node.P), Q);
  }
  assert.equal(Q, 1n);
  assert.deepEqual(U, initial.map(row => row.map(() => 0n)));
  return { outputs, states, maxTreeBits };
}

let seed = 164927;
const rand = n => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % n;
};
let forestRuns = 0, boundaryStates = 0;
for (let test = 0; test < 120; test++) {
  const n = 2 ** (1 + rand(5)), d = 1 + rand(3);
  const A = Array.from({ length: n }, () => Array.from({ length: d }, () =>
    Array.from({ length: d }, () => BigInt(rand(9) - 4))));
  const m = Array.from({ length: n }, () => BigInt(1 + rand(18)));
  const v = [Array.from({ length: d }, () => BigInt(rand(9) - 4))];
  const exact = [v];
  for (const a of A) exact.push(mm(exact.at(-1), a));
  for (let blocks = 1; blocks <= n; blocks *= 2) {
    const f = forest(A, m, v, blocks);
    assert.deepEqual(f.outputs, m.map((p, j) => rm(exact[j], p)));
    for (const state of f.states) {
      assert.equal(state.Q, product(m, state.lo));
      assert.deepEqual(state.U, rm(exact[state.lo], state.Q));
      boundaryStates++;
    }
    forestRuns++;
  }
}
const exampleForest = forest([2n, 3n, 4n, 5n].map(x => [[x]]),
  [5n, 7n, 11n, 13n], [[1n]], 2);
assert.deepEqual(exampleForest.outputs.map(a => a[0][0]), [1n, 2n, 6n, 11n]);
const spaceA = Array.from({ length: 64 }, (_, j) => [[BigInt(j + 2), 1n], [1n, 1n]]);
const spaceM = Array(64).fill(3n);
const storedTreeBits = [1, 2, 4, 8, 16, 32, 64].map(q =>
  forest(spaceA, spaceM, [[1n, 0n]], q).maxTreeBits);
for (let i = 1; i < storedTreeBits.length; i++) assert(storedTreeBits[i] < storedTreeBits[i - 1]);

function pow(a, n, p) {
  let result = 1n;
  while (n > 0n) {
    if (n & 1n) result = mod(result * a, p);
    a = mod(a * a, p);
    n >>= 1n;
  }
  return result;
}
function trim(a) {
  while (a.length > 1 && a.at(-1) === 0n) a.pop();
  return a;
}
function pmul(a, b, p) {
  const c = Array(a.length + b.length - 1).fill(0n);
  a.forEach((x, i) => b.forEach((y, j) => { c[i + j] = mod(c[i + j] + x * y, p); }));
  return trim(c);
}
function ppow(a, n, p) {
  let c = [1n];
  for (let j = 0; j < n; j++) c = pmul(c, a, p);
  return c;
}
function shift(a, t, p) {
  let c = [0n];
  for (let j = a.length - 1; j >= 0; j--) {
    c = pmul(c, [t, 1n], p);
    c[0] = mod(c[0] + a[j], p);
  }
  return trim(c);
}
function prem(a, b, p) {
  a = [...a];
  const inv = pow(b.at(-1), p - 2n, p);
  while (!(a.length === 1 && a[0] === 0n) && a.length >= b.length) {
    const k = a.length - b.length, c = mod(a.at(-1) * inv, p);
    b.forEach((v, j) => { a[k + j] = mod(a[k + j] - c * v, p); });
    trim(a);
  }
  return a;
}
function squarefree(f, p) {
  let a = f.map(x => mod(x, p));
  let b = trim(f.slice(1).map((x, i) => mod(BigInt(i + 1) * x, p)));
  while (!(b.length === 1 && b[0] === 0n)) [a, b] = [b, prem(a, b, p)];
  return a.length === 1;
}
function choose(n, k) {
  let result = 1n;
  for (let i = 1; i <= k; i++) result = result * BigInt(n - i + 1) / BigInt(i);
  return result;
}
const T = (a, g, p) => Array.from({ length: g }, (_, i) =>
  Array.from({ length: g }, (_, j) => j < i ? 0n : mod(choose(j, i) * pow(a, BigInt(j - i), p), p)));
function extract(f, p) {
  const out = [];
  for (let j = Number(p) - 1; j < f.length; j += Number(p)) out.push(f[j]);
  return trim(out.length ? out : [0n]);
}
function hw(f, g, p) {
  const c = ppow(f.map(x => mod(x, p)), Number((p - 1n) / 2n), p);
  return Array.from({ length: g }, (_, i) => Array.from({ length: g }, (_, j) =>
    c[Number(p) * (i + 1) - (j + 1)] ?? 0n));
}
function recurrenceMatrix(f, k) {
  const d = f.length - 1;
  const A = Array.from({ length: d }, () => Array(d).fill(0n));
  for (let r = 0; r < d - 1; r++) A[r + 1][r] = 2n * k * f[0];
  for (let j = 1; j <= d; j++) A[d - j][d - 1] = (BigInt(j) - 2n * k) * f[j];
  return A;
}
function firstRow(f, g, p) {
  const d = f.length - 1;
  assert.notEqual(mod(f[0], p), 0n);
  let v = [Array.from({ length: d }, (_, j) => BigInt(j === d - 1))];
  for (let k = 1n; k < p; k++) {
    v = rm(mm(v, recurrenceMatrix(f, k)), p);
  }
  const factor = -pow(mod(f[0], p), (p - 1n) / 2n, p);
  return v[0].slice(-g).reverse().map(x => mod(factor * x, p));
}
function weights(nodes, p) {
  const nums = nodes.map((_, i) => nodes.reduce((c, a, j) =>
    j === i ? c : pmul(c, [mod(-a, p), 1n], p), [1n]));
  const den = nodes.map((a, i) => nums[i].reduceRight((r, x) => mod(r * a + x, p), 0n));
  const products = [1n];
  for (const d of den) { assert.notEqual(d, 0n); products.push(mod(products.at(-1) * d, p)); }
  const inverses = Array(nodes.length);
  let t = pow(products.at(-1), p - 2n, p);
  for (let i = nodes.length - 1; i >= 0; i--) {
    inverses[i] = mod(t * products[i], p);
    t = mod(t * den[i], p);
  }
  return nums.map((c, i) => c.map(x => mod(x * inverses[i], p)));
}
function reconstruct(rows, nodes, p) {
  const g = nodes.length, L = weights(nodes, p);
  const B = rows.map((row, i) => rm(mm([row], T(nodes[i], g, p)), p)[0]);
  return Array.from({ length: g }, (_, r) => Array.from({ length: g }, (_, j) =>
    mod(B.reduce((sum, row, i) => sum + row[j] * (L[i][r] ?? 0n), 0n), p)));
}

let extractorCases = 0, conjugacyCases = 0, curveCases = 0, firstRowCases = 0;
for (const p of [3n, 5n, 7n, 11n, 13n, 17n, 19n]) {
  for (let test = 0; test < 20; test++) {
    const f = Array.from({ length: 1 + rand(90) }, () => BigInt(rand(Number(p))));
    const a = BigInt(rand(Number(p)));
    assert.deepEqual(extract(shift(f, a, p), p), shift(extract(f, p), a, p));
    extractorCases++;
  }
  for (let g = 1; g <= 4; g++) for (let test = 0; test < 12; test++) {
    const f = Array.from({ length: 2 * g + 1 + rand(2) }, () => BigInt(rand(Number(p))));
    f.push(1n);
    if (!squarefree(f, p)) continue;
    const W = hw(f, g, p);
    // Conjugacy does not require p >= g, distinct nodes, or f(a) != 0.
    for (let a = 0n; a < p; a++) {
      const fa = shift(f, a, p), Wa = hw(fa, g, p);
      assert.deepEqual(Wa, rm(mm(mm(T(a, g, p), W), T(-a, g, p)), p));
      assert.deepEqual(rm(mm(T(a, g, p), T(-a, g, p)), p), ident(g));
      conjugacyCases++;
      if (fa[0] !== 0n) { assert.deepEqual(firstRow(fa, g, p), Wa[0]); firstRowCases++; }
    }
    if (Number(p) >= g) {
      const nodes = Array.from({ length: g }, (_, i) => BigInt(i));
      assert.deepEqual(reconstruct(nodes.map(a => hw(shift(f, a, p), g, p)[0]), nodes, p), W);
    }
    curveCases++;
  }
}

const example = { f: [1n, 1n, 0n, 0n, 0n, 1n], g: 2, p: 11n };
assert(squarefree(example.f, example.p));
const exampleNodes = [0n, 1n];
const exampleRows = exampleNodes.map(a => firstRow(shift(example.f, a, example.p), 2, example.p));
const exampleB = exampleRows.map((r, i) => rm(mm([r], T(exampleNodes[i], 2, example.p)), example.p)[0]);
const exampleW = hw(example.f, 2, example.p);
assert.deepEqual(reconstruct(exampleRows, exampleNodes, example.p), exampleW);
assert.deepEqual(exampleRows, [[10n, 5n], [4n, 6n]]);
assert.deepEqual(exampleB, [[10n, 5n], [4n, 10n]]);
assert.deepEqual(exampleW, [[10n, 5n], [5n, 5n]]);
assert.deepEqual(exampleRows.map(row => row.map(x => mod(-x, 11n)).reverse()), [[6n, 1n], [5n, 7n]]);

function integerShift(f, a) {
  return f.map((_, j) => f.reduce((sum, c, k) =>
    k < j ? sum : sum + c * choose(k, j) * a ** BigInt(k - j), 0n));
}
let fullMatrixBatchCases = 0;
const batchPrimes = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n];
for (const g of [2, 3]) {
  const f = Array(2 * g + 2).fill(0n);
  f[0] = f[1] = f[2 * g + 1] = 1n;
  const nodes = Array.from({ length: g }, (_, j) => BigInt(j));
  const shifts = nodes.map(a => integerShift(f, a));
  const primes = batchPrimes.filter(p => squarefree(f, p)
    && shifts.every(F => mod(F[0], p) !== 0n)
    && new Set(nodes.map(a => mod(a, p))).size === g);
  const moduli = Array(64).fill(1n);
  for (const p of primes) moduli[Number(p) - 1] = p;
  for (const blocks of [1, 2, 4, 8, 16, 32, 64]) {
    const firstRows = shifts.map(F => {
      const A = Array.from({ length: 64 }, (_, k) => recurrenceMatrix(F, BigInt(k + 1)));
      const e = [Array.from({ length: F.length - 1 }, (_, j) => BigInt(j === F.length - 2))];
      const outputs = forest(A, moduli, e, blocks).outputs;
      return primes.map(p => outputs[Number(p) - 1][0].slice(-g).reverse().map(x =>
        mod(-pow(mod(F[0], p), (p - 1n) / 2n, p) * x, p)));
    });
    primes.forEach((p, j) => {
      assert.deepEqual(reconstruct(firstRows.map(rows => rows[j]), nodes, p), hw(f, g, p));
      fullMatrixBatchCases++;
    });
  }
}
console.log(JSON.stringify({ result: 'pass', forestRuns, boundaryStates, extractorCases,
  conjugacyCases, curveCases, firstRowCases, fullMatrixBatchCases,
  storedProductTreeBitsByBlocks: storedTreeBits,
  storageScope: 'Logical stored product-node bits only, not measured JS heap or arithmetic workspace.',
  workedExample: { ...example, rows: exampleRows, transformedRows: exampleB, W: exampleW,
    coefficients: ppow(example.f, 5, 11n) },
}, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
