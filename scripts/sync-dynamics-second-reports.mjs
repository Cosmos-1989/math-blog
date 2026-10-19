import {syncSectionReports} from './sync-lie-reports.mjs';

syncSectionReports({
  date: '2026-10-19',
  subject: '0069',
  packetPrefix: 'dynamics',
  packetNames: ['buzzi', 'damjanovic', 'deroin'],
  manifest: 'research/icm2026-dynamics-second-reports.json',
  coverageFile: 'research/icm2026-dynamics-section-coverage.json',
  rosterFile: 'research/icm2026-section-nine-roster.json',
  scope: 'Chapters four through six in the published Section 9 order: Jerome Buzzi, Danijela Damjanovic, and Bertrand Deroin.',
  coverageScope: 'Official Section 9 catalogue, with the first six primary reports and the three existing cross-listed topics integrated locally.',
  reviewAction: '动力系统报告增补',
  narrativeReason: '围绕非一致双曲性、高秩对称性及全纯叶状结构的稳定性组织数学叙述，区分局部证明、引用定理与开放问题。',
  terminology: 'Existing Chinese definitions are reused; individual source packets record terminology checks and unresolved external terminology lookups.',
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
});
