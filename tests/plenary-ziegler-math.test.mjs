import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { normalizeFormat } from '../scripts/note-editorial-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = 'trees/math/number-theory/arithmetic-pattern-structure';
const packet = JSON.parse(fs.readFileSync(path.join(root, 'research/plenary-ziegler-packet.json'), 'utf8'));
const ids = ['2900', '2901', '2902', '2903',
  ...Array.from({ length: 13 }, (_, i) => '4Z0' + (i + 1).toString(36).toUpperCase()), 'icm2026-ziegler'];
const fileFor = id => path.join(root, id.startsWith('icm') ? 'trees/references' : folder, id + '.tree');
const source = Object.fromEntries(ids.map(id => [id, fs.readFileSync(fileFor(id), 'utf8')]));
const walk = dir => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const forest = new Map();
for (const file of walk(path.join(root, 'trees')).filter(f => f.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  if (!forest.has(id)) forest.set(id, []);
  forest.get(id).push(file);
}
const links = text => [...text.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)]
  .map(m => m[1]).filter(t => !/^(https?:|mailto:|#)/.test(t));
const close = (a, b) => assert(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), a + ' != ' + b);
const mod = (x, n) => ((x % n) + n) % n;
const bits = n => n.toString(2).replaceAll('0', '').length;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const conj = a => [a[0], -a[1]];
const abs = a => Math.hypot(...a);
const phase = t => [Math.cos(2 * Math.PI * t), Math.sin(2 * Math.PI * t)];
const sum = values => values.reduce(add, [0, 0]);
const tuples = function* (length, values, prefix = []) {
  if (!length) { yield prefix; return; }
  for (const value of values) yield* tuples(length - 1, values, [...prefix, value]);
};
const range = n => Array.from({ length: n }, (_, i) => i);

test('packet covers the existing topic, all new atoms and reference without 4Z00', () => {
  assert.equal(packet.report.prefix, '4Z');
  assert.equal(packet.report.outline, '2900');
  assert.deepEqual(Object.keys(packet.prerequisites).sort(), [...ids].sort());
  for (const key of ['proof_scope', 'claim_sources'])
    assert.deepEqual(Object.keys(packet.report[key]).sort(), [...ids].sort());
  assert(!forest.has('4Z00'));
  assert.deepEqual([...forest.keys()].filter(id => /^4Z[0-9A-Z]{2}$/.test(id)).sort(),
    ids.filter(id => id.startsWith('4Z')).sort());
  for (const id of ['2901', '2902', '2903']) assert(packet.report.proofs_written.includes(id));
});

test('owned sources have unique IDs, resolved links, metadata and recorded hashes', () => {
  const titles = new Set();
  for (const [id, text] of Object.entries(source)) {
    assert.equal(normalizeFormat(text), text, id + ': strict-format');
    assert.equal(forest.get(id)?.length, 1, id);
    assert.match(text, /^\\title\{[^\n]+\}\n\\date\{\d{4}-\d{2}-\d{2}\}\n\\taxon\{[^}]+\}\n\\author\{author\}\n/);
    const title = text.match(/^\\title\{(.+)\}/)[1];
    assert(!titles.has(title), id + ': duplicate title');
    titles.add(title);
    for (const target of links(text)) assert(forest.has(target), id + ' -> ' + target);
    assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text));
    assert(!/\\!|\\[A-Za-z][A-Za-z0-9_-]*\/[A-Za-z0-9\\([]/.test(text), id + ': Forester syntax hazard');
    assert.equal(createHash('sha256').update(text).digest('hex'), packet.validation.source_sha256[id], id);
  }
  const reached = new Set(), todo = ['2900'];
  while (todo.length) {
    const id = todo.pop();
    if (reached.has(id) || !source[id]) continue;
    reached.add(id);
    todo.push(...links(source[id]));
  }
  assert.deepEqual([...reached].sort(), [...ids].sort());
});

test('prerequisites have explicit links and allowed targets; combined closure is acyclic', () => {
  const shared = JSON.parse(fs.readFileSync(path.join(root, 'research/prerequisite-required-links.json'), 'utf8'));
  const graph = Object.fromEntries(Object.entries(shared.pages).map(([id, entry]) => [id, entry.targets]));
  Object.assign(graph, packet.prerequisites);
  for (const [id, targets] of Object.entries(packet.prerequisites)) for (const target of targets) {
    assert(links(source[id]).includes(target), id + ': missing prerequisite ' + target);
    const text = fs.readFileSync(forest.get(target)[0], 'utf8');
    assert.match(text, /\\taxon\{(?:Definition|Construction|Theorem)\}/, id + ' -> ' + target);
  }
  const visited = new Set(), active = new Set();
  const visit = id => {
    assert(!active.has(id), 'cycle through ' + id);
    if (visited.has(id)) return;
    active.add(id);
    for (const target of graph[id] ?? []) visit(target);
    active.delete(id);
    visited.add(id);
  };
  ids.forEach(visit);
  console.log('Ziegler prerequisite closure: ' + visited.size + ' nodes.');
});

test('report evidence stays frame-only and preliminary; deep results stay cited', () => {
  assert.equal(packet.report.coverage_status, 'preliminary-selected-branches');
  assert.equal(packet.report.report_complete, false);
  assert.equal(packet.report.full_transcript_read, false);
  assert.equal(packet.report.full_video_read, false);
  assert.equal(packet.report.source_url_role, 'official-author-listing-identity-only');
  for (const id of ['4Z04', '4Z0B', '4Z0C', '4Z0D']) {
    assert(packet.report.proof_scope[id].status.startsWith('cited-research-theorem'));
    assert.match(packet.theorem_source_checks[id].source_url, /v[35]$/);
  }
  for (const time of ['25:03', '42:18', '45:05'])
    assert(packet.video_observations.some(o => o.time === time && o.read_method === 'original-video-frame'));
  assert(packet.source_readings.some(r => r.role === 'background-2014-not-report'));
});

const formulas = [];
for (const [id, text] of Object.entries(source)) {
  const startPattern = /##?\{/g;
  for (let m; (m = startPattern.exec(text));) {
    const start = startPattern.lastIndex;
    let depth = 1, end = start;
    for (; end < text.length && depth; end++) {
      if (text[end] === '\\' && /[{}]/.test(text[end + 1] ?? '')) { end++; continue; }
      if (text[end] === '{') depth++;
      if (text[end] === '}') depth--;
    }
    assert.equal(depth, 0, id + ': unclosed math');
    formulas.push({ id, tex: text.slice(start, end - 1) });
    startPattern.lastIndex = end;
  }
}
test('all owned math groups balance', () => assert(formulas.length > 200));
test('owned formulas pass optional strict KaTeX', { skip: !process.env.KATEX_PATH }, () => {
  const katex = createRequire(import.meta.url)(path.resolve(process.env.KATEX_PATH));
  for (const { id, tex } of formulas)
    assert.doesNotThrow(() => katex.renderToString(tex, { throwOnError: true, strict: 'error' }), id + ': ' + tex);
  console.log('Ziegler: ' + formulas.length + ' formulas checked with KaTeX ' + katex.version + '.');
});

// Finite models supplement local proofs; they do not verify the cited deep theorems.
test('2901: random-set expectation includes the degenerate diagonal', () => {
  for (const n of [1, 3, 5, 7]) for (const delta of [0, 0.25, 0.5, 1]) {
    let expected = 0;
    for (let mask = 0; mask < 2 ** n; mask++) {
      let count = 0;
      for (let x = 0; x < n; x++) for (let d = 0; d < n; d++)
        if ([x, (x + d) % n, (x + 2 * d) % n].every(t => mask & (1 << t))) count++;
      expected += count * delta ** bits(mask) * (1 - delta) ** (n - bits(mask));
    }
    close(expected, n * (n - 1) * delta ** 3 + n * delta);
  }
  for (const n of [3, 9, 15]) for (let divisor = 1; divisor <= n; divisor++) if (n % divisor === 0) {
    let count = 0;
    for (let x = 0; x < n; x++) for (let d = 0; d < n; d++)
      if ([x, (x + d) % n, (x + 2 * d) % n].every(t => t % divisor === 0)) count++;
    assert.equal(count, (n / divisor) ** 2);
  }
});

test('2902: exhaustive odd cyclic groups obey Fourier identity and nonzero bound', () => {
  for (const n of [3, 5, 7]) for (let mask = 0; mask < 2 ** n; mask++) {
    const f = range(n).map(x => Number(Boolean(mask & (1 << x))));
    const fourier = range(n).map(r => sum(f.map((v, x) => mul([v / n, 0], phase(-r * x / n)))));
    const spectral = sum(fourier.map((v, r) => mul(mul(v, v), fourier[mod(-2 * r, n)])));
    let count = 0;
    for (let x = 0; x < n; x++) for (let d = 0; d < n; d++)
      count += f[x] * f[(x + d) % n] * f[(x + 2 * d) % n];
    close(spectral[0], count / n ** 2);
    close(spectral[1], 0);
    const delta = bits(mask) / n;
    assert(Math.abs(count / n ** 2 - delta ** 3) <= delta * Math.max(...fourier.slice(1).map(abs)) + 1e-10);
  }
});

const cubeProduct = (f, x, hs) => {
  let value = [1, 0];
  for (let mask = 0; mask < 2 ** hs.length; mask++) {
    let point = x;
    for (let j = 0; j < hs.length; j++) if (mask & (1 << j)) point += hs[j];
    const v = f(point);
    value = mul(value, bits(mask) % 2 ? conj(v) : v);
  }
  return value;
};
const cyclicEnergy = (f, n, s) => {
  let result = [0, 0];
  for (const [x, ...hs] of tuples(s + 1, range(n)))
    result = add(result, cubeProduct(t => f[mod(t, n)], x, hs));
  return result.map(v => v / n ** (s + 1));
};
test('4Z01: all three CS stages and every target position pass complex finite models', () => {
  const p = 5;
  for (let trial = 0; trial < 6; trial++) {
    const f = range(4).map(j => range(p).map(x => mul([((trial + x + 2 * j) % 4 + 1) / 4, 0], phase((x * x * (j + 1) + trial * x) / 7))));
    const average = sum([...tuples(2, range(p))].map(([x, d]) =>
      f.reduce((v, fj, j) => mul(v, fj[(x + j * d) % p]), [1 / p ** 2, 0])));
    for (let target = 0; target < 4; target++) {
      const others = range(4).filter(j => j !== target);
      const Fj = (j, t) => f[j][mod(t.reduce((v, x, i) => v + (j - others[i]) * x, 0), p)];
      const stage = s => {
        let total = [0, 0];
        for (const all of tuples(3 + s, range(p))) {
          const base = all.slice(0, 3), copy = all.slice(3);
          let product = [1, 0];
          for (const j of [target, ...others.slice(s)]) for (let mask = 0; mask < 2 ** s; mask++) {
            const t = base.map((v, i) => i < s && (mask & (1 << i)) ? copy[i] : v);
            product = mul(product, bits(mask) % 2 ? conj(Fj(j, t)) : Fj(j, t));
          }
          total = add(total, product);
        }
        return total.map(v => v / p ** (3 + s));
      };
      const stages = [1, 2, 3].map(stage);
      stages.forEach(v => close(v[1], 0));
      assert(abs(average) ** 2 <= stages[0][0] + 1e-10);
      assert(stages[0][0] ** 2 <= stages[1][0] + 1e-10);
      assert(stages[1][0] ** 2 <= stages[2][0] + 1e-10);
      close(stages[2][0], cyclicEnergy(f[target], p, 3)[0]);
      assert(abs(average) ** 8 <= stages[2][0] + 1e-10);
    }
  }
});

test('4Z02: integer and cyclic cube energies agree after normalization', () => {
  for (const n of [1, 2, 3]) for (const s of [1, 2, 3]) {
    const f = range(n).map(x => mul([(x + 1) / n, 0], phase(x / 5)));
    const integer = data => {
      let result = [0, 0];
      const steps = range(2 * n - 1).map(h => h - n + 1);
      for (let x = 1; x <= n; x++) for (const hs of tuples(s, steps))
        result = add(result, cubeProduct(t => data[t - 1] ?? [0, 0], x, hs));
      return result;
    };
    const energy = integer(f), denominator = integer(Array(n).fill([1, 0]))[0];
    assert(denominator >= n);
    close(energy[1], 0);
    assert(energy[0] >= -1e-10 && energy[0] <= denominator + 1e-10);
    for (const m of [2 ** s * n, 2 ** s * n + 1]) {
      const embedded = range(m).map(x => f[x - 1] ?? [0, 0]);
      const cyclic = cyclicEnergy(embedded, m, s);
      close(cyclic[0] * m ** (s + 1), energy[0]);
      close(cyclic[1], 0);
    }
  }
});

test('2903/4Z05: affine powers, inverse and four-correlation on rational torus models', () => {
  const coefficients = [-1, 3, -3, 1];
  for (const q of [5, 7, 12]) for (const [alpha, z, w] of tuples(3, range(q))) {
    let point = [z, w];
    for (let n = 0; n <= 8; n++) {
      assert.deepEqual(point, [mod(z + n * alpha, q), mod(w + 2 * n * z + n * n * alpha, q)]);
      const exponent = coefficients.reduce((v, c, j) => v + c * (w + 2 * j * n * z + (j * n) ** 2 * alpha), 0);
      assert.equal(mod(exponent, q), 0);
      const next = [mod(point[0] + alpha, q), mod(point[1] + 2 * point[0] + alpha, q)];
      assert.deepEqual([mod(next[0] - alpha, q), mod(next[1] - 2 * next[0] + alpha, q)], point);
      point = next;
    }
  }
});

const liouville = n => {
  let sign = 1;
  for (let p = 2; p * p <= n; p++) while (n % p === 0) { sign = -sign; n /= p; }
  if (n > 1) sign = -sign;
  return sign;
};
test('4Z06/07: multiplicativity and periodic-word monotonicity/submultiplicativity', () => {
  assert.equal(liouville(1), 1);
  assert.equal(liouville(12), -1);
  assert.equal(liouville(36), 1);
  for (let a = 1; a <= 80; a++) for (let b = 1; b <= 80; b++)
    assert.equal(liouville(a * b), liouville(a) * liouville(b));
  for (let period = 1; period <= 6; period++) for (const u of tuples(period, [-1, 1])) {
    const count = k => new Set(range(period).map(n => range(k).map(j => u[(n + j + 1) % period]).join(','))).size;
    for (let k = 1; k <= 5; k++) {
      assert(count(k) <= count(k + 1));
      assert(count(k) <= 2 ** k);
      for (let ell = 1; ell <= 4; ell++) assert(count(k + ell) <= count(k) * count(ell));
    }
  }
});

test('4Z09: finite summation-by-parts identity for complex sequences', () => {
  for (let n = 1; n <= 30; n++) {
    const a = range(n).map(j => phase((j * j + j + 1) / 7));
    const partial = [];
    a.reduce((v, x) => { const next = add(v, x); partial.push(next); return next; }, [0, 0]);
    const lhs = sum(a.map((v, i) => v.map(x => x / (i + 1))));
    let rhs = partial[n - 1].map(x => x / n);
    for (let m = 1; m < n; m++) rhs = add(rhs, partial[m - 1].map(x => x * (1 / m - 1 / (m + 1))));
    lhs.forEach((x, i) => close(x, rhs[i]));
  }
});

test('4Z0A: exhaustive sign indicators and ordinary/logarithmic weighted averages', () => {
  for (let k = 1; k <= 6; k++) for (const u of tuples(k, [-1, 1])) for (const epsilon of tuples(k, [-1, 1])) {
    const direct = Number(u.every((v, i) => v === epsilon[i]));
    let expansion = 0;
    for (let mask = 0; mask < 2 ** k; mask++) {
      let term = 1;
      for (let j = 0; j < k; j++) if (mask & (1 << j)) term *= epsilon[j] * u[j];
      expansion += term;
    }
    assert.equal(expansion, 2 ** k * direct);
  }
  for (const weights of [[1, 1, 1], [1, 1 / 2, 1 / 3]]) {
    const u = [1, -1, 1, 1, -1], normalizer = weights.reduce((a, b) => a + b);
    for (const epsilon of tuples(2, [-1, 1])) {
      const freq = weights.reduce((s, w, n) => s + w * Number(u[n + 1] === epsilon[0] && u[n + 2] === epsilon[1]), 0) / normalizer;
      const expanded = weights.reduce((s, w, n) => s + w * (1 + epsilon[0] * u[n + 1]) * (1 + epsilon[1] * u[n + 2]) / 4, 0) / normalizer;
      close(freq, expanded);
    }
  }
});

test('4Z0B/0D: threshold consequences retain absolute values and exceptional sets', () => {
  for (const values of tuples(5, [0, 0.25, 0.75, 1])) for (const eta of [0.1, 0.5, 1]) {
    const bad = values.filter(x => x >= eta).length;
    assert(eta * bad <= values.reduce((a, b) => a + b) + 1e-10);
  }
  assert.equal([1, -1].reduce((a, b) => a + b), 0);
  assert.equal([1, -1].map(Math.abs).reduce((a, b) => a + b), 2);
});
