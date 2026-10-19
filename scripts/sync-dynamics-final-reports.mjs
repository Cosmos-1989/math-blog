import {syncSectionReports} from './sync-lie-reports.mjs';

syncSectionReports({
  date: '2026-10-19',
  subject: '0069',
  packetPrefix: 'dynamics',
  packetNames: ['dudko', 'filip', 'kanigowski', 'lomonaco-mukherjee'],
  manifest: 'research/icm2026-dynamics-final-reports.json',
  coverageFile: 'research/icm2026-dynamics-section-coverage.json',
  rosterFile: 'research/icm2026-section-nine-roster.json',
  scope: 'The last four chapters of published Section 9, pp.116-190: Dudko, Filip, Kanigowski, and the joint Lomonaco-Mukherjee report.',
  coverageScope: 'All ten primary Section 9 reports have dedicated topics; the three cross-listed reports reuse their existing topics. Per-report proof boundaries are recorded separately.',
  reviewAction: '动力系统报告增补',
  narrativeReason: '围绕参数空间的局部几何、测度刚性、光滑系统的统计规律和反射动力学组织叙述，定义、局部证明与引用结果分别落在原子条目。',
  terminology: 'Existing Chinese definitions are reused; source packets record terminology checks and unresolved external lookups without claiming unverified agreement.',
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
});
