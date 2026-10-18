import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {extractGeometrySpeakers} from '../scripts/extract-icm-section-five-roster.mjs';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const coverage = json('research/icm2026-geometry-section-coverage.json');
const roster = json('research/icm2026-section-five-roster.json');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), 'trees/' + file]));
const note = id => read(files.get(id));
const normName = name => name.normalize('NFD').replace(/\p{M}/gu, '')
  .replace('Richard Canary', 'Dick Canary').replace('John B. Etnyre', 'John Etnyre');

test('official speaker extraction includes cross-listed and referenced biographies', () => {
  const biography = '† 5 - Geometry, 6 - Topology\nA mathematical biography with é.';
  const records = [
    {id: 'a', firstName: 'A', lastName: 'Primary', designation: ' 5 - Geometry †', biography: '', viewBioAriaLabel: 'View'},
    {id: 'b', firstName: 'B', lastName: 'Cross', designation: '2 - Algebra', biography: '$fa', viewBioAriaLabel: 'View'},
    {id: 'c', firstName: 'C', lastName: 'Unrelated', designation: '15 - Numerical Analysis', biography: 'Works on 5 - Geometry sometimes', viewBioAriaLabel: 'View'},
  ];
  const payload = records.map(record => JSON.stringify(record)).join('\n')
    + `\nfa:T${Buffer.byteLength(biography).toString(16)},${biography}`;
  const html = `<script>self.__next_f.push(${JSON.stringify([1, payload])})</script>`;
  const result = extractGeometrySpeakers(html, '2026-10-18');
  assert.equal(result.public_speaker_records, 3);
  assert.deepEqual(result.speakers.map(speaker => speaker.name), ['A Primary', 'B Cross']);
  assert.deepEqual(result.speakers[1].additional_sections, [5, 6]);
  assert.throws(() => extractGeometrySpeakers('<html/>', '2026-10-18'), /No Section 5/);
});

test('the complete Geometry roster accounts for 20 speakers in 18 reports', () => {
  assert.equal(roster.speakers.length, 20);
  assert.equal(roster.speakers.filter(speaker => speaker.primary_section === 5).length, 16);
  assert.equal(coverage.reports.length, 15);
  assert.equal(coverage.cross_listed_reports.length, 3);
  const allReports = [...coverage.reports, ...coverage.cross_listed_reports];
  assert.equal(new Set(allReports.map(report => report.doi)).size, 18);
  const expected = new Set(allReports.flatMap(report => report.speakers).map(normName));
  assert.deepEqual(new Set(roster.speakers.map(speaker => normName(speaker.name))), expected);
  for (const speaker of roster.speakers) {
    const report = allReports.find(row => row.speakers.some(name => normName(name) === normName(speaker.name)));
    assert.equal(report.primary_section ?? 5, speaker.primary_section);
    assert.deepEqual(report.additional_sections ?? [], speaker.primary_section === 5 ? speaker.additional_sections : []);
  }
  assert.equal(coverage.sources.speakers_html_sha256, roster.source_sha256);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, 15);
  assert.equal(coverage.counts.cross_listed_reports_with_existing_topic, 3);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 0);
  const topics = listedTopics(note('0065'));
  assert.deepEqual(topics.slice(0, 2), ['2C00', '2600']);
  for (const report of allReports) {
    assert.equal(topics.filter(id => id === report.outline).length, 1, report.title);
    assert.equal(report.on_subject_landing, true);
    assert(files.has(report.reference), report.reference);
  }
});

test('three new branches have explicit, source-bound prerequisites and narrative entry points', () => {
  const record = json('research/icm2026-geometry-final-reports.json');
  const snapshot = json('research/icm2026-geometry-final-reports-snapshots.json');
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  assert.deepEqual(record.reports.map(report => report.outline), ['2P00', '2Q00', '2R00']);
  for (const report of record.reports) {
    assert(report.reading_scope && report.question && report.proof_scope);
    assert(report.remaining_branches?.length || report.deferred?.length);
    assert.equal(coverage.reports.find(row => row.doi === report.doi).outline, report.outline);
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
      assert(reached.has(row.id), `Unreachable: ${row.id}`);
      const text = note(row.id), sha256 = crypto.createHash('sha256').update(text).digest('hex');
      assert.equal(sha256, row.sha256, row.id);
      assert.equal(sha256, required.pages[row.id].sha256, row.id);
      const links = bodyLinks(text).map(link => link.target);
      for (const target of record.prerequisites[row.id]) {
        assert(links.includes(target), `${row.id}: missing prose link ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter)\}/.test(note(target)), `${row.id}: navigation prerequisite ${target}`);
      }
      if (!['Outline', 'Reference'].includes(row.taxon))
        assert.deepEqual(audit.prerequisites[row.id], record.prerequisites[row.id], row.id);
      assert(!text.includes('\\strong{相关页面}'), row.id);
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(branch.some(row => row.id === id), `Missing snapshot ${id}`);
    for (const id of Object.keys(report.proof_scope)) assert(branch.some(row => row.id === id), `Unbound proof scope ${id}`);
    assert(note(report.outline).split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), `${report.outline}: a survey must be more than a catalogue`);
  }
});

test('new knowledge-page titles are unique across the forest', () => {
  const snapshot = json('research/icm2026-geometry-final-reports-snapshots.json');
  const titles = new Map();
  for (const [id] of files) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  for (const row of snapshot.notes) if (row.taxon !== 'Reference')
    assert.deepEqual(titles.get(row.title), [row.id], row.title);
});

test('the helicoid parameterization has zero mean curvature and the stated Gaussian curvature', () => {
  const dot = (u, v) => u.reduce((sum, x, i) => sum + x * v[i], 0);
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  for (const a of [0.2, 1, 3]) for (const s of [-3, 0, 0.7, 4]) for (const t of [-2, 0, 1.3]) {
    const xs = [Math.cos(t), Math.sin(t), 0], xt = [-s * Math.sin(t), s * Math.cos(t), a];
    const normal = cross(xs, xt), norm = Math.sqrt(dot(normal, normal));
    const unit = normal.map(x => x / norm);
    const xst = [-Math.sin(t), Math.cos(t), 0], xtt = [-s * Math.cos(t), -s * Math.sin(t), 0];
    const E = dot(xs, xs), F = dot(xs, xt), G = dot(xt, xt);
    const e = 0, f = dot(xst, unit), g = dot(xtt, unit);
    const H = (e * G - 2 * f * F + g * E) / (2 * (E * G - F * F));
    const K = (e * g - f * f) / (E * G - F * F);
    assert(Math.abs(H) < 1e-12);
    assert(Math.abs(K + a * a / (s * s + a * a) ** 2) < 1e-12);
  }
});

test('Weierstrass data obey both the null relation and the induced metric normalization', () => {
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const scale = (a, s) => a.map(x => s * x);
  const abs2 = a => a[0] ** 2 + a[1] ** 2;
  for (const g of [[1, 0], [0, 2], [2, 3], [-0.3, 0.7]]) for (const h of [[1, 0], [2, -1]]) {
    const inverse = [g[0] / abs2(g), -g[1] / abs2(g)];
    const phi = [mul(scale(add(inverse, scale(g, -1)), 0.5), h),
      mul(mul([0, 0.5], add(inverse, g)), h), h];
    const squareSum = phi.reduce((sum, x) => add(sum, mul(x, x)), [0, 0]);
    assert(Math.hypot(...squareSum) < 1e-12);
    const induced = phi.reduce((sum, x) => sum + abs2(x), 0) / 2;
    const r = Math.sqrt(abs2(g));
    assert(Math.abs(induced - abs2(h) * (r + 1 / r) ** 2 / 4) < 1e-12);
  }
});

test('a rank-m semipositive form has the stated fibre-collapse volume order', () => {
  const factorial = n => Array.from({length: n}, (_, i) => BigInt(i + 1)).reduce((a, b) => a * b, 1n);
  for (let n = 1; n <= 6; n++) for (let m = 0; m < n; m++) {
    const eigenvalues = Array.from({length: n}, (_, i) => i < m ? BigInt(i + 1) : 0n);
    let polynomial = [1n];
    for (const eigenvalue of eigenvalues) {
      const next = Array(polynomial.length + 1).fill(0n);
      polynomial.forEach((coefficient, degree) => {
        next[degree] += eigenvalue * coefficient;
        next[degree + 1] += coefficient;
      });
      polynomial = next;
    }
    const q = n - m;
    assert(polynomial.slice(0, q).every(coefficient => coefficient === 0n));
    const product = eigenvalues.slice(0, m).reduce((a, b) => a * b, 1n);
    assert.equal(polynomial[q], product);
    const mixedFormCoefficient = factorial(m) * factorial(q) * product;
    const binomial = factorial(n) / (factorial(m) * factorial(q));
    assert.equal(factorial(n) * polynomial[q], binomial * mixedFormCoefficient);
  }
});

test('hyperbolic parallel surfaces preserve the stated normal and volume conventions', () => {
  for (const r of [0.1, 0.4, 1, 2]) {
    const area = 4 * Math.PI * 2;
    const volume = area * (r + Math.sinh(2 * r) / 2);
    const integratedH = 2 * area * Math.sinh(2 * r);
    const W = volume - integratedH / 4;
    assert(Math.abs(W - area * r) < 1e-10);
    const K = -1 / Math.cosh(r) ** 2;
    const renormalized = W - area * Math.atanh(Math.sqrt(1 + K));
    assert(Math.abs(renormalized) < 1e-10);
    for (const k of [0, 0.3, 1, 2]) {
      const A = Math.cosh(r) + k * Math.sinh(r);
      const B = (Math.sinh(r) + k * Math.cosh(r)) / A;
      const star = (1 - k) / (1 + k);
      const Istar = (1 + k) ** 2 / 2;
      const IIstar = (1 - k * k) / 2;
      const IIIstar = (1 - k) ** 2 / 2;
      assert(Math.abs(A * A - (Math.exp(2 * r) * Istar / 2 + IIstar + Math.exp(-2 * r) * IIIstar / 2)) < 1e-10);
      assert(Math.abs((1 - star) / (1 + star) - k) < 1e-12);
      assert(Math.abs(1 / (A * A) * (1 - k * k) - (1 - B * B)) < 1e-12);
    }
  }
});

test('the real tensor contraction equals four times the Beltrami pairing', () => {
  for (const rho of [0.2, 1, 3]) for (const [a, b, u, v] of [[1, 2, 3, 4], [-2, 0.5, 1, -3]]) {
    const variation = [2 * rho * a, 2 * rho * b, 2 * rho * b, -2 * rho * a];
    const quadratic = [u, -v, -v, -u];
    const density = variation.reduce((sum, x, i) => sum + x * quadratic[i], 0) / rho;
    assert(Math.abs(density - 4 * (a * u - b * v)) < 1e-12);
  }
});
