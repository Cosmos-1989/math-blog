import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {normalizeFormat, prose, styleRules} from '../scripts/note-editorial-lib.mjs';
import {bodyLinks, linksInsideMath} from '../scripts/note-prerequisite-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = 'trees/math/optimization/higher-order-nesterov';
const ids = [...Array.from({length: 14}, (_, i) => '500' + i.toString(36).toUpperCase()), 'icm2026-nesterov'];
const fileFor = id => path.join(root, id.startsWith('icm') ? 'trees/references' : folder, id + '.tree');
const source = Object.fromEntries(ids.map(id => [id, fs.readFileSync(fileFor(id), 'utf8')]));
const packet = JSON.parse(fs.readFileSync(path.join(root, 'research/plenary-nesterov-packet.json'), 'utf8'));
const forest = new Map();
for (const f of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(f => f.endsWith('.tree'))) {
  const id = path.basename(f, '.tree');
  if (!forest.has(id)) forest.set(id, []);
  forest.get(id).push(path.join(root, 'trees', f));
}
const sha = text => createHash('sha256').update(text).digest('hex');
const textOf = id => fs.readFileSync(forest.get(id)[0], 'utf8');
const links = text => bodyLinks(text).map(l => l.target);
const close = (a, b, tol = 1e-9) => assert(Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);
const le = (a, b, tol = 1e-9) => assert(a <= b + tol * Math.max(1, Math.abs(a), Math.abs(b)), `${a} > ${b}`);
const factorial = n => n <= 1 ? 1 : n * factorial(n - 1);
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const norm = a => Math.hypot(...a);
const add = (a, b) => a.map((x, i) => x + b[i]);
const scale = (a, s) => a.map(x => s * x);
const outer = a => a.map(x => a.map(y => x * y));
const matAdd = (a, b) => a.map((r, i) => add(r, b[i]));
const matScale = (a, s) => a.map(r => scale(r, s));
const identity = n => Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => Number(i === j)));
const quadratic = (a, u) => dot(u, a.map(r => dot(r, u)));
const psd2 = a => {
  const min = (a[0][0] + a[1][1] - Math.hypot(a[0][0] - a[1][1], 2 * a[0][1])) / 2;
  le(0, min, 2e-8);
};

test('packet covers exactly the owned prefix, every page and every proof/source scope', () => {
  assert.equal(packet.report.outline, '5000');
  assert.equal(packet.report.prefix, '50');
  assert.deepEqual([...forest.keys()].filter(id => id.startsWith('50')).sort(), ids.filter(id => id.startsWith('50')).sort());
  for (const object of [packet.prerequisites, packet.report.proof_scope, packet.report.claim_sources])
    assert.deepEqual(Object.keys(object).sort(), [...ids].sort());
  for (const id of ids) {
    assert(packet.report.proof_scope[id].scope);
    assert(packet.report.claim_sources[id].length);
    for (const claim of packet.report.claim_sources[id]) {
      assert.match(claim.url, /^https:\/\//);
      assert(claim.location);
    }
  }
  assert.deepEqual(packet.report.subject_ids, ['0070', '006F', '006E']);
  assert(source['icm2026-nesterov'].includes(packet.report.source_url));
});

test('metadata, unique titles, explicit links, formatting and source hashes are valid', () => {
  assert.equal(packet.validation.test_sha256, sha(fs.readFileSync(fileURLToPath(import.meta.url))));
  const titles = new Map();
  for (const id of forest.keys()) {
    const title = textOf(id).match(/^\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  for (const [id, text] of Object.entries(source)) {
    assert.equal(forest.get(id).length, 1, id);
    assert.match(text, /^\\title\{[^\n]+\}\n\\date\{2026-10-28\}\n\\taxon\{[^}]+\}\n\\author\{author\}\n\\meta\{source\}/);
    assert.deepEqual(titles.get(text.match(/^\\title\{([^\n]+)\}/)[1]), [id]);
    assert.equal(normalizeFormat(text), text, id + ': format');
    assert.equal(packet.validation.source_sha256[id], sha(text), id + ': snapshot');
    for (const target of links(text)) assert(forest.has(target), `${id} -> ${target}`);
    assert.deepEqual(linksInsideMath(text), [], id);
    assert(!/(?<!\\)%|\[\[|\\!/.test(text), id + ': Forester hazard');
    for (const [rule, pattern] of styleRules) {
      pattern.lastIndex = 0;
      assert(!pattern.test(prose(text)), `${id}: ${rule}`);
    }
  }
});

test('all owned notes are reachable from the narrative, including the reference', () => {
  const reached = new Set(), pending = ['5000'];
  while (pending.length) {
    const id = pending.pop();
    if (reached.has(id) || !source[id]) continue;
    reached.add(id);
    pending.push(...links(source[id]));
  }
  assert.deepEqual([...reached].sort(), [...ids].sort());
});

test('prerequisites are atomic, explicit, and acyclic through existing foundations', () => {
  const prior = JSON.parse(fs.readFileSync(path.join(root, 'research/site-evergreen-audit.json'), 'utf8'));
  const graph = {...prior.prerequisites, ...packet.prerequisites};
  for (const [id, targets] of Object.entries(packet.prerequisites)) {
    assert.equal(new Set(targets).size, targets.length, id);
    for (const target of targets) {
      assert(links(source[id]).includes(target), `${id} -> ${target}`);
      assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(textOf(target)), target);
    }
  }
  assert.match(textOf('0A44'), /^\\title\{连续实函数的介值定理\}/);
  assert(!packet.prerequisites['5002'].includes('4R0Q'));
  const visited = new Set(), active = new Set();
  function visit(id, route = []) {
    assert(!active.has(id), 'cycle: ' + [...route, id].join(' -> '));
    if (visited.has(id)) return;
    active.add(id);
    for (const child of graph[id] ?? []) visit(child, [...route, id]);
    active.delete(id);
    visited.add(id);
  }
  ids.forEach(id => visit(id));
  for (const baseline of ['0A32', '0A3D', '0A3C', '0A44', '0N0A', '0N0B', '0R06']) assert(visited.has(baseline), baseline);
  console.log(`Nesterov prerequisite closure: ${visited.size} nodes.`);
});

test('source boundaries, exact inner solves, and existing 4R results stay explicit', () => {
  assert.equal(packet.report.report_complete, false);
  assert.equal(packet.report.full_video_read, false);
  assert.equal(packet.report.full_transcript_read, false);
  assert.equal(packet.report.coverage_status, 'preliminary-selected-branches');
  assert.equal(packet.report.proof_scope['500D'].status, 'cited-research-theorem');
  assert.equal(packet.report.proof_scope['500C'].status, 'local-background-proof');
  assert(source['5000'].includes('](4R0Q)') && source['5000'].includes('](4R0R)'));
  assert.match(source['500D'], /精确求解/);
  assert.match(source['5009'], /不需要假设原函数强凸/);
  for (const t of ['12:24', '25:05', '27:22', '41:43'])
    assert(packet.video_observations.some(o => o.time === t && o.read_method === 'original-video-frame'));
  assert(packet.report.remaining_branches.length > 0);
  assert(packet.report.unexpanded_deep_proofs.length > 0);
  assert(!/\d\d:\d\d/.test(prose(source['5000'])));
});

const formulas = [];
for (const [id, text] of Object.entries(source)) {
  const re = /##?\{/g;
  for (let m; (m = re.exec(text));) {
    const start = re.lastIndex;
    let depth = 1, end = start;
    for (; end < text.length && depth; end++) {
      if (text[end] === '\\' && /[{}]/.test(text[end + 1] ?? '')) { end++; continue; }
      if (text[end] === '{') depth++;
      if (text[end] === '}') depth--;
    }
    assert.equal(depth, 0, id + ': unclosed math');
    formulas.push({id, tex: text.slice(start, end - 1)});
    re.lastIndex = end;
  }
}
test('every formula including reference metadata passes strict KaTeX without skips', () => {
  const katexPath = path.resolve(process.env.KATEX_PATH ?? '/tmp/ziegler-katex-0.16.8.cjs');
  assert(fs.existsSync(katexPath), 'Set KATEX_PATH to an installed KaTeX CommonJS bundle.');
  const katex = createRequire(import.meta.url)(katexPath);
  assert(formulas.length > 250);
  for (const {id, tex} of formulas)
    assert.doesNotThrow(() => katex.renderToString(tex, {throwOnError: true, strict: 'error'}), id + ': ' + tex);
  console.log(`Nesterov: ${formulas.length} formula groups; KaTeX ${katex.version}.`);
});

// These finite calculations are regressions for local proofs, not proofs of cited research results.
test('5002: all three derivative remainders for p=3,...,7 on a globally Lipschitz test family', () => {
  const derivative = (x, j) => Math.cos(x + j * Math.PI / 2);
  for (let p = 3; p <= 7; p++) for (let j = 0; j <= 2; j++)
    for (const x of [-2, -0.3, 0, 1.2]) for (const h of [-1.7, -0.1, 0, 0.4, 2]) {
      let approx = 0;
      for (let r = 0; r <= p - j; r++) approx += derivative(x, j + r) * h ** r / factorial(r);
      le(Math.abs(derivative(x + h, j) - approx), Math.abs(h) ** (p + 1 - j) / factorial(p + 1 - j));
    }
});

test('5002/5004: separable quartic tensor remainders and the regularizer Hessian constants', () => {
  for (const s of [[1, 2, -1], [0, 0, 0], [0.1, -0.7, 2]]) {
    le(s.reduce((a, x) => a + x ** 4, 0) / 24, norm(s) ** 4 / 24);
    le(norm(s.map(x => x ** 3 / 6)), norm(s) ** 3 / 6);
    le(Math.max(...s.map(x => x ** 2 / 2)), norm(s) ** 2 / 2);
  }
  for (let p = 2; p <= 7; p++) for (const s of [[1, 2], [-0.7, 0.4]]) {
    const r = norm(s), H = p;
    const hessian = matScale(matAdd(matScale(identity(2), r ** (p - 1)), matScale(outer(s), (p - 1) * r ** (p - 3))), H / factorial(p));
    psd2(matAdd(hessian, matScale(identity(2), -(r ** (p - 1)) / factorial(p - 1))));
  }
});

test('5003: every tested positive quartic coefficient retains negative curvature', () => {
  for (const a of [0.01, 0.5, 1, 7, 100]) {
    const t = -1 / (4 * a), d2 = 6 * t + 12 * a * t * t;
    close(d2, -3 / (4 * a));
    assert(d2 < 0);
  }
});

const increasingRoot = f => {
  let lo = -1, hi = 1;
  while (f(lo) > 0) lo *= 2;
  while (f(hi) < 0) hi *= 2;
  for (let j = 0; j < 110; j++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
};

test('5005/5006: actual exact third-order steps satisfy descent, comparison and the stated rate', () => {
  const H = 3, L = 1, f = x => x ** 4 / 24;
  for (const initial of [-2, -0.5, 0.7, 3]) {
    let x = initial;
    const A = (H + L) * Math.abs(initial) ** 4 / 24;
    for (let k = 1; k <= 25; k++) {
      const old = x;
      const s = increasingRoot(h => old ** 3 / 6 + old ** 2 * h / 2 + old * h ** 2 / 2 + H * h ** 3 / 6);
      x += s;
      le(f(x), f(old));
      for (const z of [-3, -0.1, 0, 1, 2]) le(f(x), f(z) + (H + L) * Math.abs(z - old) ** 4 / 24);
      le(Math.abs(x ** 3 / 6), (H + L) * Math.abs(s) ** 3 / 6);
      le(f(x), A * (1 + (k - 1) / 4 ** (4 / 3)) ** -3);
    }
  }
});

test('5006: reciprocal recurrence has the claimed constants and admissible alpha', () => {
  for (let p = 2; p <= 8; p++) for (const A of [0.1, 1, 12]) {
    let delta = A;
    const c = p / (p + 1) * ((p + 1) * A) ** (-1 / p);
    for (let k = 1; k <= 120; k++) {
      le(delta, A * (1 + (k - 1) / (p + 1) ** (1 + 1 / p)) ** -p);
      const alpha = (delta / ((p + 1) * A)) ** (1 / p);
      assert(alpha > 0 && alpha < 1);
      const next = (1 - alpha) * delta + A * alpha ** (p + 1);
      close(next, delta - c * delta ** (1 + 1 / p));
      le(c / p, next ** (-1 / p) - delta ** (-1 / p), 1e-8);
      delta = next;
    }
  }
});

test('5007/5009: non-diagonal convex quartic models obey both matrix inequalities', () => {
  const terms = [{v: [1, 0.3], b: 0.7, a: 1}, {v: [-0.2, 1], b: -0.4, a: 0.6}];
  const L = terms.reduce((s, t) => s + t.a * norm(t.v) ** 4, 0);
  for (const x of [[0, 0], [0.4, -1], [-2, 0.7]]) for (const h of [[0, 0], [1, -0.6], [-1.5, 2]]) {
    let A = matScale(identity(2), 0.2), B = [[0, 0], [0, 0]];
    for (const {v, b, a} of terms) {
      const z = dot(v, x) + b;
      A = matAdd(A, matScale(outer(v), a * z ** 2 / 2));
      B = matAdd(B, matScale(outer(v), a * z * dot(v, h)));
    }
    for (const tau of [1.1, 2, 5]) {
      const C = matAdd(matScale(A, 1 / tau), matScale(identity(2), tau * L * norm(h) ** 2 / 2));
      psd2(matAdd(C, B)); psd2(matAdd(C, matScale(B, -1)));
      const Q = matAdd(matScale(identity(2), norm(h) ** 2), matScale(outer(h), 2));
      const F2 = matAdd(matAdd(A, B), matScale(Q, tau ** 2 * L / 2));
      const rho2 = matAdd(matScale(A, 1 - 1 / tau), matScale(Q, tau * (tau - 1) * L / 2));
      psd2(matAdd(F2, matScale(rho2, -1)));
      psd2(matAdd(matScale(rho2, (tau + 1) / (tau - 1)), matScale(F2, -1)));
    }
    for (const u of [[1, 0], [0.5, -2]])
      le(Math.abs(quadratic(B, u)), Math.sqrt(2 * L * quadratic(A, u)) * norm(h) * norm(u));
  }
});

test('5008/500A: asymmetric Bregman orientation and three-point identity', () => {
  const rho = x => x ** 4 / 4 + x * x / 2, drho = x => x ** 3 + x;
  const D = (v, u) => rho(v) - rho(u) - drho(u) * (v - u);
  close(D(1, 0) - 0.5, 0.25);
  close(D(0, 1) - 0.5, 0.75);
  for (const u of [-1, 0, 2]) for (const v of [-0.3, 0.7]) for (const z of [-2, 0, 1])
    close((drho(v) - drho(u)) * (z - v), D(z, u) - D(z, v) - D(v, u));
});

test('500A: exact Bregman inner steps satisfy distance and function geometric bounds', () => {
  const tau = 2, kappa = 3, q = 2 / 3, A = 0.8, g = -0.7, third = 1;
  const F = h => g * h + A * h * h / 2 + third * h ** 3 / 6 + tau ** 2 * h ** 4 / 8;
  const dF = h => g + A * h + third * h * h / 2 + tau ** 2 * h ** 3 / 2;
  const rho = h => (tau - 1) / (2 * tau) * A * h * h + tau * (tau - 1) / 8 * h ** 4;
  const drho = h => (tau - 1) / tau * A * h + tau * (tau - 1) / 2 * h ** 3;
  const D = (v, u) => rho(v) - rho(u) - drho(u) * (v - u);
  const star = increasingRoot(dF);
  for (const initial of [-1, 0, 1.5]) {
    let h = initial;
    const E0 = D(star, h);
    for (let k = 0; k < 16; k++) {
      const rhs = drho(h) - dF(h) / kappa;
      const next = increasingRoot(v => drho(v) - rhs);
      le(D(star, next), q * D(star, h));
      le(F(next) - F(star), (kappa - 1) * q ** k * E0);
      h = next;
    }
  }
});

test('500B: quartic scalar reduction includes singular matrices and zero linear term', () => {
  for (const lambdas of [[0, 0], [0, 2], [1, 4]]) for (const c of [[0, 0], [1, 0], [0, -2], [1, 2]])
    for (const gamma of [0.2, 1, 3]) {
      let h = [0, 0];
      if (norm(c) > 0) {
        const eq = r => r - gamma * c.reduce((s, ci, i) => s + (ci === 0 ? 0 : ci ** 2 / (lambdas[i] + r) ** 2), 0);
        let lo = 0, hi = 1;
        while (eq(hi) < 0) hi *= 2;
        for (let j = 0; j < 110; j++) {
          const mid = (lo + hi) / 2;
          if (eq(mid) < 0) lo = mid; else hi = mid;
        }
        const r = (lo + hi) / 2;
        h = c.map((ci, i) => -ci / (lambdas[i] + r));
        close(r, gamma * norm(h) ** 2);
      }
      h.forEach((hi, i) => close(c[i] + lambdas[i] * hi + gamma * norm(h) ** 2 * hi, 0));
      const value = v => dot(c, v) + v.reduce((s, vi, i) => s + lambdas[i] * vi ** 2 / 2, 0) + gamma * norm(v) ** 4 / 4;
      for (const v of [[0, 0], [1, 2], [-1, 0.3]]) le(value(h), value(v));
    }
});

test('500C: C3 but not C4 example detects first-order difference error and noise amplification', () => {
  const grad = x => Math.max(0, x) ** 3 / 6;
  for (const x of [-1, 0, 0.3]) for (const h of [-2, 0.4, 1.5]) for (const eta of [0.01, 0.1, 1]) {
    const exact = Math.max(0, x) * h * h;
    const w = (grad(x + eta * h) - 2 * grad(x) + grad(x - eta * h)) / eta ** 2;
    le(Math.abs(w - exact), eta * Math.abs(h) ** 3 / 3);
    const delta = 1e-7, noisy = w + 4 * delta / eta ** 2;
    le(Math.abs(noisy - exact), eta * Math.abs(h) ** 3 / 3 + 4 * delta / eta ** 2);
  }
  for (const eta of [0.1, 0.01, 0.001]) close((grad(eta) - 2 * grad(0) + grad(-eta)) / eta ** 2, eta / 6);
});
