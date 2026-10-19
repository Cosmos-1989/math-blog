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

test('the last two primary Lie reports complete the recorded directory without duplicate topics', () => {
  const record = json('research/icm2026-lie-third-reports.json');
  const coverage = json('research/icm2026-lie-section-coverage.json');
  assert.deepEqual(record.reports.map(row => row.outline), ['2Y00', '2Z00']);
  assert.deepEqual(record.reports.map(row => row.doi), ['10.1137/25M1807095', '10.1137/25M1805461']);
  assert.equal(coverage.counts.primary_reports, 8);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, 8);
  assert.equal(coverage.counts.cross_listed_reports_with_existing_topic, 5);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 0);
  const topics = listedTopics(note('0067'));
  assert.equal(topics[0], '2400');
  for (const report of [...coverage.reports, ...coverage.cross_listed_reports]) {
    assert.equal(topics.filter(id => id === report.outline).length, 1, report.doi);
    assert.equal(report.on_subject_landing, true);
  }
});

test('new Lie pages retain source attribution, prerequisite links and narrative reachability', () => {
  const record = json('research/icm2026-lie-third-reports.json');
  const snapshot = json('research/icm2026-lie-third-reports-snapshots.json');
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

test('Lefschetz operators on a truncated polynomial space satisfy the sl2 signs', () => {
  for (let n = 1; n <= 12; n++) {
    const apply = (operator, v) => {
      const result = Array(n).fill(0);
      for (let j = 0; j < n; j++) {
        if (operator === 'e' && j + 1 < n) result[j + 1] += v[j];
        if (operator === 'f' && j > 0) result[j - 1] += j * (n - j) * v[j];
        if (operator === 'h') result[j] += (2 * j - n + 1) * v[j];
      }
      return result;
    };
    const bracket = (a, b, v) => {
      const ab = apply(a, apply(b, v)), ba = apply(b, apply(a, v));
      return ab.map((x, j) => x - ba[j] + 0);
    };
    for (let j = 0; j < n; j++) {
      const v = Array.from({length: n}, (_, k) => Number(k === j));
      assert.deepEqual(bracket('e', 'f', v), apply('h', v));
      assert.deepEqual(bracket('h', 'e', v), apply('e', v).map(x => 2 * x + 0));
      assert.deepEqual(bracket('h', 'f', v), apply('f', v).map(x => -2 * x + 0));
    }
  }
});

test('plane Hamiltonian monomials use a consistent Poisson and Lie bracket convention', () => {
  const act = ([m, n], [a, b, coefficient]) => {
    const c = coefficient * (n * a - m * b);
    return c === 0 ? [0, 0, 0] : [m + a - 1, n + b - 1, c];
  };
  const sum = (...terms) => {
    const values = new Map();
    for (const [a, b, c] of terms) if (c) {
      const key = `${a},${b}`;
      values.set(key, (values.get(key) ?? 0) + c);
    }
    return [...values].filter(([, c]) => c).sort(([a], [b]) => a.localeCompare(b));
  };
  for (let m = 0; m <= 4; m++) for (let n = 0; n <= 4; n++)
    for (let p = 0; p <= 4; p++) for (let q = 0; q <= 4; q++)
      for (let a = 0; a <= 3; a++) for (let b = 0; b <= 3; b++) {
        const v = [a, b, 1];
        const forward = act([m, n], act([p, q], v));
        const reverse = act([p, q], act([m, n], v));
        reverse[2] *= -1;
        const c = p * n - m * q;
        const expected = c === 0 ? [0, 0, 0] : act([m + p - 1, n + q - 1], [a, b, c]);
        assert.deepEqual(sum(forward, reverse), sum(expected));
      }
});

test('the braid coordinate change preserves the entire three-by-three matrix', () => {
  const multiply = (a, b) => a.map(row => b[0].map((_, j) =>
    row.reduce((s, x, k) => s + x * b[k][j], 0)));
  const m1 = a => [[0, 1, 0], [1, a, 0], [0, 0, 1]];
  const m2 = a => [[1, 0, 0], [0, 0, 1], [0, 1, a]];
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let c = -3; c <= 3; c++)
    assert.deepEqual(multiply(multiply(m1(a), m2(b)), m1(c)),
      multiply(multiply(m2(c), m1(b - a * c)), m2(a)));
});

test('the modal-product tail estimate bounds finite tails across decay parameters', () => {
  for (const rho of [1.1, 1.5, 2, 4]) for (const beta of [0.2, 1, 5])
    for (const x of [0.001, 0.1, 1, 3]) for (const m of [0, 3, 10]) {
      let tail = 0;
      for (let j = m + 1; j <= m + 500; j++) tail += Math.log1p(beta * Math.exp(-x * rho ** j));
      const a = x * rho ** (m + 1);
      const upper = beta * Math.exp(-a) / -Math.expm1(-a * (rho - 1));
      assert(tail <= upper + 1e-12, JSON.stringify({rho, beta, x, m, tail, upper}));
    }
});

test('the Schrodinger half phase agrees with the Heisenberg central cocycle', () => {
  for (let x = -2; x <= 2; x++) for (let y = -2; y <= 2; y++)
    for (let xp = -2; xp <= 2; xp++) for (let yp = -2; yp <= 2; yp++)
      for (let u = -2; u <= 2; u++) {
        // Twice the phase avoids floating-point division by two.
        const composed = 2 * u * y + x * y + 2 * (u + x) * yp + xp * yp;
        const central = x * yp - xp * y;
        const product = central + 2 * u * (y + yp) + (x + xp) * (y + yp);
        assert.equal(composed + 0, product + 0);
      }
});

test('reviewed hypotheses and conjectural boundaries remain explicit', () => {
  assert(note('2Y05').includes('j\\geq d-i'));
  assert(note('2Y0H').includes('平移不能下降'));
  assert(note('2Y13').includes('\\gcd(r,d)=1'));
  assert(note('2Y13').includes('注 8.15'));
  assert(note('2Y10').includes('\\taxon{Conjecture}'));
  assert(note('2Z06').includes('\\widehat T(\\mathbb A)/\\widehat T(F)'));
  assert(note('2Z06').includes('旋转因子平凡延拓'));
  for (const id of ['2Z0M', '2Z0R', '2Z0U', '2Z10', '2Z13'])
    assert(!/Zhu[^\n}]*§4\.[134]/.test(note(id)), id);
});
