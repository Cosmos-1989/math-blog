import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';
import {findSectionReport} from '../scripts/sync-lie-reports.mjs';

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
const record = json('research/icm2026-mathematical-physics-final-reports.json');
const snapshots = json('research/icm2026-mathematical-physics-final-reports-snapshots.json');
const coverage = json('research/icm2026-mathematical-physics-section-coverage.json');

test('all fifteen official mathematical-physics reports have distinct topic entries', () => {
  assert.equal(record.subject, '006B');
  assert.deepEqual(record.reports.map(r => r.outline), ['4N00', '4O00']);
  const topics = listedTopics(note('006B'));
  const leadingAndBatch = [...coverage.editorial_leading_topics.map(row => row.outline), '4B00', '4C00', '4D00', '4E00', '4F00', '4G00',
    '4H00', '4I00', '4J00', '4K00', '4L00', '4M00', '4N00', '4O00', '4900'];
  assert.deepEqual(topics.slice(0, leadingAndBatch.length), leadingAndBatch);
  const all = [...coverage.reports, ...coverage.cross_listed_reports];
  assert.equal(all.length, 15);
  assert.equal(new Set(all.map(r => r.outline)).size, 15);
  assert.equal(coverage.counts.dedicated_topics_total, 15);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 0);
  for (const row of all) {
    assert(row.outline && files.has(row.outline) && files.has(row.reference));
    assert.equal(topics.filter(id => id === row.outline).length, 1);
    assert.equal(row.on_subject_landing, true);
  }
  for (const report of record.reports)
    assert.equal(findSectionReport(coverage, report).outline, report.outline);
});

test('invited-talk identity remains separate from proceedings and research-paper identity', () => {
  const xu = findSectionReport(coverage, '10.1137/25M1774094');
  assert.equal(xu.pages, '636-649');
  const deRoeck = findSectionReport(coverage, record.reports[1]);
  for (const field of ['doi', 'title', 'authors', 'pages', 'proceedings_volume', 'proceedings_order'])
    assert.equal(deRoeck[field], null, field);
  assert.equal(deRoeck.talk_title_verified, true);
  assert.equal(deRoeck.related_research_paper, 'https://arxiv.org/abs/2408.04338v2');
  assert(note('icm2026-de-roeck').includes('2408.04338v2'));
  const source = json('research/icm2026-mathematical-physics-final-source-check.json');
  assert.equal(source.de_roeck.channel, 'Simons Foundation');
  assert.equal(source.de_roeck.talk_title, deRoeck.talk_title);
  assert.equal(source.roster_recheck.matches_previous_membership, true);
  assert.equal(source.roster_recheck.speakers.length, 16);
});

test('every new atom has a source, an acyclic prerequisite graph and a stable snapshot', () => {
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

test('independent reviews bind both complete branches and source packets', () => {
  for (const name of ['xu', 'de-roeck']) {
    const review = json(`research/mathematical-physics-${name}-review.json`);
    assert.equal(review.result, 'pass', name);
    assert.deepEqual(review.open_findings, [], name);
    const report = record.reports.find(r => r.reference === `icm2026-${name}`);
    for (const row of snapshots.notes.filter(r => r.id.startsWith(report.prefix) || r.id === report.reference))
      assert(review.reviewed_files.some(file => file.id === row.id), `${name}: unreviewed ${row.id}`);
    assert(review.reviewed_files.some(r => r.id === `mathematical-physics-${name}-packet`));
    for (const row of review.reviewed_files)
      assert.equal(row.sha256, hash(read(row.path)), `${name}: stale review ${row.id}`);
  }
});

const near = (a, b, tolerance = 1e-11) => assert(Math.abs(a - b) < tolerance, `${a} != ${b}`);

test('the relative modular operator orientation gives the density-matrix relative entropy', () => {
  for (const p of [0.1, 0.3, 0.5, 0.8]) for (const q of [0.2, 0.5, 0.7])
    for (const angle of [0, 0.2, 0.7, 1.2]) {
      const rho = [p, 1 - p], sigma = [q, 1 - q];
      const overlaps = [[Math.cos(angle) ** 2, Math.sin(angle) ** 2],
        [Math.sin(angle) ** 2, Math.cos(angle) ** 2]];
      const matrixEntropy = rho.reduce((sum, r, j) => sum + r * Math.log(r) -
        r * sigma.reduce((s, value, i) => s + overlaps[j][i] * Math.log(value), 0), 0);
      // Delta = L_sigma R_rho^{-1} on Hilbert-Schmidt matrices; vector = sqrt(rho).
      const modularEntropy = rho.reduce((sum, r, j) => sum - sigma.reduce((s, value, i) =>
        s + r * overlaps[j][i] * Math.log(value / r), 0), 0);
      near(matrixEntropy, modularEntropy);
      assert(matrixEntropy >= -1e-13);
    }
});

test('the binary-entropy resolvent integral has the positive entropy normalization', () => {
  const steps = 20000;
  for (const x of [0.01, 0.1, 0.3, 0.5, 0.8, 0.99]) {
    const q = x * (1 - x);
    // u = beta - 1/2, t = u/(1+u) maps the infinite integral to [0,1].
    const integrand = t => q * (1 + t) / (t + q * (1 - t) ** 2);
    let sum = integrand(0) + integrand(1);
    for (let i = 1; i < steps; i++) sum += (i % 2 ? 4 : 2) * integrand(i / steps);
    const integral = sum / (3 * steps);
    const entropy = -x * Math.log(x) - (1 - x) * Math.log(1 - x);
    near(integral, entropy, 1e-10);
    assert(integral > 0);
  }
});

test('the Green resolvent difference fixes the sign before taking a four-interval trace', () => {
  for (const e of [0, 0.01, 0.25, 0.5, 0.9, 1]) for (const beta of [0.51, 0.7, 1, 4]) {
    const d = e - 0.5, q = e * (1 - e), w = beta * beta - 0.25;
    const green = b => b - w / (b + d);
    near(green(beta) - green(-beta), 2 * beta * q / (w + q));
  }
});

test('one-step skew-adjoint conjugation cancels the linear off-diagonal perturbation', () => {
  const multiply = (a, b) => a.map(row => b[0].map((_, j) => row.reduce((s, x, k) => s + x * b[k][j], 0)));
  const transpose = a => a[0].map((_, j) => a.map(row => row[j]));
  for (const [d0, d1, v] of [[-1, 2, 0.5], [0, 1, -1], [-2, 3, 2]]) {
    const a = v / (d0 - d1);
    for (const epsilon of [0.01, 0.005, 0.001]) {
      const c = Math.cos(epsilon * a), s = Math.sin(epsilon * a);
      const U = [[c, s], [-s, c]];
      const H = [[d0, epsilon * v], [epsilon * v, d1]];
      const transformed = multiply(multiply(U, H), transpose(U));
      const error = Math.max(Math.abs(transformed[0][0] - d0), Math.abs(transformed[1][1] - d1), Math.abs(transformed[0][1]));
      assert(error <= 4 * (1 + Math.abs(v * a)) * epsilon ** 2);
      near(transformed[0][0] + transformed[1][1], d0 + d1);
    }
  }
});

test('conditioning on one uniform field controls a nonzero affine energy denominator', () => {
  for (const a of [-3, -1, 1, 2]) for (const b of [-3, -0.1, 0, 0.7, 4])
    for (const delta of [0.001, 0.1, 1]) {
      const endpoints = [(-delta - b) / (2 * a), (delta - b) / (2 * a)].sort((x, y) => x - y);
      const probability = Math.max(0, Math.min(1, endpoints[1]) - Math.max(0, endpoints[0]));
      assert(probability <= Math.min(1, delta / Math.abs(a)) + 1e-14);
    }
});
