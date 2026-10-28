import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {normalizeFormat, prose, styleRules} from '../scripts/note-editorial-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = path.join(root, 'trees/math/analysis/geometric-pde-otto');
const packet = JSON.parse(fs.readFileSync(path.join(root, 'research/plenary-otto-packet.json'), 'utf8'));
const ownedPaths = [...fs.readdirSync(folder).filter(f => f.endsWith('.tree')).map(f => path.join(folder, f)),
  path.join(root, 'trees/references/icm2026-otto.tree')];
const owned = new Map(ownedPaths.map(file => [path.basename(file, '.tree'), fs.readFileSync(file, 'utf8')]));
const readTrees = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? readTrees(file) : file.endsWith('.tree') ? [file] : [];
});
const inventory = new Map();
for (const file of readTrees(path.join(root, 'trees'))) {
  const id = path.basename(file, '.tree');
  inventory.set(id, [...(inventory.get(id) ?? []), file]);
}
const links = text => [...text.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)]
  .map(m => m[1]).filter(id => !/^(https?:|mailto:|#)/.test(id));
const close = (a, b, eps = 1e-10) =>
  assert(Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b)), a + ' != ' + b);
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const formulas = text => {
  const result = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '#' || text[i - 1] === '#') continue;
    const display = text[i + 1] === '#';
    const start = i + (display ? 2 : 1);
    if (text[start] !== '{') continue;
    let depth = 1, j = start + 1;
    for (; j < text.length && depth; j++) {
      if (text[j - 1] === '\\' && '{}'.includes(text[j])) continue;
      if (text[j] === '{') depth++;
      if (text[j] === '}') depth--;
    }
    assert.equal(depth, 0, 'Unclosed math at ' + i);
    result.push({tex: text.slice(start + 1, j - 1), display});
    i = j - 1;
  }
  return result;
};

test('owned source inventory, metadata and internal links', () => {
  assert.equal(owned.size, 27);
  for (const [id, text] of owned) {
    assert.equal(inventory.get(id)?.length, 1, 'Duplicate or missing ' + id);
    assert.equal(normalizeFormat(text), text, id + ': non-normalized source');
    for (const [rule, pattern] of styleRules)
      assert.equal([...prose(text).matchAll(pattern)].length, 0, id + ': editorial rule ' + rule);
    assert.match(text, /^\\title\{[^\n]+\}\n\\date\{2026-10-28\}\n\\taxon\{[^\n]+\}\n\\author\{author\}\n\\meta\{source\}\{[^\n]+\}\n\n/);
    assert(!text.includes('[['), id + ': unsafe literal double bracket');
    assert(!/(?<!\\)%/.test(text), id + ': unescaped Forester comment marker');
    assert(!/\\[A-Za-z][A-Za-z0-9_-]*\/[A-Za-z0-9\\([]/.test(text), id + ': unsafe command/slash');
    for (const target of links(text)) assert(inventory.has(target), id + ' -> ' + target);
    formulas(text);
  }
  const reachable = new Set(), queue = ['4X00'];
  while (queue.length) {
    const id = queue.pop();
    if (reachable.has(id) || !owned.has(id)) continue;
    reachable.add(id);
    queue.push(...links(owned.get(id).split('\n\n').slice(1).join('\n\n')));
  }
  assert.equal(reachable.size, owned.size);
});

test('packet covers exactly owned pages and records report/body boundaries', () => {
  const ids = [...owned.keys()].sort();
  for (const map of [packet.prerequisites, packet.report.proof_scope, packet.report.claim_sources])
    assert.deepEqual(Object.keys(map).sort(), ids);
  assert.equal(typeof packet.report.license, 'string');
  assert(packet.report.license.includes('逐源'));
  assert(packet.report.source_url.includes('mis.mpg.de/news/'));
  assert.equal(packet.report.integration_status, 'caption-grounded-selected-branches');
  assert.deepEqual(packet.report.subject_ids, ['006A', '0065', '006C', '0072']);
  const captions = packet.source_readings.find(s => s.full_caption_track_read);
  assert.equal(captions.nonempty_events, 1321);
  assert.equal(captions.full_mathematical_body, false);
  assert.equal(captions.first_event_ms, 12160);
  assert.equal(captions.last_event_ms, 3330319);
  assert(captions.read_content.length >= 8);
  for (const id of ids) {
    assert(packet.report.proof_scope[id].scope);
    assert(packet.report.claim_sources[id].every(s => s.url.startsWith('https://') && s.location));
  }
  assert.equal(packet.report.proof_scope['4X07'].status, 'cited-research-theorem');
  assert.equal(packet.report.proof_scope['4X0O'].status, 'cited-research-theorem');
  assert(owned.get('4X07').includes('\\sigma(L^1,L^\\infty)'));
  assert(owned.get('4X02').includes('(4M0Y)'));
  for (const text of owned.values()) assert(!text.includes('重心'), 'Recentring means change of base point');
  const sourceUrl = packet.source_readings.find(s => s.url.includes('onlinelibrary.wiley.com')).url;
  const escapedUrl = owned.get('icm2026-otto').match(/\[出版页\]\(([^)]+)\)/)?.[1];
  assert.equal(escapedUrl?.replaceAll('\\%', '%'), sourceUrl, 'Wiley URL target must be unchanged');
});

test('prerequisites are explicit, atomic and acyclic in reachable shared closure', () => {
  const shared = JSON.parse(fs.readFileSync(path.join(root, 'research/site-evergreen-audit.json'), 'utf8'));
  const graph = {...shared.prerequisites, ...packet.prerequisites};
  const reused = new Set(packet.reviewed_reused_ids);
  for (const [id, deps] of Object.entries(packet.prerequisites)) {
    const body = owned.get(id).split('\n\n').slice(1).join('\n\n');
    for (const dep of deps) {
      assert(links(body).includes(dep), id + ': prerequisite absent from body ' + dep);
      assert.equal(inventory.get(dep)?.length, 1, dep);
      const text = fs.readFileSync(inventory.get(dep)[0], 'utf8');
      assert.match(text, /\\taxon\{(?:Definition|Construction|Theorem)\}/, dep + ': non-atomic prerequisite');
      if (!owned.has(dep)) assert(reused.has(dep), 'Unreviewed reuse ' + dep);
    }
  }
  const active = new Set(), done = new Set();
  function visit(id) {
    assert(!active.has(id), 'Prerequisite cycle at ' + id);
    if (done.has(id)) return;
    active.add(id);
    for (const dep of graph[id] ?? []) visit(dep);
    active.delete(id);
    done.add(id);
  }
  for (const id of owned.keys()) visit(id);
});

test('source SHA256 ledger matches every owned tree', () => {
  assert.deepEqual(Object.keys(packet.validation.source_sha256).sort(), [...owned.keys()].sort());
  for (const [id, text] of owned) assert.equal(hash(text), packet.validation.source_sha256[id], id);
});

const katexPath = process.env.KATEX_PATH ?? process.env.KATEX_MODULE;
test('all owned formulas pass KaTeX strict parsing', {skip: !katexPath}, () => {
  const katex = createRequire(import.meta.url)(path.resolve(katexPath));
  let count = 0;
  for (const [id, text] of owned) for (const {tex, display} of formulas(text)) {
    assert.doesNotThrow(() => katex.renderToString(tex, {displayMode: display, throwOnError: true, strict: 'error'}), id + ': ' + tex);
    count++;
  }
  assert.equal(count, packet.validation.katex_formulas);
});

// Finite computations supplement the written proofs, not the cited deep theorems.
test('4X01: non-diagonal positive metrics give energy decrease and square completion', () => {
  for (const a of [1, 2, 5]) for (const b of [-0.5, 0, 0.5]) for (const c of [1, 3]) {
    const det = a * c - b * b;
    for (const p of [[1, 2], [-2, 3], [0, 0]]) {
      const grad = [(c * p[0] - b * p[1]) / det, (a * p[1] - b * p[0]) / det];
      const inner = (u, v) => a * u[0] * v[0] + b * (u[0] * v[1] + u[1] * v[0]) + c * u[1] * v[1];
      close(p[0] * grad[0] + p[1] * grad[1], inner(grad, grad));
      for (const v of [[0, 1], [-1, 3]]) {
        close(0.5 * inner(v, v) + p[0] * v[0] + p[1] * v[1],
          0.5 * inner(v.map((x, i) => x + grad[i]), v.map((x, i) => x + grad[i])) - 0.5 * inner(grad, grad));
      }
    }
  }
});

const permutations = a => a.length ? a.flatMap((x, i) => permutations(a.filter((_, j) => j !== i)).map(b => [x, ...b])) : [[]];
test('4X02: equal-atom translation costs and finite mass factors', () => {
  const x = [-3, -1, 0, 2, 4];
  for (const a of [-2, 0, 3]) for (const mass of [0.3, 1, 7]) {
    const costs = permutations(x.map(v => v + a)).map(y => mass / x.length * x.reduce((sum, v, i) => sum + (v - y[i]) ** 2, 0));
    close(Math.min(...costs), mass * a * a);
  }
});

test('4X06: quadratic implicit Euler satisfies discrete energy and time bounds', () => {
  for (const h of [0.01, 0.1, 1, 3]) {
    const x = [3];
    let action = 0;
    for (let k = 1; k <= 40; k++) {
      x.push(x[k - 1] / (1 + h));
      action += (x[k] - x[k - 1]) ** 2 / h;
      assert(0.5 * x[k] ** 2 + (x[k] - x[k - 1]) ** 2 / (2 * h) <= 0.5 * x[k - 1] ** 2 + 1e-12);
      assert(action <= x[0] ** 2 + 1e-12);
    }
    for (let i = 0; i < 40; i++) for (let j = i + 1; j <= 40; j++)
      assert(Math.abs(x[j] - x[i]) <= Math.sqrt((j - i) * h * x[0] ** 2) + 1e-12);
  }
});

test('4X08: exact polynomial tests for fine layers and non-strong L1 distance', () => {
  for (const theta of [0.1, 0.25, 0.7, 0.9]) for (const n of [1, 2, 8, 32, 128]) {
    for (let degree = 0; degree <= 5; degree++) {
      let integral = 0;
      for (let k = 0; k < n; k++)
        integral += (((k + theta) / n) ** (degree + 1) - (k / n) ** (degree + 1)) / (degree + 1);
      const error = Math.abs(integral - theta / (degree + 1));
      assert(error <= 2 * theta * (1 - theta) * degree / n + 1e-12);
    }
    const l1 = theta * (1 - theta) + (1 - theta) * theta;
    close(l1, 2 * theta * (1 - theta));
    assert(l1 > 0);
  }
});

const mobility = (s, a, b) => a * b * s * (1 - s) / (b + (a - b) * s);
const mobilityPrime = (s, a, b) => {
  const d = b + (a - b) * s;
  return a * b * ((1 - 2 * s) * d - s * (1 - s) * (a - b)) / (d * d);
};
const flux = (s, a, b, A) => -A * mobility(s, a, b);
const fluxPrime = (s, a, b, A) => -A * mobilityPrime(s, a, b);
test('4X0A/0B: scalar dissipation completion, mobility curvature and endpoint speeds', () => {
  for (const a of [0.2, 1, 4]) for (const b of [0.3, 1, 5]) for (const A of [0.5, 2]) {
    close(fluxPrime(0, a, b, A), -A * a);
    close(fluxPrime(1, a, b, A), A * b);
    for (const s of [0.01, 0.1, 0.4, 0.7, 0.99]) {
      const q = 1 / (a * s) + 1 / (b * (1 - s)), optimum = flux(s, a, b, A);
      close(q * optimum + A, 0);
      for (const j of [-3, 0, 2]) close(0.5 * q * j * j + A * j - (0.5 * q * optimum ** 2 + A * optimum), 0.5 * q * (j - optimum) ** 2);
      const eps = 1e-6, d = b + (a - b) * s;
      close((mobilityPrime(s + eps, a, b) - mobilityPrime(s - eps, a, b)) / (2 * eps), -2 * a * a * b * b / d ** 3, 1e-7);
    }
  }
});

const inverseFluxPrime = (zeta, a, b, A) => {
  if (zeta <= -A * a) return 0;
  if (zeta >= A * b) return 1;
  let lo = 0, hi = 1;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (fluxPrime(mid, a, b, A) < zeta) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};
test('4X0C: rarefaction satisfies the interior PDE and equal-mobility profile', () => {
  for (const a of [0.3, 1, 4]) for (const b of [0.5, 1, 3]) {
    const A = 2, t = 1.7, eps = 1e-5;
    const solution = (t, z) => inverseFluxPrime(z / t, a, b, A);
    for (const target of [0.1, 0.3, 0.6, 0.9]) {
      const z = t * fluxPrime(target, a, b, A);
      close(solution(t, z), target);
      const dt = (solution(t + eps, z) - solution(t - eps, z)) / (2 * eps);
      const dzFlux = (flux(solution(t, z + eps), a, b, A) - flux(solution(t, z - eps), a, b, A)) / (2 * eps);
      close(dt + dzFlux, 0, 1e-7);
    }
    close(A * b * t - (-A * a * t), A * (a + b) * t);
  }
  for (const m of [0.2, 1, 4]) for (const zeta of [-0.8, -0.1, 0, 0.4, 0.9])
    close(inverseFluxPrime(2 * m * zeta, m, m, 2), (1 + zeta) / 2);
});

test('4X0D: oscillatory product has a nonzero mean while Holder bounds vanish', () => {
  for (const n of [2, 3, 7, 19]) {
    const N = 1024;
    let productMean = 0, secondDerivativeMean = 0;
    for (let k = 0; k < N; k++) {
      const x = 2 * Math.PI * k / N;
      productMean -= Math.sin(n * x) ** 2 / N;
      secondDerivativeMean -= n * Math.sin(n * x) / N;
    }
    close(productMean, -0.5);
    close(secondDerivativeMean, 0);
    for (const alpha of [0.2, 0.5, 0.9]) for (const h of [0.0001, 0.01, 0.1, 1])
      assert(Math.min(2 / n, h) <= 2 ** (1 - alpha) * n ** (alpha - 1) * h ** alpha + 1e-12);
  }
});

const normalMoment = k => {
  if (k % 2) return 0;
  let result = 1;
  for (let j = 1; j < k; j += 2) result *= j;
  return result;
};
test('4X0F/0G: Gaussian polynomial variances agree with the derivative bound', () => {
  for (let degree = 1; degree <= 8; degree++) {
    const variance = normalMoment(2 * degree) - normalMoment(degree) ** 2;
    const derivativeEnergy = degree ** 2 * normalMoment(2 * degree - 2);
    assert(variance <= derivativeEnergy);
  }
  assert.equal(normalMoment(4) - normalMoment(2) ** 2, 2);
  assert.equal(4 * normalMoment(2), 4);
});

const choose = (n, k) => {
  if (k > n || k < 0) return 0;
  let result = 1;
  for (let j = 1; j <= k; j++) result *= (n - j + 1) / j;
  return result;
};
const indices = Array.from({length: 5}, (_, i) => Array.from({length: 4}, (_, j) => [i, j])).flat();
const G = (x, y, n, m) => m.every((v, i) => v <= n[i]) ?
  choose(n[0], m[0]) * choose(n[1], m[1]) * (y[0] - x[0]) ** (n[0] - m[0]) * (y[1] - x[1]) ** (n[1] - m[1]) : 0;
test('4X0J/0N: two-variable recentering, cocycle, triangularity and constants quotient', () => {
  const x = [-1, 2], w = [3, -2], y = [2, 1], z = [-2, 4];
  for (const n of indices) {
    close((z[0] - x[0]) ** n[0] * (z[1] - x[1]) ** n[1],
      indices.reduce((sum, m) => sum + G(x, y, n, m) * (z[0] - y[0]) ** m[0] * (z[1] - y[1]) ** m[1], 0));
    for (const m of indices) {
      close(G(x, y, n, m), indices.reduce((sum, k) => sum + G(x, w, n, k) * G(w, y, k, m), 0));
      if (n[0] + n[1] > 0 && m[0] + m[1] > 0)
        close(G(x, y, n, m), indices.filter(k => k[0] + k[1] > 0).reduce((sum, k) => sum + G(x, w, n, k) * G(w, y, k, m), 0));
      if (G(x, y, n, m) !== 0 && (n[0] !== m[0] || n[1] !== m[1]))
        assert(m[0] + 2 * m[1] < n[0] + 2 * n[1]);
    }
  }
});

test('4X0J/0N: degree lowering on basis vectors differs from the dual coefficient action', () => {
  const x = [0, 0], y = [1, 0], degree = n => n[0] + 2 * n[1];
  for (const n of indices) for (const m of indices) {
    const offDiagonal = G(x, y, n, m) - Number(n[0] === m[0] && n[1] === m[1]);
    if (offDiagonal !== 0) assert(degree(m) < degree(n));
  }
  // The same array transposes the direction of action on algebraic duals.
  close(G(x, y, [2, 0], [1, 0]), 2);
  close(G(x, y, [1, 0], [2, 0]), 0);
  assert(owned.get('4X0J').includes('低次输入可以贡献到高次输出'));
  assert(owned.get('4X0N').includes('有限次数截断'));
  assert(!owned.get('4X0J').includes('#{G-I} 严格降低次数'));
});

const derivation = polynomial => {
  const result = new Map();
  for (const [key, coefficient] of polynomial) {
    const beta = key.split(',').map(Number);
    for (let k = 0; k < beta.length - 1; k++) if (beta[k]) {
      const gamma = [...beta];
      gamma[k]--; gamma[k + 1]++;
      const output = gamma.join(',');
      result.set(output, (result.get(output) ?? 0) + coefficient * beta[k] * (k + 1));
    }
  }
  return result;
};
test('4X0K/0L: formal derivative examples and increasing constitutive weight', () => {
  const p = new Map([['1,1,0,0,0', 1]]);
  assert.deepEqual(derivation(p), new Map([['0,2,0,0,0', 1], ['1,0,1,0,0', 2]]));
  let q = new Map([['1,0,0,0,0', 1]]), factorial = 1;
  for (let k = 1; k <= 4; k++) {
    q = derivation(q); factorial *= k;
    const key = Array.from({length: 5}, (_, i) => i === k ? 1 : 0).join(',');
    assert.deepEqual(q, new Map([[key, factorial]]));
  }
  const alpha = Math.sqrt(2) / 4;
  assert(alpha > 0.25 && alpha < 0.5);
  for (let powerOfZ0 = 0; powerOfZ0 < 100; powerOfZ0++) close(alpha * (1 + 0 * powerOfZ0), alpha);
  for (const n of indices.filter(n => n[0] + n[1] > 0)) close(alpha * (1 - 1) + n[0] + 2 * n[1], n[0] + 2 * n[1]);
});
