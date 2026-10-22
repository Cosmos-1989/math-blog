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
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const files = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(file => file.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  assert(!files.has(id), `Duplicate tree ID ${id}`);
  files.set(id, `trees/${file}`);
}
const note = id => read(files.get(id));
const record = json('research/icm2026-mathematical-physics-second-reports.json');
const snapshots = json('research/icm2026-mathematical-physics-second-reports-snapshots.json');
const coverage = json('research/icm2026-mathematical-physics-section-coverage.json');

test('the second mathematical-physics batch follows proceedings order without duplicating older topics', () => {
  assert.equal(record.subject, '006B');
  assert.deepEqual(record.reports.map(row => row.outline), ['4E00', '4F00', '4G00']);
  assert.deepEqual(record.reports.map(row => row.doi), [
    '10.1137/25M180679X', '10.1137/25M1811549', '10.1137/25M180425X',
  ]);
  const topics = listedTopics(note('006B'));
  assert.deepEqual(topics.slice(0, 7), ['2B00', '4B00', '4C00', '4D00', '4E00', '4F00', '4G00']);
  for (const id of ['4900', '0Q00']) assert.equal(topics.filter(x => x === id).length, 1);
  for (const report of record.reports) {
    const entry = coverage.reports.find(row => row.doi === report.doi);
    assert.equal(entry.outline, report.outline);
    assert.equal(entry.on_subject_landing, true);
    assert.equal(entry.status, 'selected-branches-integrated');
  }
  const all = [...coverage.reports, ...coverage.cross_listed_reports];
  assert.equal(all.length, 15);
  assert.equal(coverage.counts.dedicated_topics_total, all.filter(row => row.outline).length);
  assert.equal(coverage.counts.reports_without_dedicated_topic, all.filter(row => !row.outline).length);
});

test('atomic notes have explicit sources, unique titles, reachable pages and acyclic prerequisites', () => {
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  const titles = new Map();
  for (const id of files.keys()) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  for (const report of record.reports) {
    for (const key of ['question', 'reading_scope', 'proof_scope', 'claim_sources', 'version_url', 'license'])
      assert(report[key], `${report.outline}: missing ${key}`);
    assert(Array.isArray(report.remaining_branches), report.outline);
    assert(Array.isArray(report.unexpanded_deep_proofs), report.outline);
    assert(note(report.reference).includes(report.doi), report.reference);
    const branch = snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      queue.push(...Array.from(note(id).matchAll(/\]\(([^)]+)\)|\\transclude\{([^}]+)\}/g), match => match[1] ?? match[2]));
    }
    for (const row of branch) {
      const text = note(row.id);
      assert(reached.has(row.id), `Unreachable ${row.id}`);
      assert.equal(hash(text), row.sha256, row.id);
      assert.equal(hash(text), required.pages[row.id].sha256, row.id);
      assert(!text.includes('\\strong{相关页面}'), row.id);
      if (!['Outline', 'Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title), [row.id], row.title);
        assert(report.proof_scope[row.id] && report.claim_sources[row.id], row.id);
        assert.deepEqual(audit.prerequisites[row.id], record.prerequisites[row.id], row.id);
      }
      const links = bodyLinks(text).map(link => link.target);
      for (const target of record.prerequisites[row.id]) {
        assert(links.includes(target), `${row.id}: absent prerequisite ${target}`);
        assert(files.has(target), `${row.id}: missing ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), target);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(branch.some(row => row.id === id), `Unrecorded ${id}`);
    assert(note(report.outline).split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
  }
  const active = new Set(), done = new Set();
  function visit(id, route = []) {
    assert(!active.has(id), `Prerequisite cycle: ${[...route, id].join(' -> ')}`);
    if (done.has(id)) return;
    active.add(id);
    for (const target of audit.prerequisites[id] ?? []) {
      assert(files.has(target), `${id}: missing ${target}`);
      visit(target, [...route, id]);
    }
    active.delete(id);
    done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id => visit(id));
});

test('independent reviews bind all new notes and their packets to current content', () => {
  for (const name of ['hutchcroft', 'mahadev', 'martinelli']) {
    const review = json(`research/mathematical-physics-${name}-review.json`);
    assert.equal(review.result, 'pass', name);
    assert.deepEqual(review.open_findings, [], name);
    const report = record.reports.find(row => row.reference === `icm2026-${name}`);
    for (const row of snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference))
      assert(review.reviewed_files.some(file => file.id === row.id), `${name}: unreviewed ${row.id}`);
    assert(review.reviewed_files.some(row => row.id === `mathematical-physics-${name}-packet`));
    for (const row of review.reviewed_files) {
      const expected = files.get(row.id) ??
        (row.id === `mathematical-physics-${name}-packet` ? `research/${row.id}.json` : undefined);
      assert.equal(row.path, expected, row.id);
      assert.equal(row.sha256, hash(read(row.path)), `${name}: stale review ${row.id}`);
    }
  }
});

const near = (a, b) => assert(Math.abs(a - b) <= 1e-11 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);

test('binary derivatives along odd translation cycles cannot be identically one', () => {
  for (const q of [3, 5, 7, 9]) {
    for (let shift = 0; shift < q; shift++) {
      for (let mask = 0; mask < 1 << q; mask++) {
        const g = x => (mask >> x) & 1;
        const derivative = Array.from({length: q}, (_, x) => g(x) ^ g((x - shift + q) % q));
        assert(derivative.includes(0), `q=${q}, shift=${shift}, mask=${mask}`);
      }
    }
    // Lowest-bit subtraction already fails at wraparound for odd q.
    assert.equal((0 & 1) ^ ((q - 1) & 1), 0);
  }
  for (const q of [2, 4, 6]) {
    const g = x => x & 1;
    assert(Array.from({length: q}, (_, x) => g(x) ^ g((x - 1 + q) % q)).every(bit => bit === 1));
  }
});

test('finite independent percolation has the susceptibility identity and a simple-path union bound', () => {
  const n = 4, edges = [[0, 1, .2], [1, 2, .3], [2, 3, .4], [0, 3, .1], [0, 2, .25]];
  const connection = Array(n).fill(0);
  let expectedSize = 0;
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    const graph = Array.from({length: n}, () => []);
    let probability = 1;
    edges.forEach(([a, b, p], i) => {
      const open = (mask >> i) & 1;
      probability *= open ? p : 1 - p;
      if (open) { graph[a].push(b); graph[b].push(a); }
    });
    const cluster = new Set([0]), queue = [0];
    while (queue.length) for (const next of graph[queue.pop()])
      if (!cluster.has(next)) { cluster.add(next); queue.push(next); }
    expectedSize += probability * cluster.size;
    for (const vertex of cluster) connection[vertex] += probability;
  }
  near(expectedSize, connection.reduce((a, b) => a + b, 0));
  const pathBound = Array(n).fill(0);
  function paths(vertex, seen, weight) {
    pathBound[vertex] += weight;
    for (const [a, b, p] of edges) {
      const next = a === vertex ? b : b === vertex ? a : -1;
      if (next >= 0 && !seen.has(next)) paths(next, new Set([...seen, next]), weight * p);
    }
  }
  paths(0, new Set([0]), 1);
  connection.forEach((value, i) => assert(value <= pathBound[i] + 1e-12));
});

test('Hadamard measurement of a coherent two-preimage state enforces its parity equation', () => {
  const parity = n => n.toString(2).split('').reduce((s, digit) => s ^ Number(digit), 0);
  for (let bits = 1; bits <= 4; bits++) {
    const size = 1 << bits;
    for (let x0 = 0; x0 < size; x0++) for (let x1 = 0; x1 < size; x1++) {
      let total = 0;
      for (let a = 0; a < 2; a++) for (let d = 0; d < size; d++) {
        const amplitude = ((-1) ** parity(d & x0) + (-1) ** (a + parity(d & x1))) / Math.sqrt(4 * size);
        const probability = amplitude * amplitude;
        total += probability;
        near(probability, a === parity(d & (x0 ^ x1)) ? 1 / size : 0);
      }
      near(total, 1);
    }
  }
});

test('a two-site constrained heat bath obeys detailed balance and the conditional-variance Dirichlet formula', () => {
  for (const q of [.1, .3, .5, .9]) {
    const states = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const mu = states.map(x => x.reduce((weight, bit) => weight * (bit ? 1 - q : q), 1));
    const constraint = (state, site) => site === 0 || state[0] === 0 ? 1 : 0;
    const rates = states.map((state, i) => states.map((other, j) => {
      const different = state.map((x, k) => x !== other[k] ? k : -1).filter(k => k >= 0);
      if (different.length !== 1) return 0;
      const site = different[0];
      return constraint(state, site) * (other[site] ? 1 - q : q);
    }));
    states.forEach((_, i) => states.forEach((_, j) => near(mu[i] * rates[i][j], mu[j] * rates[j][i])));
    for (const f of [[0, 1, 3, -2], [2, 2, 2, 2], [1, -1, -1, 1]]) {
      let energy = 0, conditional = 0;
      states.forEach((state, i) => {
        rates[i].forEach((rate, j) => { energy += .5 * mu[i] * rate * (f[j] - f[i]) ** 2; });
        for (let site = 0; site < 2; site++) {
          const indices = [0, 1].map(bit => states.findIndex(other => other.every((x, k) => x === (k === site ? bit : state[k]))));
          conditional += mu[i] * constraint(state, site) * q * (1 - q) * (f[indices[1]] - f[indices[0]]) ** 2;
        }
      });
      near(energy, conditional);
    }
  }
});
