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
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(f => f.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  assert(!files.has(id), `Duplicate tree ID ${id}`);
  files.set(id, `trees/${file}`);
}
const note = id => read(files.get(id));
const record = json('research/icm2026-mathematical-physics-fourth-reports.json');
const snapshots = json('research/icm2026-mathematical-physics-fourth-reports-snapshots.json');
const coverage = json('research/icm2026-mathematical-physics-section-coverage.json');

test('the fourth batch retains report identity and the existing leading topics', () => {
  assert.equal(record.subject, '006B');
  assert.deepEqual(record.reports.map(r => r.outline), ['4K00', '4L00', '4M00']);
  assert.deepEqual(record.reports.map(r => r.doi), ['10.1137/25M1806715', '10.1137/25M1803309', '10.1137/25M1805801']);
  const topics = listedTopics(note('006B'));
  const leadingAndBatch = [...coverage.editorial_leading_topics.map(row => row.outline), '4B00', '4C00', '4D00', '4E00', '4F00', '4G00', '4H00', '4I00', '4J00', '4K00', '4L00', '4M00'];
  assert.deepEqual(topics.slice(0, leadingAndBatch.length), leadingAndBatch);
  for (const report of record.reports) {
    const rows = coverage.reports.filter(r => r.doi === report.doi);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].outline, report.outline);
    assert.equal(rows[0].on_subject_landing, true);
    assert.equal(rows[0].status, 'selected-branches-integrated');
  }
  const all = [...coverage.reports, ...coverage.cross_listed_reports];
  assert.equal(all.length, 15);
  assert.equal(coverage.counts.dedicated_topics_total, all.filter(r => r.outline).length);
  assert.equal(coverage.counts.reports_without_dedicated_topic, all.filter(r => !r.outline).length);
});

test('new atomic notes have sources, distinct titles and actual prerequisite links', () => {
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
    const branch = snapshots.notes.filter(r => r.id.startsWith(report.prefix) || r.id === report.reference);
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      queue.push(...Array.from(note(id).matchAll(/\]\(([^)]+)\)|\\transclude\{([^}]+)\}/g), m => m[1] ?? m[2]));
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
      assert(branch.some(r => r.id === id), `Unrecorded ${id}`);
    assert(note(report.outline).split('\n').filter(l => l.startsWith('\\p{')).length >= 5);
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

test('independent reviews bind the mathematical text and source packets', () => {
  for (const name of ['sasada', 'staffilani', 'sun']) {
    const review = json(`research/mathematical-physics-${name}-review.json`);
    assert.equal(review.result, 'pass', name);
    assert.deepEqual(review.open_findings, [], name);
    const report = record.reports.find(r => r.reference === `icm2026-${name}`);
    for (const row of snapshots.notes.filter(r => r.id.startsWith(report.prefix) || r.id === report.reference))
      assert(review.reviewed_files.some(file => file.id === row.id), `${name}: unreviewed ${row.id}`);
    assert(review.reviewed_files.some(r => r.id === `mathematical-physics-${name}-packet`));
    for (const row of review.reviewed_files) {
      assert.equal(row.sha256, hash(read(row.path)), `${name}: stale review ${row.id}`);
    }
  }
});

test('the binary carrier conserves mass and preserves Bernoulli-geometric weights locally', () => {
  for (const p of [0.1, 0.25, 0.4]) {
    const r = p / (1 - p);
    const weight = (eta, w) => (eta ? p : 1 - p) * (1 - r) * r ** w;
    for (const eta of [0, 1]) for (let w = 0; w <= 24; w++) {
      const nextEta = Math.min(1 - eta, w);
      const nextW = w + eta - nextEta;
      assert.equal(nextEta + nextW, eta + w);
      assert(Math.abs(weight(eta, w) - weight(nextEta, nextW)) < 1e-14);
      const backEta = Math.min(1 - nextEta, nextW);
      assert.equal(backEta, eta);
      assert.equal(nextW + nextEta - backEta, w);
    }
  }
});

test('quadratic four-wave resonance is the orthogonality condition for a rectangle', () => {
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++)
    for (let c = -3; c <= 3; c++) for (let d = -3; d <= 3; d++) {
      const k2 = [2, -1], u = [a, b], v = [c, d];
      const k1 = k2.map((x, i) => x + u[i]);
      const k3 = k2.map((x, i) => x + v[i]);
      const k = k2.map((x, i) => x + u[i] + v[i]);
      const mismatch = dot(k1, k1) - dot(k2, k2) + dot(k3, k3) - dot(k, k);
      assert.equal(mismatch + 2 * dot(u, v), 0);
    }
});

test('one uniformly signed clause has the SAT and NAE first-moment factors', () => {
  for (let k = 2; k <= 8; k++) {
    for (let assignment = 0; assignment < 2 ** k; assignment++) {
      let sat = 0, nae = 0;
      for (let signs = 0; signs < 2 ** k; signs++) {
        const literals = assignment ^ signs;
        if (literals !== 0) sat++;
        if (literals !== 0 && literals !== 2 ** k - 1) nae++;
      }
      assert.equal(sat / 2 ** k, 1 - 2 ** (-k));
      assert.equal(nae / 2 ** k, 1 - 2 ** (1 - k));
    }
  }
});
