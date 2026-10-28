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
const files = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(file => file.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  assert(!files.has(id), `Duplicate tree ID ${id}`);
  files.set(id, `trees/${file}`);
}
const note = id => read(files.get(id));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const record = json('research/icm2026-pde-first-reports.json');
const coverage = json('research/icm2026-pde-section-coverage.json');
const snapshots = json('research/icm2026-pde-first-reports-snapshots.json');

test('every official PDE speaker belongs to exactly one primary or cross-listed report', () => {
  const roster = json('research/icm2026-section-ten-roster.json');
  const reports = [...coverage.reports, ...coverage.cross_listed_reports];
  const assigned = reports.flatMap(report => report.speaker_ids);
  assert.equal(assigned.length, 16);
  assert.equal(new Set(assigned).size, assigned.length);
  assert.deepEqual(assigned.toSorted(), roster.speakers.map(speaker => speaker.speaker_id).toSorted());
  assert.equal(coverage.sources.speakers_html_sha256, roster.source_sha256);
  for (const report of reports) {
    assert.equal(report.report_count, 1, report.doi);
    assert.equal(report.speaker_count, report.speaker_ids.length, report.doi);
    for (const id of report.speaker_ids) {
      const speaker = roster.speakers.find(row => row.speaker_id === id);
      assert.equal(speaker.primary_section, report.primary_section, speaker.name);
      assert.deepEqual(speaker.additional_sections, report.additional_sections, speaker.name);
      assert(speaker.primary_section === 10 || speaker.additional_sections.includes(10), speaker.name);
    }
  }
});

test('the first four reports follow proceedings order and preserve the rest of the catalogue', () => {
  assert.equal(record.subject, '006A');
  assert.deepEqual(record.reports.map(row => row.outline), ['4000', '4100', '4200', '4300']);
  assert.deepEqual(record.reports.slice(0, 3).map(row => row.doi), [
    '10.1137/25M1804807', '10.1137/25M1802547', '10.1137/25M1803978',
  ]);
  assert.equal(record.reports[3].doi, '10.1137/25M1807010');
  assert.deepEqual(coverage.reports.slice(0, 4).map(row => row.doi), record.reports.map(row => row.doi));
  assert.equal(coverage.reports.length, 10);
  assert.equal(coverage.cross_listed_reports.length, 4);
  assert.equal(coverage.counts.primary_speakers, 12);
  assert.equal(coverage.counts.joint_reports, 2);
  assert.equal(coverage.counts.proceedings_section_ten_chapters, 11);
  const zaag = coverage.cross_listed_reports.find(row => row.doi === '10.1137/25M1806892');
  assert.equal(zaag.primary_section, 8);
  assert.equal(zaag.proceedings_section, 10);
  assert.equal(zaag.proceedings_order, 10);
  assert.deepEqual(zaag.additional_sections, [10, 11]);
  assert.equal(coverage.counts.primary_reports, coverage.reports.length);
  assert.equal(coverage.counts.cross_listed_reports, coverage.cross_listed_reports.length);
  assert.equal(new Set([...coverage.reports, ...coverage.cross_listed_reports].map(row => row.doi)).size,
    coverage.reports.length + coverage.cross_listed_reports.length);
  const topics = listedTopics(note('006A'));
  const expected = record.reports.map(row => row.outline);
  assert.deepEqual(topics.filter(id => expected.includes(id)), expected);
  const leading = coverage.editorial_leading_topics.map(row => row.outline);
  assert.deepEqual(topics.slice(0, leading.length), leading);
  assert.deepEqual(leading.slice(0, 3), ['2A00', '2700', '2C00']);
  for (const id of ['2G00', '1200', '2I00']) assert(topics.includes(id), id);
  for (const report of [...coverage.reports, ...coverage.cross_listed_reports]) {
    if (!report.outline) {
      assert(!['selected-branches-integrated', 'existing-topic-reused'].includes(report.status), report.doi);
      continue;
    }
    assert(files.has(report.outline), report.doi);
    assert(report.reference && files.has(report.reference), report.doi);
    assert.equal(topics.filter(id => id === report.outline).length, 1, report.doi);
    assert.equal(report.on_subject_landing, true, report.doi);
  }
});

test('every new page has a source, proof scope, dependency review and reader-visible route', () => {
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  const titles = new Map();
  for (const id of files.keys()) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  assert.equal(new Set(snapshots.notes.map(row => row.id)).size, snapshots.notes.length);
  for (const report of record.reports) {
    for (const key of ['reading_scope', 'question', 'proof_scope', 'claim_sources', 'license', 'version_url'])
      assert(report[key], `${report.outline}: missing ${key}`);
    assert(Array.isArray(report.remaining_branches), report.outline);
    assert(report.remaining_branches.length || report.unexpanded_deep_proofs?.length,
      `${report.outline}: record which research proofs remain external`);
    assert(note(report.reference).includes(report.doi), report.reference);
    const reached = new Set(), queue = [report.outline];
    while (queue.length) {
      const id = queue.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      queue.push(...[...note(id).matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)].map(link => link[1]));
    }
    const branch = snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
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
        assert(links.includes(target), `${row.id}: missing dependency ${target}`);
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
      assert(files.has(target), `${id}: missing prerequisite ${target}`);
      visit(target, [...route, id]);
    }
    active.delete(id);
    done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id => visit(id));
});

const near = (actual, expected, tolerance = 1e-10) =>
  assert(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('flat water-wave modes satisfy the bottom condition and the Dirichlet-Neumann symbol', () => {
  for (const h of [0.5, 1, 3]) for (const j of [1, 2, 5]) {
    const vertical = y => Math.cosh(j * (y + h)) / Math.cosh(j * h);
    const verticalDerivative = y => j * Math.sinh(j * (y + h)) / Math.cosh(j * h);
    near(vertical(0), 1);
    near(verticalDerivative(-h), 0);
    near(verticalDerivative(0), j * Math.tanh(j * h));
    const gravity = 2, tension = 0.3;
    const symbol = j * Math.tanh(j * h);
    const omega = Math.sqrt((gravity + tension * j * j) * symbol);
    for (const t of [0, 0.3, 1]) {
      const eta = Math.cos(omega * t);
      const psi = -omega / symbol * Math.sin(omega * t);
      near(-omega * Math.sin(omega * t), symbol * psi);
      near(-omega * omega / symbol * Math.cos(omega * t), -(gravity + tension * j * j) * eta);
    }
  }
});

test('the exponential singular solution has the Hardy stability threshold at dimension ten', () => {
  for (let n = 3; n <= 20; n++) {
    for (const r of [0.1, 0.5, 0.9]) {
      const u = -2 * Math.log(r), derivative = -2 / r, secondDerivative = 2 / (r * r);
      near(-(secondDerivative + (n - 1) / r * derivative), 2 * (n - 2) * Math.exp(u));
    }
    assert.equal(2 * (n - 2) <= (n - 2) ** 2 / 4, n >= 10);
  }
});

test('the explicit half-plane layer uses the matching boundary-reaction normalization', () => {
  for (const x of [-3, -1, -0.2, 0, 0.7, 2]) {
    const u = 2 / Math.PI * Math.atan(x);
    const outwardDerivative = 2 * x / (Math.PI * (1 + x * x));
    near(outwardDerivative, Math.sin(Math.PI * u) / Math.PI);
  }
});

test('self-similar velocity and force have integrable energy-class scaling in dimension three', () => {
  const dimension = 3;
  const velocityNormExponent = -0.5 + dimension / 4;
  const gradientNormExponent = -1 + dimension / 4;
  const forceNormExponent = -1.5 + dimension / 4;
  near(velocityNormExponent, 0.25);
  near(gradientNormExponent, -0.25);
  near(forceNormExponent, -0.75);
  assert(velocityNormExponent > 0);
  assert(2 * gradientNormExponent > -1);
  assert(forceNormExponent > -1);
});

test('taking a real part gives an upper bound, not a general equality, for unstable eigenmodes', () => {
  const a = 1, b = 2, tau = -0.3;
  const realPartNorm = Math.abs(Math.exp(a * tau) * Math.cos(b * tau));
  const complexNorm = Math.exp(a * tau);
  assert(realPartNorm <= complexNorm);
  assert(Math.abs(realPartNorm - complexNorm) > 0.01);
});
