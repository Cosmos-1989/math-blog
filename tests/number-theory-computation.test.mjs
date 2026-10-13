import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const katex = process.env.KATEX_MODULE
  ? require(path.resolve(process.env.KATEX_MODULE)) : null;
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'research/number-theory-computation.json'), 'utf8'));
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const registry = new Map();
const own = new Set(manifest.entries.map(([id]) => id));
for (const file of walk(path.join(root, 'trees')).filter(f => f.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  if (own.has(id)) assert(!registry.has(id), `Duplicate owned ID: ${id}`);
  registry.set(id, fs.readFileSync(file, 'utf8'));
}
const targets = text => [...text.matchAll(/\[([^\]\n]+)\]\(([^)\s]+)\)/g)]
  .map(m => m[2]).filter(t => !/^https?:/.test(t));
let formulas = 0, internalBodyLinks = 0;
for (const [id, prerequisites] of manifest.entries) {
  assert(registry.has(id), `Missing ${id}`);
  const text = registry.get(id);
  const links = new Set(targets(text.slice(text.indexOf('\n\n') + 2)));
  internalBodyLinks += links.size;
  for (const target of links) assert(registry.has(target), `${id}: missing ${target}`);
  for (const target of prerequisites) {
    assert(links.has(target), `${id}: prerequisite not linked: ${target}`);
    assert(!/\\taxon\{(?:Outline|Chapter|Reference)\}/.test(registry.get(target)), `${id}: non-atomic prerequisite ${target}`);
  }
  if (id.startsWith('0H')) assert(text.includes('\\meta{source}'), `${id}: no source`);
  assert(!/\\[A-Za-z][A-Za-z0-9_-]*\/[A-Za-z0-9\\]/.test(text), `${id}: command/slash parsing hazard`);
  assert(!/(?<!\\)qquad/.test(text), `${id}: missing TeX backslash`);
  let balance = 0;
  for (const char of text) {
    if (char === '{') balance++;
    if (char === '}') balance--;
    assert(balance >= 0, `${id}: unmatched closing brace`);
  }
  assert.equal(balance, 0, `${id}: unclosed brace`);
  const re = /#{1,2}\{/g;
  let match;
  while ((match = re.exec(text))) {
    const start = re.lastIndex;
    let depth = 1, end = start;
    for (; end < text.length && depth; end++) {
      if (text[end] === '{') depth++;
      if (text[end] === '}') depth--;
    }
    assert.equal(depth, 0, `${id}: unclosed formula`);
    if (katex) katex.renderToString(text.slice(start, end - 1), {
      throwOnError: true, strict: false, displayMode: match[0].startsWith('##'),
    });
    formulas++;
    re.lastIndex = end;
  }
}
const audit = JSON.parse(fs.readFileSync(path.join(root, 'research/site-evergreen-audit.json'), 'utf8'));
const dag = { ...audit.prerequisites, ...Object.fromEntries(manifest.entries.map(([id, deps]) => [id, deps])) };
const active = new Set(), visited = new Set();
function visit(id) {
  assert(!active.has(id), `Prerequisite cycle at ${id}`);
  if (visited.has(id)) return;
  active.add(id);
  for (const dep of dag[id] ?? []) visit(dep);
  active.delete(id);
  visited.add(id);
}
for (const id of own) visit(id);
const reachable = new Set(), queue = ['0H00'];
while (queue.length) {
  const id = queue.pop();
  if (reachable.has(id)) continue;
  reachable.add(id);
  queue.push(...targets(registry.get(id)).filter(t => own.has(t)));
}
for (const id of own) assert(reachable.has(id), `Not reachable from outline: ${id}`);

const mod = (a, m) => ((a % m) + m) % m;
const mm = (a, b) => a.map(row => b[0].map((_, j) =>
  row.reduce((s, x, k) => s + x * b[k][j], 0n)));
const rm = (a, m) => a.map(row => row.map(x => mod(x, m)));
function art(A, m, initial) {
  const output = [];
  function build(l, r) {
    if (r - l === 1) return { l, P: A[l], M: m[l] };
    const s = (l + r) >> 1, L = build(l, s), R = build(s, r);
    return { l, L, R, P: mm(L.P, R.P), M: L.M * R.M };
  }
  function descend(node, value) {
    value = rm(value, node.M);
    if (!node.L) { output[node.l] = value; return; }
    descend(node.L, value);
    descend(node.R, mm(value, node.L.P));
  }
  descend(build(0, A.length), initial);
  return output;
}
let seed = 234567;
function rand(n) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; }
for (let t = 0; t < 300; t++) {
  const n = 2 ** (1 + rand(5)), d = 1 + rand(3);
  const A = Array.from({ length: n }, () => Array.from({ length: d }, () =>
    Array.from({ length: d }, () => BigInt(rand(11) - 5))));
  const m = Array.from({ length: n }, () => BigInt(1 + rand(20)));
  let v = [Array.from({ length: d }, () => BigInt(rand(11) - 5))];
  const actual = art(A, m, v);
  for (let j = 0; j < n; j++) { assert.deepEqual(actual[j], rm(v, m[j])); v = mm(v, A[j]); }
}
function prime(p) {
  if (p < 2) return false;
  for (let d = 2; d * d <= p; d++) if (p % d === 0) return false;
  return true;
}
const n = 256;
const wilson = art(Array.from({ length: n }, (_, i) => [[BigInt(i + 1)]]),
  Array.from({ length: n }, (_, i) => prime(i + 1) ? BigInt((i + 1) ** 2) : 1n), [[1n]]);
let factorial = 1n;
for (let j = 1; j <= n; j++) {
  if (prime(j)) assert.equal(wilson[j - 1][0][0], mod(factorial, BigInt(j * j)));
  factorial *= BigInt(j);
}
const left = art(Array.from({ length: n }, (_, i) => [[BigInt(i + 1), 1n], [0n, 1n]]),
  Array.from({ length: n }, (_, i) => prime(i) ? BigInt(i) : 1n), [[1n, 0n]]);
let leftFactorial = 0n;
factorial = 1n;
for (let j = 0; j < n; j++) {
  if (prime(j)) assert.equal(left[j][0][1], mod(leftFactorial, BigInt(j)));
  leftFactorial += factorial;
  factorial *= BigInt(j + 1);
}
let curves = 0, recurrenceIdentities = 0;
for (let b = -3; b <= 3; b++) for (let c = -3; c <= 3; c++) {
  if (!c || !c * (b * b - 4 * c)) continue;
  const moduli = Array.from({ length: 64 }, (_, i) => {
    const p = 2 * i + 1;
    return p < 100 && prime(p) && c * (b * b - 4 * c) % p !== 0 ? BigInt(p) : 1n;
  });
  const matrixLeaves = art(Array.from({ length: 64 }, (_, i) => {
    const j = i + 1;
    return [[BigInt(b * (1 - 2 * j)), BigInt(2 * c * j)], [BigInt(2 * (1 - j)), 0n]];
  }), moduli, [[1n, 0n]]);
  const scalarLeaves = art(Array.from({ length: 64 }, (_, i) => [[BigInt(2 * (i + 1))]]), moduli, [[1n]]);
  for (let p = 3; p < 100; p++) {
    if (!prime(p) || c * (b * b - 4 * c) % p === 0) continue;
    const h = (p - 1) / 2, P = BigInt(p);
    let coefficients = [1n];
    for (let k = 0; k < h; k++) {
      const next = Array(coefficients.length + 2).fill(0n);
      for (let j = 0; j < coefficients.length; j++) {
        next[j] += BigInt(c) * coefficients[j];
        next[j + 1] += BigInt(b) * coefficients[j];
        next[j + 2] += coefficients[j];
      }
      coefficients = next;
    }
    for (let j = 1; j <= h; j++) {
      assert.equal(BigInt(2 * c * j) * coefficients[j],
        BigInt(b * (p + 1 - 2 * j)) * coefficients[j - 1]
        + BigInt(2 * (p + 1 - j)) * (coefficients[j - 2] ?? 0n));
      recurrenceIdentities++;
    }
    let v = [[1n, 0n]], denominator = 1n;
    for (let j = 1; j <= h; j++) {
      v = rm(mm(v, [[BigInt(b * (1 - 2 * j)), BigInt(2 * c * j)], [BigInt(2 * (1 - j)), 0n]]), P);
      denominator = mod(denominator * BigInt(2 * j), P);
    }
    assert.deepEqual(matrixLeaves[h], v);
    assert.equal(scalarLeaves[h][0][0], denominator);
    let inverse = 1n;
    while (mod(denominator * inverse, P) !== 1n) inverse++;
    const residue = mod(v[0][0] * inverse, P);
    assert.equal(residue, mod(coefficients[h], P));
    let count = 1;
    for (let x = 0; x < p; x++) for (let y = 0; y < p; y++)
      if ((y * y - x * x * x - b * x * x - c * x) % p === 0) count++;
    const trace = p + 1 - count;
    assert.equal(residue, mod(BigInt(trace), P));
    if (p >= 17) assert.equal(Number(residue) > (p - 1) / 2 ? Number(residue) - p : Number(residue), trace);
    curves++;
  }
}
console.log(JSON.stringify({ result: 'pass', ownedPages: own.size, formulas,
  katex: katex?.version ?? 'not run (set KATEX_MODULE)', internalBodyLinks,
  prerequisiteClosure: visited.size, randomizedMatrixCases: 300,
  wilsonAndLeftFactorialPrimeBound: 256, ellipticCurvePrimePairs: curves,
  ellipticMatrixAndScalarARTLeafPairs: curves,
  exactCoefficientRecurrenceIdentities: recurrenceIdentities,
  scope: 'Read-only source, formula and finite numerical checks; no Forester build or deep-theorem proof verification.' }, null, 2));
