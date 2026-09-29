import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'research/icm2026-number-theory.json'), 'utf8'));
const ids = new Set(manifest.entries.map(([id]) => id));
assert.equal(ids.size, manifest.entries.length);
assert.equal(manifest.notes.length, ids.size);
for (const note of manifest.notes) {
  assert(ids.has(note.id));
  const source = fs.readFileSync(path.join(root, note.path), 'utf8');
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'), note.sha256, `${note.id}: review snapshot changed`);
}
const home = fs.readFileSync(path.join(root, 'trees/0063.tree'), 'utf8');
for (const paper of manifest.papers) {
  assert(home.includes(`](${paper.outline})`), `${paper.outline}: not on number theory page`);
  for (const targets of Object.values(paper.coverage)) for (const id of targets) assert(ids.has(id));
}
for (const id of [...manifest.proofs_written, ...manifest.research_statements_without_local_proof]) assert(ids.has(id));

// Compare the determinant parametrization with direct enumeration, including bc=0.
let matrixCases = 0;
for (let q = 3; q <= 8; q++) for (let T = 1; T <= 14; T++) {
  const values = [];
  for (let a = -T; a <= T; a++) if ((a - 1) % q === 0) values.push(a);
  const off = [];
  for (let b = -T; b <= T; b++) if (b % q === 0) off.push(b);
  let direct = 0, parametric = 0;
  for (const A of values) for (const D of values) for (const B of off) for (const C of off) {
    if (A * D - B * C === 1) direct++;
    const a = (A - 1) / q, d = (D - 1) / q, b = B / q, c = C / q;
    if (a + d + (a * d - b * c) * q === 0) parametric++;
  }
  assert.equal(direct, parametric, `SL2 q=${q} T=${T}`);
  matrixCases++;
}
for (const p of [2, 3, 5, 7]) {
  let count = 0;
  for (let a = 0; a < p; a++) for (let b = 0; b < p; b++)
    for (let c = 0; c < p; c++) for (let d = 0; d < p; d++)
      if (((a * d - b * c) % p + p) % p === 1) count++;
  assert.equal(count, p * (p * p - 1));
}
for (const [root, modulus] of [[3, 7], [10, 49], [108, 343]]) assert.equal((root * root - 2) % modulus, 0);
assert.equal((10 - 3) % 7, 0);
assert.equal((108 - 10) % 49, 0);
const gcd = (a, b) => b ? gcd(b, a % b) : a;
let exponentialSumCases = 0;
for (let c = 2; c <= 20; c++) for (let a = 0; a < c; a++) for (let b = 0; b < c; b++) {
  let re = 0, im = 0, divisors = 0;
  for (let d = 1; d <= c; d++) {
    if (c % d === 0) divisors++;
    if (gcd(d, c) !== 1) continue;
    let inv = 1;
    while (d * inv % c !== 1) inv++;
    const angle = 2 * Math.PI * (a * d + b * inv) / c;
    re += Math.cos(angle); im += Math.sin(angle);
  }
  assert(Math.hypot(re, im) <= Math.sqrt(gcd(gcd(a, b), c) * c) * divisors + 1e-9);
  exponentialSumCases++;
}
console.log(JSON.stringify({notes: ids.size, matrixCases, finiteGroupCases: 4, henselLifts: 3,
  exponentialSumCases, limitation: 'Finite examples check arithmetic conventions; they do not prove the cited research theorems.'}, null, 2));
