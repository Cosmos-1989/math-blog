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
const record = json('research/icm2026-mathematical-physics-third-reports.json');
const snapshots = json('research/icm2026-mathematical-physics-third-reports-snapshots.json');
const coverage = json('research/icm2026-mathematical-physics-section-coverage.json');

test('the third batch follows proceedings order and counts Rhodes-Vargas as one report', () => {
  assert.equal(record.subject, '006B');
  assert.deepEqual(record.reports.map(row => row.outline), ['4H00', '4I00', '4J00']);
  assert.deepEqual(record.reports.map(row => row.doi), [
    '10.1137/25M1805825', '10.1137/25M1804728', '10.1137/25M1803632',
  ]);
  const topics = listedTopics(note('006B'));
  const leadingAndBatch = [...coverage.editorial_leading_topics.map(row => row.outline), '4B00', '4C00', '4D00', '4E00', '4F00', '4G00', '4H00', '4I00', '4J00'];
  assert.deepEqual(topics.slice(0, leadingAndBatch.length), leadingAndBatch);
  for (const id of ['4900', '0Q00']) assert.equal(topics.filter(x => x === id).length, 1);
  for (const report of record.reports) {
    const rows = coverage.reports.filter(row => row.doi === report.doi);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].outline, report.outline);
    assert.equal(rows[0].on_subject_landing, true);
    assert.equal(rows[0].status, 'selected-branches-integrated');
  }
  const all = [...coverage.reports, ...coverage.cross_listed_reports];
  assert.equal(all.length, 15);
  assert.equal(coverage.counts.dedicated_topics_total, all.filter(row => row.outline).length);
  assert.equal(coverage.counts.reports_without_dedicated_topic, all.filter(row => !row.outline).length);
});

test('every new atom has explicit sources and reachable acyclic prerequisites', () => {
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

test('independent reviews bind the three branches and source packets to current content', () => {
  for (const name of ['pausader', 'perez-garcia', 'rhodes-vargas']) {
    const review = json(`research/mathematical-physics-${name}-review.json`);
    assert.equal(review.result, 'pass', name);
    assert.deepEqual(review.open_findings, [], name);
    const report = record.reports.find(row => row.reference === `icm2026-${name}`);
    for (const row of snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference))
      assert(review.reviewed_files.some(file => file.id === row.id), `${name}: unreviewed ${row.id}`);
    assert(review.reviewed_files.some(row => row.id === `mathematical-physics-${name}-packet`));
    for (const row of review.reviewed_files) {
      const expected = files.get(row.id) ??
        (row.id === `mathematical-physics-${name}-packet` ? `research/${row.id}.json` :
          ['NOTES_STYLE_GUIDE', 'EVERGREEN_ATOMIC_NOTES_SKILL'].includes(row.id) ? `${row.id}.md` : undefined);
      assert.equal(row.path, expected, row.id);
      assert.equal(row.sha256, hash(read(row.path)), `${name}: stale review ${row.id}`);
    }
  }
  for (const row of record.shared_revisions ?? []) {
    assert.equal(hash(read(row.path)), row.sha256, row.id);
    const review = json(row.review);
    assert(review.reviewed_files.some(file => file.id === row.id && file.sha256 === row.sha256), row.id);
  }
});

const near = (actual, expected, tolerance = 1e-9) =>
  assert(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
function simpson(f, a, b, n = 20000) {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(a + i * h);
  return sum * h / 3;
}

test('the BGK rational equilibrium distinguishes unit mass from the doubled survey prefactor', () => {
  for (const alpha of [0, .2, 1 / 3, .4, .5]) {
    // v = tan(theta) removes the infinite integration interval exactly.
    const transformed = theta => (1 - 2 * alpha * Math.cos(theta) ** 2) / (Math.PI * (1 - alpha));
    near(simpson(transformed, -Math.PI / 2, Math.PI / 2), 1);
    near(simpson(theta => 2 * transformed(theta), -Math.PI / 2, Math.PI / 2), 2);
    for (let j = 0; j <= 100; j++) assert(transformed(-Math.PI / 2 + j * Math.PI / 100) >= -1e-14);
  }
});

test('finite toric-code stars and plaquettes commute and leave two logical qubits', () => {
  for (const size of [3, 4]) {
    const edges = 2 * size * size;
    const edge = (x, y, direction) => 2 * (((x + size) % size) * size + (y + size) % size) + direction;
    const vector = indices => Array.from({length: edges}, (_, i) => indices.includes(i) ? 1 : 0);
    const stars = [], plaquettes = [];
    for (let x = 0; x < size; x++) for (let y = 0; y < size; y++) {
      stars.push(vector([edge(x, y, 0), edge(x - 1, y, 0), edge(x, y, 1), edge(x, y - 1, 1)]));
      plaquettes.push(vector([edge(x, y, 0), edge(x + 1, y, 1), edge(x, y + 1, 0), edge(x, y, 1)]));
    }
    for (const star of stars) for (const plaquette of plaquettes)
      assert.equal(star.reduce((sum, value, i) => sum + value * plaquette[i], 0) % 2, 0);
    const rank = rows => {
      const matrix = rows.map(row => [...row]);
      let pivot = 0;
      for (let column = 0; column < edges && pivot < matrix.length; column++) {
        const next = matrix.findIndex((row, i) => i >= pivot && row[column]);
        if (next < 0) continue;
        [matrix[pivot], matrix[next]] = [matrix[next], matrix[pivot]];
        for (let i = pivot + 1; i < matrix.length; i++) if (matrix[i][column])
          for (let j = column; j < edges; j++) matrix[i][j] ^= matrix[pivot][j];
        pivot++;
      }
      return pivot;
    };
    assert.equal(rank(stars), size * size - 1);
    assert.equal(rank(plaquettes), size * size - 1);
    assert.equal(2 ** (edges - rank(stars) - rank(plaquettes)), 4);
  }
});

test('four-leg Z2 tensor networks have the stated boundary Gram factor', () => {
  for (const [vertices, bonds] of [
    [3, [[0, 1, 1, 0], [1, 1, 2, 0]]],
    [4, [[0, 1, 1, 0], [1, 2, 2, 3], [2, 0, 3, 1], [3, 3, 0, 2]]],
  ]) {
    const occupied = new Set(bonds.flatMap(([v, a, w, b]) => [4 * v + a, 4 * w + b]));
    const boundary = Array.from({length: 4 * vertices}, (_, i) => i).filter(i => !occupied.has(i));
    assert.equal(4 * vertices, 2 * bonds.length + boundary.length);
    assert.equal(boundary.length, 8);
    const dimension = 2 ** boundary.length;
    const rows = new Map();
    // Contract unnormalized bonds, then apply (I + X tensor X tensor X tensor X)/2 at each vertex.
    for (let input = 0; input < dimension; input++) {
      for (let internal = 0; internal < 2 ** bonds.length; internal++) {
        const legs = Array(4 * vertices).fill(0);
        boundary.forEach((leg, i) => { legs[leg] = (input >> i) & 1; });
        bonds.forEach(([v, a, w, b], i) => { legs[4 * v + a] = legs[4 * w + b] = (internal >> i) & 1; });
        for (let group = 0; group < 2 ** vertices; group++) {
          const output = legs.reduce((bits, value, leg) =>
            bits | ((value ^ ((group >> Math.floor(leg / 4)) & 1)) << leg), 0);
          if (!rows.has(output)) rows.set(output, new Map());
          const row = rows.get(output);
          row.set(input, (row.get(input) ?? 0) + 1);
        }
      }
    }
    const gram = Array.from({length: dimension}, () => new Float64Array(dimension));
    for (const row of rows.values()) for (const [a, ca] of row) for (const [b, cb] of row)
      gram[a][b] += ca * cb / 2 ** (2 * vertices);
    const factor = 2 ** (bonds.length - vertices + 1);
    for (let a = 0; a < dimension; a++) for (let b = 0; b < dimension; b++)
      assert.equal(gram[a][b], a === b || (a ^ b) === dimension - 1 ? factor / 2 : 0);
  }
});

test('positive Liouville zero-mode charge gives the Gamma integral and its scaling', () => {
  for (const gamma of [.7, 1, 1.6]) for (const mass of [.4, 1, 2.5]) for (const n of [1, 2, 3]) {
    const charge = n * gamma;
    const integral = simpson(c => Math.exp(charge * c - mass * Math.exp(gamma * c)), -70, 10);
    const factorial = n === 3 ? 2 : 1;
    near(integral, factorial / (gamma * mass ** n), 2e-8);
    // For nonpositive charge the c -> -infinity tail cannot be integrable.
    for (const nonpositive of [0, -gamma])
      assert(Math.exp(nonpositive * -70 - mass * Math.exp(-70 * gamma)) > .99);
  }
});

test('the level-two Virasoro Gram matrix annihilates both negative degenerate-weight vectors', () => {
  for (const gamma of [.5, 1, 1.7]) {
    const b = gamma / 2, Q = b + 1 / b, central = 1 + 6 * Q * Q;
    const weight = alpha => alpha / 2 * (Q - alpha / 2);
    const gram = h => [[4 * h + central / 2, 6 * h], [6 * h, 4 * h * (2 * h + 1)]];
    for (const [alpha, coefficient] of [[-b, b * b], [-1 / b, 1 / (b * b)]]) {
      const matrix = gram(weight(alpha));
      for (const row of matrix) near(row[0] * coefficient + row[1], 0, 2e-8);
    }
    const positive = gram(weight(1 / b));
    assert(positive[0][0] * positive[1][1] - positive[0][1] ** 2 > 0);
  }
});
