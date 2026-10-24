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
const record = json('research/icm2026-mathematical-physics-first-reports.json');
const snapshots = json('research/icm2026-mathematical-physics-first-reports-snapshots.json');
const coverage = json('research/icm2026-mathematical-physics-section-coverage.json');
const roster = json('research/icm2026-section-eleven-roster.json');

test('the first three missing proceedings chapters have distinct report topics', () => {
  assert.equal(record.subject, '006B');
  assert.equal(coverage.section, 11);
  assert.deepEqual(record.reports.map(row => row.outline), ['4B00', '4C00', '4D00']);
  assert.deepEqual(record.reports.map(row => row.doi), [
    '10.1137/25M1805175', '10.1137/25M1806867', '10.1137/25M1824641',
  ]);
  const reports = [...coverage.reports, ...coverage.cross_listed_reports];
  assert.equal(coverage.reports.length, 14);
  assert.equal(coverage.cross_listed_reports.length, 1);
  assert.equal(roster.speakers.length, 16);
  assert.equal(coverage.counts.unique_reports, 15);
  assert.equal(coverage.counts.joint_reports, 1);
  assert.equal(coverage.counts.proceedings_section_eleven_chapters, 13);
  assert.equal(new Set(reports.map(row => row.doi)).size, reports.length);
  assert.equal(coverage.sources.speakers_html_sha256, roster.source_sha256);
  assert(roster.speakers.every(row => row.primary_section === 11 || row.additional_sections.includes(11)));
  const topics = listedTopics(note('006B'));
  assert.deepEqual(topics.slice(0, 4), ['2B00', '4B00', '4C00', '4D00']);
  assert(topics.indexOf('4900') > topics.indexOf('4D00'), 'Retain the cross-listed topic after the proceedings topics');
  const names = reports.flatMap(row => row.speaker_ids);
  assert.equal(names.length, 16);
  assert.equal(new Set(names).size, 16);
  assert.deepEqual([...names].sort(), roster.speakers.map(row => row.speaker_id).sort());
  const sourceGap = coverage.reports.filter(row => !row.doi);
  assert.equal(sourceGap.length, 1);
  assert.deepEqual(sourceGap[0].speakers, ['Wojciech De Roeck']);
  assert.equal(sourceGap[0].title, null);
  // A dedicated invited-talk topic does not invent a proceedings chapter.
  if (sourceGap[0].outline) {
    assert.equal(sourceGap[0].outline, '4O00');
    assert.equal(sourceGap[0].talk_title_verified, true);
    assert.equal(sourceGap[0].authors, null);
    assert.equal(sourceGap[0].pages, null);
  }
  for (const report of reports.filter(row => row.outline)) {
    assert(files.has(report.outline) && files.has(report.reference), report.doi);
    assert.equal(topics.filter(id => id === report.outline).length, 1, report.doi);
    assert.equal(report.on_subject_landing, true);
  }
  assert.equal(coverage.counts.reports_without_dedicated_topic, reports.filter(row => !row.outline).length);
  assert.equal(topics.filter(id => id === '4900').length, 1, 'Reuse the Zaag topic');
  assert(topics.includes('0Q00'), 'Retain the independent Bourbaki topic');
});

test('new atoms have explicit sources, real prerequisite links and stable snapshots', () => {
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
        assert(files.has(target), `${row.id}: missing prerequisite ${target}`);
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

test('independent reviews bind the new pages to their exact content', () => {
  for (const name of ['aggarwal', 'ferrari', 'gaiotto']) {
    const review = json(`research/mathematical-physics-${name}-review.json`);
    assert.equal(review.result, 'pass', name);
    assert.deepEqual(review.open_findings, [], name);
    const report = record.reports.find(row => row.reference === `icm2026-${name}`);
    for (const row of snapshots.notes.filter(row => row.id.startsWith(report.prefix)))
      assert(review.reviewed_files.some(file => file.id === row.id), `${name}: unreviewed ${row.id}`);
    for (const row of review.reviewed_files) {
      const expected = files.get(row.id) ??
        (row.id === `mathematical-physics-${name}-packet` ? `research/${row.id}.json` : undefined);
      assert(expected, `${name}: unrecognized review target ${row.id}`);
      assert.equal(row.path, expected, row.id);
      assert.equal(row.sha256, hash(read(row.path)), `${name}: stale review ${row.id}`);
    }
  }
});

const near = (a, b) => assert(Math.abs(a - b) <= 1e-11 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);

test('the open Toda Lax normalization gives the Hamilton equations', () => {
  // These finite-dimensional regressions supplement the written proofs.
  for (const [p, a] of [[[1, -2, 3], [2, 0.5]], [[0, 2, -1, 4], [1, 3, 2]]]) {
    const n = p.length;
    const L = Array.from({length: n}, () => Array(n).fill(0));
    const B = Array.from({length: n}, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) L[i][i] = p[i];
    for (let i = 0; i < n - 1; i++) {
      L[i][i + 1] = L[i + 1][i] = a[i];
      B[i][i + 1] = -a[i] / 2;
      B[i + 1][i] = a[i] / 2;
    }
    const commutator = L.map((row, i) => row.map((_, j) =>
      p.reduce((sum, __, k) => sum + B[i][k] * L[k][j] - L[i][k] * B[k][j], 0)));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const expected = i === j ? (a[i - 1] ?? 0) ** 2 - (a[i] ?? 0) ** 2 :
        Math.abs(i - j) === 1 ? a[Math.min(i, j)] * (p[Math.min(i, j)] - p[Math.max(i, j)]) / 2 : 0;
      near(commutator[i][j], expected);
    }
    near(commutator.reduce((sum, row, i) => sum + row[i], 0), 0);
    near(L.reduce((sum, row, i) => sum + row.reduce((s, x, j) => s + x * commutator[j][i], 0), 0), 0);
  }
});

test('constant-length hard-rod velocities solve the finite-species balance equation', () => {
  const length = 0.4, densities = [0.1, 0.2, 0.3], velocities = [-2, 0, 3];
  const density = densities.reduce((a, b) => a + b, 0);
  const current = densities.reduce((sum, rho, i) => sum + rho * velocities[i], 0);
  assert(length * density < 1);
  const effective = velocities.map(v => (v - length * current) / (1 - length * density));
  near(densities.reduce((sum, rho, i) => sum + rho * effective[i], 0), current);
  for (let i = 0; i < velocities.length; i++)
    near(effective[i], velocities[i] + length * densities.reduce((sum, rho, j) => sum + rho * (effective[i] - effective[j]), 0));
});

test('hard-rod label order resolves permanent ties and takes the right limit at crossings', () => {
  const reconstruct = (x, v, t, length = 1) => {
    const z = x.map((position, i) => position + v[i] * t);
    const ranks = z.map((position, i) => z.filter((other, j) =>
      other < position || (other === position && (v[j] < v[i] || (v[j] === v[i] && j < i)))).length);
    assert.deepEqual([...ranks].sort((a, b) => a - b), x.map((_, i) => i));
    return z.map((position, i) => position + length * ranks[i]);
  };
  assert.deepEqual(reconstruct([0, 0], [0, 0], 5), [0, 1]);
  assert.deepEqual(reconstruct([0, 0, 0], [2, 2, 2], 3), [6, 7, 8]);
  assert.deepEqual(reconstruct([0, 2], [2, 0], 0), [0, 3]);
  assert.deepEqual(reconstruct([0, 2], [2, 0], 1), [3, 2]);
  assert.deepEqual(reconstruct([0, 2], [2, 0], 2), [5, 2]);
});

test('quartic matrix pairings distinguish planar and genus-one index counts', () => {
  const sigma = [1, 2, 3, 0];
  const pairings = [[1, 0, 3, 2], [3, 2, 1, 0], [2, 3, 0, 1]];
  const exponents = pairings.map(alpha => {
    const seen = new Set();
    let faces = 0;
    for (let i = 0; i < 4; i++) if (!seen.has(i)) {
      faces++;
      for (let j = i; !seen.has(j); j = sigma[alpha[j]]) seen.add(j);
    }
    return 1 - 2 + faces;
  });
  assert.deepEqual(exponents, [2, 2, 0]);
  assert.deepEqual(exponents.map(chi => (2 - chi) / 2), [0, 0, 1]);
});
