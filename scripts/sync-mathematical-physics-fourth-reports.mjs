import fs from 'node:fs';
import {syncSectionReports} from './sync-lie-reports.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

syncSectionReports({
  date: '2026-10-24', subject: '006B', packetPrefix: 'mathematical-physics',
  packetNames: ['sasada', 'staffilani', 'sun'],
  manifest: 'research/icm2026-mathematical-physics-fourth-reports.json',
  coverageFile: 'research/icm2026-mathematical-physics-section-coverage.json',
  rosterFile: 'research/icm2026-section-eleven-roster.json',
  scope: 'Sasada, Staffilani and Sun, the next three Section Eleven chapters in proceedings order, pp.575-635.',
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
  sourceMethod: 'Published proceedings and versioned primary research; reading locations and local or cited proof scopes are recorded per report.',
  coverageScope: 'Dedicated topics and explicit prerequisites for Section Eleven reports; report presence does not assert reproduction of every research proof.',
  reviewAction: '数学物理报告增补',
  narrativeReason: '由随机初态的孤子运动、波谱的能量迁移和随机约束的可满足性组织叙述，分别链接定义、计算和定理。',
  terminology: 'Reuse canonical forest definitions; terminology sources and any unresolved comparisons are recorded in each packet.',
});

const file = new URL('../research/icm2026-mathematical-physics-section-coverage.json', import.meta.url);
const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const batch of ['first', 'second', 'third', 'fourth']) {
  const name = `research/icm2026-mathematical-physics-${batch}-release.json`;
  const releaseFile = new URL(`../${name}`, import.meta.url);
  if (!fs.existsSync(releaseFile)) continue;
  const release = JSON.parse(fs.readFileSync(releaseFile, 'utf8'));
  if (release.result !== 'published-and-live-verified') continue;
  const manifest = JSON.parse(fs.readFileSync(new URL(`../research/icm2026-mathematical-physics-${batch}-reports.json`, import.meta.url), 'utf8'));
  for (const row of coverage.reports.filter(row => manifest.reports.some(r => r.outline === row.outline))) {
    row.integration = {...row.integration, status: 'published-and-live-verified',
      publication: {record: name, commit: release.commit}};
  }
}
for (const row of coverage.reports.filter(row => ['4K00', '4L00', '4M00'].includes(row.outline))) {
  row.coverage_class = 'dedicated-topic-present';
  if (row.integration?.status === 'published-and-live-verified') continue;
  row.integration = {date: '2026-10-24', status: 'registered-in-local-source',
    validation_record: 'research/icm2026-mathematical-physics-fourth-validation.json',
    publication: 'Local integration; release is established separately by deployment and live checks.'};
}
coverage.parent_navigation_action.decided_order = listedTopics(fs.readFileSync(new URL('../trees/006B.tree', import.meta.url), 'utf8'));
fs.writeFileSync(file, JSON.stringify(coverage, null, 2) + '\n');
