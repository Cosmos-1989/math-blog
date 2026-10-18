import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {extractSectionSpeakers} from '../scripts/extract-icm-section-roster.mjs';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), 'trees/' + file]));
const note = id => read(files.get(id));
const digest = text => crypto.createHash('sha256').update(text).digest('hex');

test('finite models check the Heisenberg phase and Laurent convolution conventions', () => {
  // Root-of-unity phases are tracked as integers modulo p, without floating-point error.
  for (const p of [3, 5]) {
    const mod = n => ((n % p) + p) % p;
    const elements = Array.from({length: p ** 3}, (_, n) => [n % p, Math.floor(n / p) % p, Math.floor(n / p ** 2)]);
    for (const [a, b, c] of elements) for (const [A, B, C] of elements) for (let t = 0; t < p; t++) {
      assert.equal(mod(c + b * t + C + B * (t + a)), mod(c + C + B * a + (b + B) * t));
      assert.equal(mod(mod(t + a) + A), mod(t + a + A));
    }
  }
  const convolve = (left, right) => {
    const result = new Map();
    for (const [m, a] of left) for (const [n, b] of right)
      result.set(m + n, (result.get(m + n) ?? 0) + a * b);
    return result;
  };
  for (let m = -4; m <= 4; m++) for (let n = -4; n <= 4; n++)
    assert.deepEqual(convolve(new Map([[m, 1]]), new Map([[n, 1]])), new Map([[m + n, 1]]));
  // Right translation by -1 acts on delta_k as delta_(k+1); an intertwiner
  // to chi_z sends delta_k to z^(-k), so precomposition has eigenvalue z^(-1).
  for (const z of [2, 4]) for (let k = -3; k <= 3; k++)
    assert.equal(z ** (-k - 1), z ** (-k) / z);
});

test('the Hecke comparison retains its normalizer-compatible input', () => {
  assert(note('2U0R').includes('K_{M^0}=M^0(F)_{x_0}'));
  assert(note('2U0R').includes('正规化条件'));
  assert(note('2U0T').includes('K_{M^0}=M^0(F)_{x_0}'));
  const packet = json('research/lie-fintzen-packet.json');
  assert(packet.report.claim_sources['2U0R'].includes('section 4.3 opening p.44'));
});

test('section extraction handles abbreviated designations, cross-listings and UTF-8 references', () => {
  const biography = '† 4 - Algebraic and Complex Geometry, 7 - Lie Theory and Generalizations\n数学与 géométrie.';
  const records = [
    {id: 'a', firstName: 'A', lastName: 'Primary', designation: '7 - Lie Theory', biography: '', viewBioAriaLabel: 'View'},
    {id: 'b', firstName: 'B', lastName: 'Cross', designation: '2 - Algebra, †', biography: '$fa', viewBioAriaLabel: 'View'},
    {id: 'c', firstName: 'C', lastName: 'Unrelated', designation: '17 - Other', biography: 'Works on 7 - Lie Theory', viewBioAriaLabel: 'View'},
    {id: 'd', firstName: 'D', lastName: 'Other', designation: '4 - Geometry', biography: 'See 7 - Lie Theory in the biography.', viewBioAriaLabel: 'View'},
  ];
  const payload = records.map(record => JSON.stringify(record)).join('\n')
    + `\nfa:T${Buffer.byteLength(biography).toString(16)},${biography}`;
  const split = Math.floor(payload.length / 2);
  const html = [payload.slice(0, split), payload.slice(split)]
    .map(chunk => `<script>self.__next_f.push(${JSON.stringify([1, chunk])})</script>`).join('');
  const result = extractSectionSpeakers(html, '2026-10-18', 7);
  assert.equal(result.public_speaker_records, 4);
  assert.deepEqual(result.speakers.map(row => row.name), ['A Primary', 'B Cross']);
  assert.deepEqual(result.speakers[1].additional_sections, [4, 7]);
  assert.throws(() => extractSectionSpeakers('<html/>', '2026-10-18', 7), /No Section 7/);
  assert.throws(() => extractSectionSpeakers(html, '2026-10-18', 27), /section number/);
  assert.throws(() => extractSectionSpeakers(html, 'today', 7), /YYYY-MM-DD/);
});

test('the official Lie roster contains 16 speakers in 13 reports, including joint reports', () => {
  const coverage = json('research/icm2026-lie-section-coverage.json');
  const roster = json('research/icm2026-section-seven-roster.json');
  const rows = [...coverage.reports, ...coverage.cross_listed_reports];
  assert.equal(roster.public_speaker_records, 305);
  assert.equal(roster.speakers.length, 16);
  assert.equal(roster.speakers.filter(row => row.primary_section === 7).length, 9);
  assert.equal(coverage.reports.length, 8);
  assert.equal(coverage.cross_listed_reports.length, 5);
  assert.equal(new Set(rows.map(row => row.doi)).size, 13);
  assert.deepEqual(new Set(rows.flatMap(row => row.speakers)), new Set(roster.speakers.map(row => row.name)));
  for (const speaker of roster.speakers) {
    const report = rows.find(row => row.speakers.includes(speaker.name));
    assert.equal(report.primary_section ?? 7, speaker.primary_section);
    assert.deepEqual(report.additional_sections, speaker.additional_sections);
  }
  assert.equal(coverage.sources.speakers_html_sha256, roster.source_sha256);
});

test('landing lists only integrated topics, preserves shared topics, and separates other branches', () => {
  const coverage = json('research/icm2026-lie-section-coverage.json');
  const source = note('0067');
  const research = listedTopics(source.split('\\strong{研究专题}')[1].split('\\strong{其他专题}')[0]);
  const rows = [...coverage.reports, ...coverage.cross_listed_reports];
  const expected = [...coverage.editorial_leading_topics.map(row => row.outline), ...rows.map(row => row.outline).filter(Boolean)];
  assert.deepEqual(research, expected);
  assert.equal(new Set(research).size, research.length);
  assert.deepEqual(listedTopics(source.split('\\strong{其他专题}')[1]), ['00AU', '007E']);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, 3);
  assert.equal(coverage.counts.cross_listed_reports_with_existing_topic, 5);
  assert.equal(coverage.counts.reports_without_dedicated_topic, 5);
  assert.deepEqual(coverage.reports.filter(row => !row.outline).flatMap(row => row.speakers),
    ['David Hernandez', 'Friedrich Knop', 'Thomas Lam', 'Anton Mellit', 'Yongchang Zhu']);
  for (const row of rows) {
    assert.equal(row.on_subject_landing, Boolean(row.outline));
    if (row.outline) {
      assert(note(row.outline).includes('\\taxon{Outline}'));
      assert(note(row.reference).includes(row.doi), row.reference);
    }
  }
});

test('new notes are reachable, uniquely named and have explicit source-bound dependencies', () => {
  const record = json('research/icm2026-lie-first-reports.json');
  const snapshot = json('research/icm2026-lie-first-reports-snapshots.json');
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  const titles = new Map();
  for (const [id] of files) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  assert.deepEqual(record.reports.map(row => row.outline), ['2S00', '2T00', '2U00']);
  assert.equal(new Set(snapshot.notes.map(row => row.id)).size, snapshot.notes.length);
  for (const report of record.reports) {
    for (const key of ['reading_scope', 'question', 'proof_scope', 'claim_sources', 'license']) assert(report[key], key);
    assert(report.remaining_branches?.length || report.deferred?.length, report.outline);
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
    const paragraphs = note(report.outline).split('\n').filter(line => line.startsWith('\\p{'));
    assert(paragraphs.length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)), 'Narrative must not become a catalogue');
  }
});
