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
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), 'trees/' + file]));
const note = id => read(files.get(id));
const digest = text => crypto.createHash('sha256').update(text).digest('hex');

test('the second Lie batch has three distinct reports and preserves cross-subject navigation', () => {
  const record = json('research/icm2026-lie-second-reports.json');
  const coverage = json('research/icm2026-lie-section-coverage.json');
  assert.deepEqual(record.reports.map(row => row.outline), ['2V00', '2W00', '2X00']);
  assert.deepEqual(record.reports.map(row => row.doi),
    ['10.1137/25M1802614', '10.1137/25M1811823', '10.1137/25M1804959']);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, 6);
  assert.equal(coverage.counts.cross_listed_reports_with_existing_topic, 5);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 2);
  assert.deepEqual(coverage.reports.filter(row => !row.outline).flatMap(row => row.speakers),
    ['Anton Mellit', 'Yongchang Zhu']);
  assert.equal(listedTopics(note('0067'))[0], '2400');
  assert.equal(listedTopics(note('006D'))[0], '0N00');
  assert.deepEqual(record.cross_subject_landings, [{subject: '006D', outline: '2X00'}]);
  for (const {subject, outline} of record.cross_subject_landings)
    assert.equal(listedTopics(note(subject)).filter(id => id === outline).length, 1);
});

test('each new knowledge page has a unique title, reachable source and explicit prerequisites', () => {
  const record = json('research/icm2026-lie-second-reports.json');
  const snapshot = json('research/icm2026-lie-second-reports-snapshots.json');
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  const titles = new Map();
  for (const [id] of files) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  assert.equal(new Set(snapshot.notes.map(row => row.id)).size, snapshot.notes.length);
  for (const report of record.reports) {
    for (const key of ['reading_scope', 'question', 'proof_scope', 'claim_sources', 'license'])
      assert(report[key], `${report.outline}: ${key}`);
    assert(report.remaining_branches?.length || report.deferred?.length, report.outline);
    assert(note(report.reference).includes(report.doi));
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      queue.push(...[...note(id).matchAll(/\]\(([^)\s]+)\)/g)].map(match => match[1]));
    }
    const branch = snapshot.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
    for (const row of branch) {
      const text = note(row.id);
      assert(reached.has(row.id), `Unreachable ${row.id}`);
      assert.equal(digest(text), row.sha256, row.id);
      assert.equal(digest(text), required.pages[row.id].sha256, row.id);
      assert(!text.includes('\\strong{相关页面}'), row.id);
      if (!['Outline', 'Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title), [row.id], row.title);
        assert(report.proof_scope[row.id] && report.claim_sources[row.id], row.id);
        assert.deepEqual(audit.prerequisites[row.id], record.prerequisites[row.id], row.id);
      }
      const links = bodyLinks(text).map(link => link.target);
      for (const target of record.prerequisites[row.id]) {
        assert(links.includes(target), `${row.id}: missing dependency ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), target);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(branch.some(row => row.id === id), `Unrecorded ${id}`);
    assert(note(report.outline).split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), 'Narrative must not become a catalogue');
  }
});

test('rank-one centralizer multiplication preserves the norm, including the degenerate fibre', () => {
  const multiply = (s, [a, b], [c, d]) => [a * c + s * b * d, a * d + b * c].map(x => x + 0);
  const norm = (s, [a, b]) => a * a - s * b * b;
  for (const s of [-3, 0, 2]) for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++)
    for (let c = -2; c <= 2; c++) for (let d = -2; d <= 2; d++) {
      const x = [a, b], y = [c, d], z = [2, -1];
      assert.equal(norm(s, multiply(s, x, y)), norm(s, x) * norm(s, y) + 0);
      assert.deepEqual(multiply(s, multiply(s, x, y), z), multiply(s, x, multiply(s, y, z)));
      assert.deepEqual(multiply(s, x, [a, -b]), [norm(s, x), 0]);
    }
  for (const a of [-1, 1]) for (const c of [-1, 1]) for (const u of [-2, 0, 3]) {
    const x = [a, a * u], y = [c, 2 * c];
    assert.deepEqual(multiply(0, x, y), [a * c, a * c * (u + 2) + 0]);
  }
});

test('the four-column Pluecker relation has the sign used by positive Grassmannians', () => {
  const det = ([a, b], [c, d]) => a * d - b * c;
  for (let n = 1; n <= 8; n++) {
    const columns = [[1, 0], [n, 1], [-1, n + 2], [-2, 1]];
    const p = (i, j) => det(columns[i - 1], columns[j - 1]);
    assert.equal(p(1, 3) * p(2, 4), p(1, 2) * p(3, 4) + p(1, 4) * p(2, 3));
  }
});

test('the ordered quantum loop tensor product has a trivial vector exactly at resonance', () => {
  const tensor = (a, b) => a.flatMap(row => b.map(r => row.flatMap(x => r.map(y => x * y))));
  const add = (a, b) => a.map((row, i) => row.map((x, j) => x + b[i][j]));
  const scale = (c, a) => a.map(row => row.map(x => c * x));
  const apply = (a, v) => a.map(row => row.reduce((s, x, j) => s + x * v[j], 0));
  const I = [[1, 0], [0, 1]], E = [[0, 1], [0, 0]], F = [[0, 0], [1, 0]];
  const q = 2, K = [[q, 0], [0, 1 / q]], Ki = [[1 / q, 0], [0, q]];
  const s = [0, 1, -q, 0];
  const e1 = add(tensor(E, I), tensor(K, E));
  const f1 = add(tensor(F, Ki), tensor(I, F));
  assert.deepEqual(apply(e1, s), [0, 0, 0, 0]);
  assert.deepEqual(apply(f1, s), [0, 0, 0, 0]);
  for (const [a, b] of [[4, 1], [1, 4]]) {
    const e0 = add(tensor(scale(a / q, F), I), tensor(Ki, scale(b / q, F)));
    const f0 = add(tensor(scale(q / a, E), K), tensor(I, scale(q / b, E)));
    assert.deepEqual(apply(e0, s), [0, 0, 0, a / q - q * b]);
    assert.deepEqual(apply(f0, s), [q / b - q ** 3 / a, 0, 0, 0]);
    assert.equal(apply(e0, s).every(x => x === 0), a === b * q ** 2);
  }
});

test('reviewed convention changes and domain restrictions remain explicit', () => {
  assert(note('2V0B').includes('e_0=q^{-3}k_1^{-1}x_{1,1}^-'));
  assert(note('2V0B').includes('f_0=q^3x_{1,-1}^+k_1'));
  assert(note('2V0W').includes('v_i=u^{\\alpha_i}=\\prod_j u_j^{C_{ji}}'));
  assert(note('2W00').includes('当 #{X} 拟仿射时'));
  assert(note('2W0C').includes('\\xi\\in\\mathfrak b=\\operatorname{Lie}B'));
  // FH's current model uses b=aq. The chosen Chevalley normalization
  // converts k^-1*x^-_1 from aq^2 F to aq^-1 F.
  const q = 2, a = 3, b = a * q;
  assert.equal(q ** -3 * q * b, a / q);
  assert.equal(q ** 3 / (b * q), q / a);
});
