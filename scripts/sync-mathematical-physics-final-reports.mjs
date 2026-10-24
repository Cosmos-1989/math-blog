import fs from 'node:fs';
import {syncSectionReports} from './sync-lie-reports.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

syncSectionReports({
  date: '2026-10-24', subject: '006B', packetPrefix: 'mathematical-physics',
  packetNames: ['xu', 'de-roeck'],
  manifest: 'research/icm2026-mathematical-physics-final-reports.json',
  coverageFile: 'research/icm2026-mathematical-physics-section-coverage.json',
  rosterFile: 'research/icm2026-section-eleven-roster.json',
  scope: 'Feng Xu and Wojciech De Roeck, the last two Section Eleven reports without dedicated topics in the preceding coverage record.',
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
  sourceMethod: 'Xu: published proceedings and primary research. De Roeck: original invited-video metadata and a separately identified versioned research paper. No proceedings identity is inferred from that paper.',
  coverageScope: 'Dedicated topics and explicit prerequisites for Section Eleven reports; report presence does not assert reproduction of every research proof.',
  reviewAction: '数学物理报告增补',
  narrativeReason: '由量子态的相对熵和无序自旋链的能量输运组织叙述，分别链接定义、计算、定理与证明。',
  terminology: 'Reuse canonical forest definitions; terminology sources and any unresolved comparisons are recorded in each packet.',
});

const file = new URL('../research/icm2026-mathematical-physics-section-coverage.json', import.meta.url);
const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const batch of ['first', 'second', 'third', 'fourth', 'final']) {
  const name = `research/icm2026-mathematical-physics-${batch}-release.json`;
  const releaseFile = new URL(`../${name}`, import.meta.url);
  if (!fs.existsSync(releaseFile)) continue;
  const release = JSON.parse(fs.readFileSync(releaseFile, 'utf8'));
  if (release.result !== 'published-and-live-verified') continue;
  const manifest = JSON.parse(fs.readFileSync(new URL(`../research/icm2026-mathematical-physics-${batch}-reports.json`, import.meta.url), 'utf8'));
  for (const row of coverage.reports.filter(row => manifest.reports.some(r => r.outline === row.outline)))
    row.integration = {...row.integration, status: 'published-and-live-verified',
      publication: {record: name, commit: release.commit}};
}
for (const row of coverage.reports.filter(row => ['4N00', '4O00'].includes(row.outline))) {
  row.coverage_class = 'dedicated-topic-present';
  if (row.integration?.status === 'published-and-live-verified') continue;
  row.integration = {date: '2026-10-24', status: 'registered-in-local-source',
    validation_record: 'research/icm2026-mathematical-physics-final-validation.json',
    publication: 'Local integration; release is established separately by deployment and live checks.'};
}
const deRoeck = coverage.reports.find(row => row.outline === '4O00');
deRoeck.talk_metadata_scope = 'Original Simons Foundation video metadata rechecked on 2026-10-24; the title field remains reserved for an identified proceedings chapter.';
deRoeck.talk_metadata_record = 'research/icm2026-mathematical-physics-final-source-check.json';
coverage.parent_navigation_action.decided_order = listedTopics(fs.readFileSync(new URL('../trees/006B.tree', import.meta.url), 'utf8'));
coverage.current_integration = {
  date: '2026-10-24', record: 'research/icm2026-mathematical-physics-final-reports.json',
  official_reports: 15, primary_reports: 14, cross_listed_reports: 1,
  dedicated_topics: coverage.counts.dedicated_topics_total,
  publication_identity_gaps: ['Wojciech De Roeck'],
  scope: 'All roster reports have source-bound topics. De Roeck is based on the official invited talk and a separately identified research paper; no chapter metadata has been invented. Historical baseline observations remain dated records.',
};
fs.writeFileSync(file, JSON.stringify(coverage, null, 2) + '\n');
