import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from './note-prerequisite-lib.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const date = '2026-10-18';
const packetFiles = ['geometry-fraser-packet', 'geometry-haslhofer-packet', 'geometry-witt-nystrom-packet']
  .map(name => `research/${name}.json`);
const packets = packetFiles.map(read);
const manifest = 'research/icm2026-geometry-stability-flow-kahler.json';
const files = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(file => file.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  if (files.has(id)) throw new Error(`Duplicate tree ID: ${id}`);
  files.set(id, 'trees/' + file);
}
const textOf = id => fs.readFileSync(path.join(root, files.get(id)), 'utf8');
const taxonOf = id => textOf(id).match(/\\taxon\{([^}]+)\}/)?.[1];
const audit = read('research/site-evergreen-audit.json');
const required = read('research/prerequisite-required-links.json');
const narratives = read('research/topic-narratives.json');
const introductionReview = read('research/narrative-review-2026-10-13.json');
const bourbaki = read('research/bourbaki-2026-06.json');
const coverage = read('research/icm2026-geometry-section-coverage.json');
const subjectTopics = listedTopics(textOf('0065'));
const prerequisites = {}, notes = [];

// Validate the entire batch before changing the shared registers.
for (const packet of packets) {
  const report = packet.report;
  for (const key of ['prefix', 'reference', 'outline', 'doi', 'question', 'reading_scope'])
    if (!report[key]) throw new Error(`Missing report field ${key}`);
  if (subjectTopics.filter(id => id === report.outline).length !== 1)
    throw new Error(`Topic must be listed once: ${report.outline}`);
  const entry = coverage.reports.find(row => row.doi === report.doi);
  if (!entry) throw new Error(`Report absent from geometry roster: ${report.doi}`);
  const ids = [...files.keys()].filter(id => id.startsWith(report.prefix) || id === report.reference).sort();
  if (!ids.includes(report.outline) || !ids.includes(report.reference)) throw new Error(`Incomplete branch ${report.prefix}`);
  for (const id of ids) {
    const text = textOf(id), taxon = taxonOf(id);
    const title = text.match(/\\title\{([^\n]+)\}/)?.[1];
    if (!title || !taxon) throw new Error(`Missing metadata: ${id}`);
    if (!['Outline', 'Reference'].includes(taxon) && !Object.hasOwn(packet.prerequisites, id))
      throw new Error(`Missing prerequisite review: ${id}`);
    const targets = packet.prerequisites[id] ?? [];
    const links = new Set(bodyLinks(text).map(link => link.target));
    for (const target of targets) {
      if (!files.has(target)) throw new Error(`${id}: missing prerequisite ${target}`);
      if (!links.has(target)) throw new Error(`${id}: prerequisite absent from prose: ${target}`);
      if (['Outline', 'Reference', 'Chapter'].includes(taxonOf(target)))
        throw new Error(`${id}: prerequisite is not a knowledge page: ${target}`);
    }
    prerequisites[id] = targets;
    const sha256 = hash(text);
    notes.push({id, path: files.get(id), title, taxon, sha256});
    audit.reviews[id] = {title, action: '几何学报告增补',
      reason: `${title}。来源、前置关系与证明范围见 icm2026-geometry-stability-flow-kahler.json 及对应阅读记录。`};
    if (!audit.original_ids.includes(id)) audit.original_ids.push(id);
    if (['Outline', 'Reference'].includes(taxon)) delete audit.prerequisites[id];
    else audit.prerequisites[id] = targets;
    required.pages[id] = {targets, sha256};
  }
  const narrative = {id: report.outline, path: files.get(report.outline), question: report.question,
    previous_targets: ids.filter(id => id !== report.outline)};
  const index = narratives.pages.findIndex(page => page.id === report.outline);
  if (index < 0) narratives.pages.push(narrative); else narratives.pages[index] = narrative;
  Object.assign(entry, {status: 'selected-branches-integrated', outline: report.outline,
    reference: report.reference, existing_record: manifest, on_subject_landing: true});
}

const active = new Set(), done = new Set();
function visit(id, route = []) {
  if (active.has(id)) throw new Error(`Prerequisite cycle: ${[...route, id].join(' -> ')}`);
  if (done.has(id)) return;
  active.add(id);
  for (const target of audit.prerequisites[id] ?? []) visit(target, [...route, id]);
  active.delete(id);
  done.add(id);
}
Object.keys(prerequisites).forEach(id => visit(id));
coverage.checked_on = date;
coverage.counts.primary_reports_with_existing_topic = coverage.reports.filter(row => row.outline).length;
coverage.counts.reports_without_dedicated_topic = coverage.reports.filter(row => !row.outline).length;
coverage.review_boundary = 'Topic coverage records local narratives and selected atomic branches. Each existing_record and its source packets specify exact source reading, internal proofs, cited inputs and deferred research branches; topic presence is not a claim of complete internal proofs or publication.';
required.pages['0065'].sha256 = hash(textOf('0065'));
// Keep the overview review current for this batch and the preceding local import.
const overviewSources = [
  {record: 'research/icm2026-geometry-harmonic-contact.json',
    reports: read('research/icm2026-geometry-harmonic-contact.json').reports},
  {record: manifest, reports: packets.map(packet => packet.report)},
];
for (const source of overviewSources) {
  if (!introductionReview.records.includes(source.record)) introductionReview.records.push(source.record);
  for (const report of source.reports) {
    const id = report.outline;
    const page = {id, path: files.get(id), question: report.question,
      previous_targets: [], reason: '从几何问题、模型和方法展开综述，证明与定义链接至原子条目。',
      verified_notes: [...files.keys()].filter(target => target.startsWith(report.prefix) && target !== id),
      source_notes: report.reading_scope, record: source.record,
      title: textOf(id).match(/\\title\{([^\n]+)\}/)[1], taxon: 'Outline',
      sha256: hash(textOf(id)), reviewed_on: date};
    const index = introductionReview.pages.findIndex(item => item.id === id);
    if (index < 0) introductionReview.pages.push(page); else introductionReview.pages[index] = page;
  }
}
const subjectReview = introductionReview.pages.find(page => page.id === '0065');
subjectReview.sha256 = hash(textOf('0065'));
subjectReview.reviewed_on = date;
for (const id of ['0N00', '0GS0']) {
  if (!subjectTopics.includes(id)) throw new Error(`Missing existing Bourbaki topic: ${id}`);
}
bourbaki.notes.find(page => page.id === '0065').sha256 = hash(textOf('0065'));
write(manifest, {date, subject: '0065', scope: 'Fraser, Haslhofer and Witt Nystrom geometry reports.',
  source_method: 'Official proceedings and versioned primary texts; reading locations and proof boundaries are specified in each packet.',
  reports: packets.map(packet => packet.report), prerequisites,
  source_errata: packets.flatMap(packet => packet.source_errata ?? []),
  review: {packet_files: packetFiles,
    mathematical_scope: 'Atomic prerequisites, explicit elementary proofs and deductions, and precise cited research inputs. Remaining branches are not asserted to have internal proofs.'}});
write('research/icm2026-geometry-stability-flow-kahler-snapshots.json', {date, notes});
write('research/site-evergreen-audit.json', audit);
write('research/prerequisite-required-links.json', required);
write('research/topic-narratives.json', narratives);
write('research/narrative-review-2026-10-13.json', introductionReview);
write('research/bourbaki-2026-06.json', bourbaki);
write('research/icm2026-geometry-section-coverage.json', coverage);
console.log(JSON.stringify({notes: notes.length, reports: packets.length, coverage: coverage.counts}, null, 2));
