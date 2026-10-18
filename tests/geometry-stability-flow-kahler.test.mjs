import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const record = json('research/icm2026-geometry-stability-flow-kahler.json');
const snapshot = json('research/icm2026-geometry-stability-flow-kahler-snapshots.json');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), 'trees/' + file]));
const note = id => read(files.get(id));

test('three geometry reports reuse the official roster and appear once after plenaries', () => {
  assert.deepEqual(record.reports.map(report => report.outline), ['2L00', '2M00', '2N00']);
  const topics = listedTopics(note('0065'));
  assert.deepEqual(topics.slice(0, 2), ['2C00', '2600']);
  const coverage = json('research/icm2026-geometry-section-coverage.json');
  assert.equal(coverage.reports.length, 15);
  for (const report of record.reports) {
    assert.equal(topics.filter(id => id === report.outline).length, 1);
    const entries = coverage.reports.filter(row => row.doi === report.doi);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].outline, report.outline);
    assert(report.reading_scope && report.question);
    assert(report.proof_scope && Object.keys(report.proof_scope).length);
  }
  assert.equal(coverage.counts.primary_reports_with_existing_topic, coverage.reports.filter(row => row.outline).length);
  assert.equal(coverage.counts.reports_without_dedicated_topic, coverage.reports.filter(row => !row.outline).length);
});

test('all new pages retain source hashes, explicit prerequisites and access from their topic', () => {
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  for (const report of record.reports) {
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      queue.push(...[...note(id).matchAll(/\]\(([^)\s]+)\)/g)].map(match => match[1]));
    }
    const branch = snapshot.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
    for (const row of branch) {
      assert(reached.has(row.id), `Unreachable: ${row.id}`);
      const hash = crypto.createHash('sha256').update(note(row.id)).digest('hex');
      assert.equal(hash, row.sha256, row.id);
      assert.equal(hash, required.pages[row.id].sha256, row.id);
      const links = bodyLinks(note(row.id)).map(link => link.target);
      for (const target of record.prerequisites[row.id]) {
        assert(links.includes(target), `${row.id}: missing prose link to ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter)\}/.test(note(target)), `${row.id}: prerequisite ${target} is navigation`);
      }
      if (!['Outline', 'Reference'].includes(row.taxon))
        assert.deepEqual(audit.prerequisites[row.id], record.prerequisites[row.id], row.id);
    }
    const paragraphs = note(report.outline).split('\n').filter(line => line.startsWith('\\p{'));
    assert(paragraphs.length >= 5, report.outline);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), `${report.outline}: catalogue instead of narrative`);
    assert(!branch.some(row => /\\strong\{相关页面\}/.test(note(row.id))));
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(branch.some(row => row.id === id), `Missing snapshot: ${id}`);
  }
});

test('new knowledge titles do not duplicate existing definitions', () => {
  const titles = new Map();
  for (const [id] of files) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  for (const row of snapshot.notes) {
    if (row.taxon !== 'Reference') assert.deepEqual(titles.get(row.title), [row.id], row.title);
  }
});

test('research assumptions and the distinction between proofs and cited inputs survive editing', () => {
  assert.match(note('2L0J'), /有限总曲率/);
  assert.match(note('2L0J'), /覆盖稳定/);
  assert.match(note('2L0J'), /证明概要/);
  assert.match(note('2M0J'), /闭嵌入曲面/);
  assert.match(note('2M0O'), /\(n,k\)=\(2,1\)/);
  assert.match(note('2M0O'), /单位正则/);
  assert.match(note('2M0O'), /模二循环/);
  assert(note('2M07').includes('\\lparen t-(\\eta r)^2,t\\rbrack'));
  assert.match(note('2M0Z'), /2025 年 12 月/);
  assert.match(note('2M0Z'), /预印本/);
  assert.match(note('2N0I'), /固定.*模型/);
  assert.match(note('2N0I'), /N=1/);
  assert.match(note('2N0T'), /两侧均赋予各自的强拓扑/);
  assert.match(note('2N0T'), /证明概要/);
  for (const report of record.reports) {
    assert(report.remaining_branches?.length || report.deferred?.length,
      `${report.outline}: omitted branches must remain recorded`);
  }
});

test('the cylindrical Ornstein-Uhlenbeck operator has four positive and three zero modes', () => {
  // Hermite polynomials for d²/dy² - (y/2)d/dy, in ascending coefficient order.
  const hermite = [[1], [0, 1], [-2, 0, 1], [0, -6, 0, 1], [12, 0, -12, 0, 1]];
  const eigenvalues = [];
  for (let degree = 0; degree < hermite.length; degree++) for (let mode = 0; mode <= 3; mode++) {
    const coefficients = hermite[degree];
    const lambda = 1 - (degree + mode * mode) / 2;
    for (let j = 0; j < coefficients.length; j++) {
      const image = (j + 2) * (j + 1) * (coefficients[j + 2] ?? 0)
        + (1 - mode * mode / 2 - j / 2) * coefficients[j];
      assert(image === lambda * coefficients[j]);
    }
    // A nonzero circle frequency has sine and cosine modes.
    for (let k = 0; k < (mode === 0 ? 1 : 2); k++) eigenvalues.push(lambda);
  }
  assert.equal(eigenvalues.filter(value => value > 0).length, 4);
  assert.equal(eigenvalues.filter(value => value === 0).length, 3);
});

test('finite torus covers give equivariant sections with inverse-length derivative bounds', () => {
  const principal = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  for (const theta of [-2.6, 0, 0.4, 2.8]) for (const phi of [-1.7, 0.2, 2.4]) {
    for (const k of [1, 2, 7, 31, 100]) {
      const a = principal(k * theta), b = principal(k * phi);
      assert(Math.abs(Math.cos(a) - Math.cos(k * theta)) < 1e-12);
      assert(Math.abs(Math.sin(b) - Math.sin(k * phi)) < 1e-12);
      const derivative = Math.hypot(a, b) / (2 * k);
      assert(derivative <= Math.PI / (Math.sqrt(2) * k) + 1e-12);
      // The horizontal and vertical periods pair with theta and phi respectively.
      const phase = (x, y) => (a * x + b * y) / k;
      assert(Math.abs(phase(0.3 + k, 0.7) - phase(0.3, 0.7) - a) < 1e-12);
      assert(Math.abs(phase(0.3, 0.7 + k) - phase(0.3, 0.7) - b) < 1e-12);
    }
  }
});

test('vertical-divisor graph coefficients have the claimed leading sign', () => {
  const graphs = [
    [[1], [0, 2], [1, 3], [2]],
    [[1, 2, 3], [0], [0], [0]],
    [[1, 3], [0, 2], [1, 3], [0, 2]],
  ];
  for (const graph of graphs) for (let source = 0; source < graph.length; source++) {
    const distance = Array(graph.length).fill(Infinity), queue = [source];
    distance[source] = 0;
    for (let q = 0; q < queue.length; q++) for (const next of graph[queue[q]]) {
      if (Number.isFinite(distance[next])) continue;
      distance[next] = distance[queue[q]] + 1;
      queue.push(next);
    }
    const N = graph.length, t = 10n;
    const coefficient = j => 1n + t ** BigInt(N) - t ** BigInt(N - distance[j]);
    for (let k = 0; k < N; k++) {
      if (k === source) continue;
      assert(graph[k].some(j => distance[j] === distance[k] - 1));
      for (const j of graph[k]) {
        const restriction = coefficient(j) - coefficient(k);
        assert.equal(restriction, t ** BigInt(N - distance[k]) - t ** BigInt(N - distance[j]));
        if (distance[j] === distance[k] - 1) assert(restriction < 0n);
      }
    }
  }
});

test('component masses retain multiplicities and scale with the fibre dimension', () => {
  const weights = [2, 3, 1], volumes = [3, 2, 5];
  const V = weights.reduce((sum, b, i) => sum + b * volumes[i], 0);
  for (const dimension of [1, 2, 3, 4]) for (const epsilon of [-0.2, -0.01, 0.1]) {
    const mass = weights.reduce((sum, b, i) => sum + b * volumes[i] * (1 + epsilon) ** dimension, 0);
    assert(Math.abs(mass - (1 + epsilon) ** dimension * V) < 1e-10);
  }
  for (let i = 0; i < weights.length; i++)
    assert.equal(weights.reduce((sum, b, j) => sum + (j === i ? 0 : b * volumes[j]), 0), V - weights[i] * volumes[i]);
});
