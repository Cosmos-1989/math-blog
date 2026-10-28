import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { normalizeFormat, prose, styleRules } from '../scripts/note-editorial-lib.mjs';
import { bodyLinks } from '../scripts/note-prerequisite-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = 'trees/math/history/serre-sarnak';
const packet = JSON.parse(fs.readFileSync(path.join(root, 'research/plenary-sarnak-packet.json'), 'utf8'));
const ids = [...Array.from({ length: 13 }, (_, i) => '510' + i.toString(36).toUpperCase()), 'icm2026-sarnak'];
const hash = value => createHash('sha256').update(value).digest('hex');
const fileFor = id => path.join(root, id.startsWith('icm') ? 'trees/references' : folder, id + '.tree');
const source = Object.fromEntries(ids.map(id => [id, fs.readFileSync(fileFor(id), 'utf8')]));
const forest = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), { recursive: true }).filter(f => f.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  if (!forest.has(id)) forest.set(id, []);
  forest.get(id).push(path.join(root, 'trees', file));
}
const links = text => bodyLinks(text).map(x => x.target);
const allLinks = text => [...text.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)]
  .map(m => m[1]).filter(x => !/^(https?:|mailto:|#)/.test(x));
const range = n => Array.from({ length: n }, (_, i) => i);
const close = (a, b) => assert(Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);

test('all 14 owned pages have packet keys, unique IDs and source hashes', () => {
  assert.equal(packet.report.prefix, '51');
  assert.equal(packet.report.outline, '5100');
  assert.equal(packet.report.title, 'Maestro Jean Pierre Serre');
  assert.deepEqual(packet.report.subject_ids, ['0074']);
  for (const map of [packet.prerequisites, packet.report.proof_scope, packet.report.claim_sources, packet.validation.source_sha256])
    assert.deepEqual(Object.keys(map).sort(), [...ids].sort());
  assert.deepEqual([...forest.keys()].filter(id => /^51[0-9A-Z]{2}$/.test(id)).sort(), ids.filter(id => id.startsWith('51')).sort());
  for (const id of ids) {
    assert.equal(forest.get(id)?.length, 1, id);
    assert.equal(hash(source[id]), packet.validation.source_sha256[id], id);
    assert(packet.report.proof_scope[id].scope.length > 10, id);
    assert(packet.report.claim_sources[id].length > 0, id);
    for (const claim of packet.report.claim_sources[id]) {
      assert.match(claim.url, /^https:\/\//);
      assert(claim.location.length > 0);
    }
  }
});

test('strict format, metadata, style, links and global title uniqueness', () => {
  const titles = new Map();
  for (const [id, files] of forest) {
    const title = fs.readFileSync(files[0], 'utf8').match(/^\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  for (const [id, text] of Object.entries(source)) {
    assert.equal(normalizeFormat(text), text, id + ': strict-format');
    assert.match(text, /^\\title\{[^\n]+\}\n\\date\{\d{4}-\d{2}-\d{2}\}\n\\taxon\{[^}]+\}\n\\author\{author\}\n/);
    assert.deepEqual(titles.get(text.match(/^\\title\{([^\n]+)\}/)[1]), [id]);
    for (const target of allLinks(text)) assert(forest.has(target), `${id} -> ${target}`);
    for (const [name, rule] of styleRules) assert.equal([...prose(text).matchAll(rule)].length, 0, `${id}: ${name}`);
    assert(!/(?<!\\)%/.test(text), id + ': unescaped percent');
    assert(!/\\!|\\[A-Za-z][A-Za-z0-9_-]*\/[A-Za-z0-9\\([]/.test(text), id + ': Forester command path');
    assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text));
  }
});

test('body reachability and explicit acyclic prerequisites through existing foundations', () => {
  const reached = new Set(), pending = ['5100'];
  while (pending.length) {
    const id = pending.pop();
    if (reached.has(id) || !source[id]) continue;
    reached.add(id);
    pending.push(...links(source[id]));
  }
  assert.deepEqual([...reached].sort(), [...ids].sort());
  const shared = JSON.parse(fs.readFileSync(path.join(root, 'research/prerequisite-required-links.json'), 'utf8'));
  const graph = Object.fromEntries(Object.entries(shared.pages).map(([id, entry]) => [id, entry.targets]));
  Object.assign(graph, packet.prerequisites);
  for (const [id, targets] of Object.entries(packet.prerequisites)) {
    assert.equal(new Set(targets).size, targets.length, id);
    for (const target of targets) {
      assert(links(source[id]).includes(target), `${id}: absent body prerequisite ${target}`);
      assert.match(fs.readFileSync(forest.get(target)[0], 'utf8'), /\\taxon\{(?:Definition|Construction|Theorem)\}/);
    }
  }
  const active = new Set(), visited = new Set();
  const visit = id => {
    assert(!active.has(id), `cycle through ${id}`);
    if (visited.has(id)) return;
    active.add(id);
    for (const target of graph[id] ?? []) visit(target);
    active.delete(id); visited.add(id);
  };
  ids.forEach(visit);
  console.log(`Sarnak prerequisite closure: ${visited.size} nodes; ${Object.values(packet.prerequisites).flat().length} owned edges.`);
});

test('reading records are discrete frames, not a complete transcript or report', () => {
  assert.equal(packet.report.coverage_status, 'preliminary-selected-branches');
  for (const key of ['report_complete', 'full_transcript_read', 'full_video_read', 'full_report_manuscript_read'])
    assert.equal(packet.report[key], false, key);
  assert.equal(packet.video_observations.length, 18);
  for (const row of packet.video_observations) {
    assert.equal(row.read_method, 'original-video-frame');
    assert.equal(row.continuous_interval, false);
  }
  assert(packet.video_observations.some(row => row.time === '52:48' && row.slide === '33/37'));
  assert(packet.source_readings.every(row => row.full_mathematical_body === false));
  assert.match(packet.report.reading_scope, /官方画面支撑的选段整理/);
  for (const id of ['5102', '5104', '5106'])
    assert(packet.report.proof_scope[id].status.startsWith('cited-research-theorem'));
  assert.match(packet.theorem_source_checks['5106'].boundary, /primitive/);
  for (const text of Object.values(source)) assert(!/\b\d{1,2}:\d{2}\b|抽帧|连续字幕|下载|cookies/.test(text));
});

test('semantic prerequisites avoid the rejected contextual-definition shortcuts', () => {
  assert(links(source['5109']).includes('510C'));
  assert(!links(source['5109']).includes('017K'));
  assert(!links(source['5104']).includes('0C0S'));
  assert(links(source['5104']).includes('0F0H'));
  assert.match(source['5104'], /保持原点的代数自同态环/);
  assert.match(source['5103'], /紧 Kähler 流形的 Hodge 分解\]\(0BG1\)/);
  assert.match(source['5106'], /局部 Galois 作用\]\(0G84\)/);
  assert(!packet.prerequisites['5106'].includes('0G84'));
  for (const target of ['0112', '0E80', '0BG1']) assert(links(source['5103']).includes(target));
  for (const target of ['00SM', '01I8', '00E8']) assert(packet.prerequisites['5105'].includes(target));
  for (const target of ['00E5', '00FP']) assert(packet.prerequisites['5107'].includes(target));
});

const formulas = [];
for (const [id, text] of Object.entries(source)) {
  const starts = /##?\{/g;
  for (let m; (m = starts.exec(text));) {
    const begin = starts.lastIndex;
    let depth = 1, end = begin;
    for (; end < text.length && depth; end++) {
      if (text[end] === '\\' && /[{}]/.test(text[end + 1] ?? '')) { end++; continue; }
      if (text[end] === '{') depth++;
      if (text[end] === '}') depth--;
    }
    assert.equal(depth, 0, id + ': unclosed formula');
    formulas.push({ id, tex: text.slice(begin, end - 1) });
    starts.lastIndex = end;
  }
}
test('owned Forester groups and math delimiters are balanced', () => {
  assert(formulas.length > 150);
  for (const [id, text] of Object.entries(source)) {
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\\' && /[{}]/.test(text[i + 1] ?? '')) { i++; continue; }
      if (text[i] === '{') depth++;
      if (text[i] === '}') depth--;
      assert(depth >= 0, id + ': excess closing brace');
    }
    assert.equal(depth, 0, id);
  }
});

test('strict KaTeX uses the workflow-pinned 0.16.8 environment file', { skip: !process.env.KATEX_PATH }, () => {
  const katexPath = path.resolve(process.env.KATEX_PATH);
  assert.equal(hash(fs.readFileSync(katexPath)), 'd4f0ea25c4ccb7986b229d6427794b7063cf3209b0376cf5a64bfc4dd7918c95');
  const katex = createRequire(import.meta.url)(katexPath);
  assert.equal(katex.version, '0.16.8');
  for (const { id, tex } of formulas)
    assert.doesNotThrow(() => katex.renderToString(tex, { throwOnError: true, strict: 'error' }), id + ': ' + tex);
  console.log(`Sarnak: ${formulas.length} formulas passed strict KaTeX ${katex.version}.`);
});

function rank(matrix, mul = (a, b) => a & b, inverse = () => 1) {
  const a = matrix.map(row => [...row]);
  let r = 0;
  for (let c = 0; c < a[0].length && r < a.length; c++) {
    const pivot = a.findIndex((row, i) => i >= r && row[c]);
    if (pivot < 0) continue;
    [a[r], a[pivot]] = [a[pivot], a[r]];
    const inv = inverse(a[r][c]);
    a[r] = a[r].map(x => mul(x, inv));
    for (let i = 0; i < a.length; i++) if (i !== r && a[i][c]) {
      const factor = a[i][c];
      a[i] = a[i].map((x, j) => x ^ mul(factor, a[r][j]));
    }
    r++;
  }
  return r;
}

// Finite models check local identities, not the cited existence theorems.
test('5101: exhaustive F2 complexes preserve the Euler sum and lose only boundary ranks', () => {
  let complexes = 0;
  for (let x = 0; x < 64; x++) for (let y = 0; y < 64; y++) {
    const a = range(2).map(i => range(3).map(j => (x >> (3 * i + j)) & 1));
    const b = range(3).map(i => range(2).map(j => (y >> (2 * i + j)) & 1));
    if (a.some(row => range(2).some(j => row.reduce((s, v, k) => s ^ (v & b[k][j]), 0)))) continue;
    const ra = rank(a), rb = rank(b), homology = [2 - ra, 3 - ra - rb, 2 - rb];
    assert(homology.every((v, i) => v >= 0 && v <= [2, 3, 2][i]));
    assert.equal(homology[0] - homology[1] + homology[2], 1);
    complexes++;
  }
  assert(complexes > 100);
});

function f4mul(a, b) {
  let out = 0;
  while (b) {
    if (b & 1) out ^= a;
    b >>= 1; a <<= 1;
    if (a & 4) a ^= 7;
  }
  return out;
}
const sigma = x => f4mul(x, x);
test('5103: semilinear Frobenius over F4 preserves kernels, images and rank', () => {
  const vectors = range(16).map(x => [x & 3, (x >> 2) & 3]);
  for (let code = 0; code < 256; code++) {
    const a = range(2).map(i => range(2).map(j => (code >> (2 * (2 * i + j))) & 3));
    const conjugate = a.map(row => row.map(sigma));
    const apply = (m, v) => m.map(row => row.reduce((s, x, j) => s ^ f4mul(x, v[j]), 0));
    const r = rank(a, f4mul, sigma);
    assert.equal(rank(conjugate, f4mul, sigma), r);
    const kernel = vectors.filter(v => apply(a, v).every(x => x === 0));
    assert.equal(kernel.length, 4 ** (2 - r));
    for (const v of vectors) assert.deepEqual(apply(conjugate, v.map(sigma)), apply(a, v).map(sigma));
    const image = new Set(vectors.map(v => apply(a, v).map(sigma).join(',')));
    const conjugateImage = new Set(vectors.map(v => apply(conjugate, v).join(',')));
    assert.deepEqual(image, conjugateImage);
  }
});

const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
test('5105: quotient images of cyclic subgroups obey the index bound and kernel criterion', () => {
  for (let n = 1; n <= 40; n++) for (let d = 1; d <= n; d++) if (n % d === 0)
    for (let m = 1; m <= n; m++) if (n % m === 0) {
      const image = new Set(range(n / d).map(j => (j * d) % m));
      const index = m / image.size;
      assert.equal(index, gcd(d, m));
      assert(index <= d);
      if (m % d === 0) assert.equal(index, d);
    }
});

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const phase = t => [Math.cos(2 * Math.PI * t), Math.sin(2 * Math.PI * t)];
const abs = z => Math.hypot(...z);
test('independent review corrections retain the full cusp hypothesis and exact citations', () => {
  assert.match(source['5106'], /设 #\{f\} 为上述权一尖点形式，在所有尖点消失/);
  assert.match(source['5107'], /推论 4\.2，印刷页 514/);
  assert.match(source['icm2026-sarnak'], /La suite spectrale des espaces fibrés\. Applications/);
  assert(packet.report.claim_sources['5107'].some(row => row.location.includes('514')));
});

test('5107: finite-order eigenvalues give the dimension bound for traces', () => {
  for (let m = 1; m <= 24; m++) for (let a = 0; a < m; a++) for (let b = 0; b < m; b++) {
    const eigenvalues = [phase(a / m), phase(b / m)];
    const trace = eigenvalues.reduce(add, [0, 0]);
    assert(abs(trace) <= 2 + 1e-12);
    for (const z of eigenvalues) {
      const power = range(m).reduce(value => mul(value, z), [1, 0]);
      close(power[0], 1); close(power[1], 0);
    }
  }
});

function combinations(values, n, start = 0, selected = []) {
  if (n === 0) return [selected];
  return values.slice(start).flatMap((x, i) => combinations(values, n - 1, start + i + 1, [...selected, x]));
}
function diameter(points, n) {
  if (n > points.length) return 0;
  return Math.max(...combinations(points, n).map(xs => {
    let product = 1;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
      product *= Math.hypot(xs[i][0] - xs[j][0], xs[i][1] - xs[j][1]);
    return product ** (2 / (n * (n - 1)));
  }));
}
test('5108: exact finite-set maxima have decreasing diameters and affine scaling', () => {
  for (const points of [[[0, 0], [1, 0], [3, 0], [5, 0]], [[0, 0], [1, 1], [-1, 2], [4, -2], [2, 3]]]) {
    let previous = Infinity;
    for (let n = 2; n <= points.length + 1; n++) {
      const value = diameter(points, n);
      assert(value <= previous + 1e-10); previous = value;
      close(diameter(points.map(z => add(mul([2, 1], z), [3, -4])), n), Math.sqrt(5) * value);
    }
    for (const xs of combinations(points, 4)) {
      const full = diameter(xs, 4) ** 6;
      let deletedProduct = 1;
      for (let j = 0; j < 4; j++) deletedProduct *= diameter(xs.filter((_, i) => i !== j), 3) ** 3;
      close(deletedProduct, full ** 2);
    }
  }
});

function polyMul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; }));
  return out;
}
const content = a => a.reduce((g, x) => gcd(g, x), 0);
test('510C: primitive products and monic rational-factor denominator cancellation', () => {
  const polys = [];
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let c = 1; c <= 3; c++)
    if (content([a, b, c]) === 1) polys.push([a, b, c]);
  for (const a of polys) for (const b of polys) {
    const product = polyMul(a, b);
    assert.equal(content(product), 1);
    const denominator = a[2] * b[2];
    if (product.every(x => x % denominator === 0)) assert.equal(denominator, 1);
  }
});

test('5109: integer quadratic discriminants give the distance-product lower bound', () => {
  for (let b = -8; b <= 8; b++) for (let c = -8; c <= 8; c++) {
    const delta = b * b - 4 * c;
    if (!delta) continue;
    const gap = Math.sqrt(Math.abs(delta));
    assert(gap >= 1);
    close(gap * gap, Math.abs(delta));
    const roots = delta > 0 ? [[(-b + gap) / 2, 0], [(-b - gap) / 2, 0]] : [[-b / 2, gap / 2], [-b / 2, -gap / 2]];
    const R = Math.max(1, ...roots.map(abs));
    assert(Math.abs(b) <= 2 * R + 1e-10);
    assert(Math.abs(c) <= R * R + 1e-10);
  }
});

test('510A: multiplicity-weighted root measures realize rational convex weights', () => {
  const p = [-2, 1], q = [0, 2, 3];
  for (let u = 0; u <= 5; u++) for (let v = 0; v <= 5; v++) if (u + v) {
    const a = u * q.length, b = v * p.length;
    const roots = [...Array.from({ length: a }, () => p).flat(), ...Array.from({ length: b }, () => q).flat()];
    for (const f of [x => 1, x => x, x => x * x, x => Math.sin(x)]) {
      const integral = roots.reduce((s, x) => s + f(x), 0) / roots.length;
      const target = u / (u + v) * p.reduce((s, x) => s + f(x), 0) / p.length
        + v / (u + v) * q.reduce((s, x) => s + f(x), 0) / q.length;
      close(integral, target);
    }
  }
});

test('510B: integer norms and continuous log truncations on distinct cyclotomic orbits', () => {
  for (const p of [3, 5, 7, 11, 17, 31, 61]) {
    const roots = range(p - 1).map(i => phase((i + 1) / p));
    const distances = roots.map(z => Math.hypot(1 - z[0], z[1]));
    const integral = distances.reduce((s, x) => s + Math.log(x), 0) / (p - 1);
    close(integral, Math.log(p) / (p - 1));
    let previous = Infinity;
    for (const epsilon of [1, 0.5, 0.1, 0.01]) {
      const truncated = distances.reduce((s, x) => s + Math.log(Math.max(epsilon, x)), 0) / (p - 1);
      assert(truncated >= integral - 1e-10);
      assert(truncated <= previous + 1e-10); previous = truncated;
    }
  }
  assert.equal(Math.log(0), -Infinity);
});
