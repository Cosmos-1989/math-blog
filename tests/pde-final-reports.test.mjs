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
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(file => file.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  assert(!files.has(id), `Duplicate tree ID ${id}`);
  files.set(id, `trees/${file}`);
}
const note = id => read(files.get(id));
const record = json('research/icm2026-pde-final-reports.json');
const snapshots = json('research/icm2026-pde-final-reports-snapshots.json');
const coverage = json('research/icm2026-pde-section-coverage.json');

test('all fourteen official PDE reports have topics without double-counting Zaag', () => {
  assert.equal(record.subject, '006A');
  assert.deepEqual(record.reports.map(row => row.outline), ['4700', '4800', '4900', '4A00']);
  assert.deepEqual(record.reports.map(row => row.doi), [
    '10.1137/25M1807149', '10.1137/25M1807174', '10.1137/25M1806892', '10.1137/25M1801980',
  ]);
  const reports = [...coverage.reports, ...coverage.cross_listed_reports];
  assert.equal(coverage.reports.length, 10);
  assert.equal(coverage.cross_listed_reports.length, 4);
  assert.equal(new Set(reports.map(row => row.doi)).size, 14);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, 10);
  assert.equal(coverage.counts.cross_listed_reports_with_existing_topic, 4);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 0);
  assert.equal(coverage.counts.dedicated_topics_total, 14);
  const topics = listedTopics(note('006A'));
  const leadingAndBatch = [...coverage.editorial_leading_topics.map(row => row.outline),
    '4000', '4100', '4200', '4300', '4400', '4500', '4600',
    '4700', '4800', '4900', '4A00', '2G00', '1200', '2I00',
  ];
  assert.deepEqual(topics.slice(0, leadingAndBatch.length), leadingAndBatch);
  for (const report of reports) {
    assert(files.has(report.outline) && files.has(report.reference), report.doi);
    assert.equal(topics.filter(id => id === report.outline).length, 1, report.doi);
    assert.equal(report.on_subject_landing, true);
  }
  const zaag = findSectionReport(coverage, '10.1137/25M1806892');
  assert(coverage.cross_listed_reports.includes(zaag));
  assert.equal(zaag.primary_section, 8);
  assert.deepEqual(zaag.additional_sections, [10, 11]);
  assert.equal(zaag.proceedings_section, 10);
  for (const subject of ['0068', '006A', '006B'])
    assert.equal(listedTopics(note(subject)).filter(id => id === '4900').length, 1, subject);
  const recheck = json('research/icm2026-pde-final-directory-check.json');
  assert.equal(recheck.directory_unchanged, true);
  assert.equal(recheck.current.speakers.length, 16);
});

test('DOI lookup preserves membership and rejects absent or duplicated reports', () => {
  const primary = {doi: 'primary'}, cross = {doi: 'cross', primary_section: 8};
  const fixture = {reports: [primary], cross_listed_reports: [cross]};
  assert.equal(findSectionReport(fixture, 'primary'), primary);
  assert.equal(findSectionReport(fixture, 'cross'), cross);
  assert.deepEqual(fixture, {reports: [primary], cross_listed_reports: [cross]});
  assert.throws(() => findSectionReport(fixture, 'absent'), /found 0/);
  assert.throws(() => findSectionReport({reports: [cross], cross_listed_reports: [cross]}, 'cross'), /found 2/);
});

test('new atoms retain distinct titles, explicit sources and acyclic prerequisites', () => {
  const required = json('research/prerequisite-required-links.json');
  const audit = json('research/site-evergreen-audit.json');
  const titles = new Map();
  for (const id of files.keys()) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  assert.equal(new Set(snapshots.notes.map(row => row.id)).size, snapshots.notes.length);
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
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)), target);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(branch.some(row => row.id === id), `Unrecorded ${id}`);
    assert(note(report.outline).split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), 'The overview must be a mathematical narrative');
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

test('independent reviews bind every new knowledge page to its exact content', () => {
  for (const name of ['killip-visan', 'oh', 'zaag', 'ping-zhang']) {
    const review = json(`research/pde-${name}-review.json`);
    assert.equal(review.result, 'pass', name);
    assert.deepEqual(review.open_findings, [], name);
    const report = record.reports.find(row => row.reference === `icm2026-${name}`);
    for (const row of snapshots.notes.filter(row => row.id.startsWith(report.prefix)))
      assert(review.reviewed_files.some(file => file.id === row.id), `${name}: unreviewed ${row.id}`);
    for (const row of review.reviewed_files) {
      assert.equal(row.path, files.get(row.id), row.id);
      assert.equal(row.sha256, hash(read(row.path)), `${name}: stale review ${row.id}`);
    }
  }
});

const near = (a, b) => assert(Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);

test('the Miura calculation preserves the stated defocusing mKdV and KdV signs', () => {
  for (const [v, vx, vxx, vxxx, vxxxx] of [[1, 2, 3, 4, 5], [-2, 0.5, -3, 1, 7], [0, -3, 2, 0, -1]]) {
    const vt = -vxxx + 6 * v * v * vx;
    const vxt = -vxxxx + 12 * v * vx * vx + 6 * v * v * vxx;
    const u = vx + v * v, ux = vxx + 2 * v * vx;
    const uxxx = vxxxx + 6 * vx * vxx + 2 * v * vxxx;
    near(vxt + 2 * v * vt, -uxxx + 6 * u * ux);
  }
});

test('the wave blow-up exponent and weighted similarity operator have matching coefficients', () => {
  for (const p of [1.5, 2, 3, 5, 7]) {
    const beta = 2 / (p - 1), kappa = (beta * (beta + 1)) ** (1 / (p - 1));
    near(beta * p, beta + 2);
    for (const tau of [0.25, 0.8, 2]) {
      const h = kappa * tau ** -beta;
      near(kappa * beta * (beta + 1) * tau ** (-beta - 2), h ** p);
    }
    for (const dimension of [1, 2, 3, 5]) {
      const alpha = beta - (dimension - 1) / 2;
      near(dimension + 1 + 2 * alpha, 2 * beta + 2);
      if (dimension > 1) assert.equal(alpha > 1e-12, p < 1 + 4 / (dimension - 1) - 1e-12);
    }
  }
});

test('the anisotropic Navier-Stokes norm has half-order critical scaling', () => {
  for (const [s, sigma] of [[0, 0.5], [-0.5, 1], [0.25, 0.25], [1, 0]]) {
    const squaredExponent = 2 * s + 2 * sigma - 4 + 3;
    near(squaredExponent / 2, s + sigma - 0.5);
    if (s + sigma === 0.5) near(squaredExponent, 0);
  }
  for (const lambda of [0.25, 2, 16]) {
    const horizontal = 3, vertical = 5;
    near((lambda * vertical) / (lambda * horizontal), vertical / horizontal);
  }
});
