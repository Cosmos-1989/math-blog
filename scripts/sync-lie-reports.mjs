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
export function findSectionReport(coverage, doi) {
  const matches = [...coverage.reports, ...(coverage.cross_listed_reports ?? [])]
    .filter(row => row.doi === doi);
  if (matches.length !== 1)
    throw new Error(`Expected one primary or cross-listed report for ${doi}; found ${matches.length}`);
  return matches[0];
}

export function syncSectionReports({date, packetNames, manifest, scope, crossLandings = [], sharedSnapshotManifests = [], terminology,
  subject = '0067', packetPrefix = 'lie', coverageFile = 'research/icm2026-lie-section-coverage.json',
  rosterFile = 'research/icm2026-section-seven-roster.json', reviewAction = 'Lie 理论报告增补',
  narrativeReason = '由表示的具体模型、主要构造与定理组织叙述，猜想保留其数学状态。', coverageScope,
  sourceMethod = 'Published proceedings; exact reading locations, versions and proof boundaries are recorded in each packet.'}) {
  const packetFiles = packetNames.map(name => `research/${packetPrefix}-${name}-packet.json`);
  const packets = packetFiles.map(read);
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
  const coverage = read(coverageFile);
  const roster = read(rosterFile);
  const subjectTopics = listedTopics(textOf(subject));
  const prerequisites = {}, notes = [];

  // Shared registries change only for this batch; older prerequisite judgments survive.
  for (const packet of packets) {
    const report = packet.report;
    for (const key of ['prefix', 'reference', 'outline', 'doi', 'question', 'reading_scope', 'proof_scope', 'claim_sources'])
      if (!report[key]) throw new Error(`Missing report field ${key}`);
    if (subjectTopics.filter(id => id === report.outline).length !== 1)
      throw new Error(`Topic must be listed once: ${report.outline}`);
    const entry = findSectionReport(coverage, report.doi);
    const ids = [...files.keys()].filter(id => id.startsWith(report.prefix) || id === report.reference).sort();
    if (!ids.includes(report.outline) || !ids.includes(report.reference)) throw new Error(`Incomplete branch ${report.prefix}`);
    for (const id of ids) {
      const text = textOf(id), taxon = taxonOf(id);
      const title = text.match(/\\title\{([^\n]+)\}/)?.[1];
      if (!title || !taxon) throw new Error(`Missing metadata: ${id}`);
      if (!['Outline', 'Reference'].includes(taxon)) {
        if (!Object.hasOwn(packet.prerequisites, id)) throw new Error(`Missing prerequisite review: ${id}`);
        if (!report.proof_scope[id] || !report.claim_sources[id]) throw new Error(`Missing source/proof scope: ${id}`);
      }
      const targets = packet.prerequisites[id] ?? [];
      if (new Set(targets).size !== targets.length) throw new Error(`Duplicate prerequisite: ${id}`);
      const links = new Set(bodyLinks(text).map(link => link.target));
      for (const target of targets) {
        if (!files.has(target)) throw new Error(`${id}: missing prerequisite ${target}`);
        if (!links.has(target)) throw new Error(`${id}: prerequisite absent from prose: ${target}`);
        if (['Outline', 'Reference', 'Chapter', 'Person'].includes(taxonOf(target)))
          throw new Error(`${id}: prerequisite is not a knowledge page: ${target}`);
      }
      prerequisites[id] = targets;
      const sha256 = hash(text);
      notes.push({id, path: files.get(id), title, taxon, sha256});
      audit.reviews[id] = {title, action: reviewAction,
        reason: `${title}。来源、前置关系与证明范围见 ${path.basename(manifest)} 及对应阅读记录。`};
      if (!audit.original_ids.includes(id)) audit.original_ids.push(id);
      if (['Outline', 'Reference'].includes(taxon)) delete audit.prerequisites[id];
      else audit.prerequisites[id] = targets;
      required.pages[id] = {targets, sha256};
    }
    const narrative = {id: report.outline, path: files.get(report.outline), question: report.question,
      previous_targets: ids.filter(id => id !== report.outline)};
    const index = narratives.pages.findIndex(page => page.id === report.outline);
    if (index < 0) narratives.pages.push(narrative); else narratives.pages[index] = narrative;
    if (!entry.baseline_review && entry.status !== 'selected-branches-integrated') {
      entry.baseline_review = {status: entry.status, note: entry.note, reading_scope: entry.reading_scope};
    }
    delete entry.planned_integration;
    if (report.coverage_status) entry.note = report.coverage_status;
    entry.reading_scope = report.reading_scope;
    Object.assign(entry, {status: 'selected-branches-integrated', outline: report.outline,
      reference: report.reference, existing_record: manifest, on_subject_landing: true});
    delete entry.planned_outline;
    delete entry.source_scope;
    const page = {id: report.outline, path: files.get(report.outline), question: report.question,
      previous_targets: [], reason: narrativeReason,
      verified_notes: ids.filter(id => id !== report.outline && id !== report.reference),
      source_notes: report.reading_scope, record: manifest,
      title: textOf(report.outline).match(/\\title\{([^\n]+)\}/)[1], taxon: 'Outline',
      sha256: hash(textOf(report.outline)), reviewed_on: date};
    const reviewIndex = introductionReview.pages.findIndex(item => item.id === report.outline);
    if (reviewIndex < 0) introductionReview.pages.push(page); else introductionReview.pages[reviewIndex] = page;
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
  if (coverageScope) coverage.scope = coverageScope;
  coverage.sources.speakers_html_sha256 = roster.source_sha256;
  coverage.sources.speaker_records_parsed = roster.public_speaker_records;
  coverage.counts.primary_reports_with_existing_topic = coverage.reports.filter(row => row.outline).length;
  coverage.counts.cross_listed_reports_with_existing_topic = coverage.cross_listed_reports.filter(row => row.outline).length;
  coverage.counts.reports_without_dedicated_topic = [...coverage.reports, ...coverage.cross_listed_reports].filter(row => !row.outline).length;
  if ('dedicated_topics_total' in coverage.counts) {
    const allReports = [...coverage.reports, ...coverage.cross_listed_reports];
    coverage.counts.dedicated_topics_total = allReports.filter(row => row.outline).length;
    for (const [label, status] of [['related_material_only', 'related-material-only'], ['missing', 'missing']]) {
      coverage.counts[`${label}_reports`] = allReports.filter(row => row.status === status).length;
      coverage.counts[`primary_${label}_reports`] = coverage.reports.filter(row => row.status === status).length;
    }
    coverage.counts.primary_reports_pending_parent_validation = coverage.reports.filter(row => row.planned_integration).length;
  }
  for (const entry of [...coverage.reports, ...coverage.cross_listed_reports]) {
    entry.on_subject_landing = Boolean(entry.outline && subjectTopics.includes(entry.outline));
    if (entry.outline && !entry.on_subject_landing) throw new Error(`Missing report topic: ${entry.outline}`);
  }
  const leading = coverage.editorial_leading_topics.map(row => row.outline);
  if (JSON.stringify(subjectTopics.slice(0, leading.length)) !== JSON.stringify(leading))
    throw new Error('The recorded leading topics must lead the subject page');
  if (coverage.parent_navigation_action) coverage.parent_navigation_action.status = 'integrated-in-local-source';
  if (!introductionReview.records.includes(manifest)) introductionReview.records.push(manifest);
  for (const {subject, outline} of crossLandings) {
    if (listedTopics(textOf(subject)).filter(id => id === outline).length !== 1)
      throw new Error(`${subject}: cross-listed topic must appear exactly once: ${outline}`);
  }
  const changedLandings = new Set([subject, ...crossLandings.map(row => row.subject)]);
  for (const id of changedLandings) {
    required.pages[id].sha256 = hash(textOf(id));
    const subjectReview = introductionReview.pages.find(page => page.id === id);
    subjectReview.sha256 = hash(textOf(id));
    subjectReview.reviewed_on = date;
  }
  // A reused subject landing can also be registered in an earlier report batch.
  for (const file of sharedSnapshotManifests) {
    const previous = read(file);
    for (const note of previous.notes)
      if (changedLandings.has(note.id)) note.sha256 = hash(textOf(note.id));
    write(file, previous);
  }
  write(manifest, {date, subject, scope,
    source_method: sourceMethod,
    reports: packets.map(packet => packet.report), prerequisites,
    navigation_checks: [...leading, ...coverage.cross_listed_reports.map(row => row.outline).filter(Boolean)],
    ...(crossLandings.length ? {cross_subject_landings: crossLandings} : {}),
    source_errata: packets.flatMap(packet => packet.source_errata ?? []),
    review: {packet_files: packetFiles,
      terminology,
      mathematical_scope: 'Atomic prerequisites, worked calculations and deductions, with cited research inputs and conjectures distinguished. Topic coverage does not assert that all cited proofs are reproduced.'}});
  write(manifest.replace(/\.json$/, '-snapshots.json'), {date, notes});
  write('research/site-evergreen-audit.json', audit);
  write('research/prerequisite-required-links.json', required);
  write('research/topic-narratives.json', narratives);
  write('research/narrative-review-2026-10-13.json', introductionReview);
  write(coverageFile, coverage);
  console.log(JSON.stringify({notes: notes.length, reports: packets.length, coverage: coverage.counts}, null, 2));
}

export const syncLieReports = syncSectionReports;
