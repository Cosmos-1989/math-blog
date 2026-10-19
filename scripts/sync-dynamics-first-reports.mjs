import {syncSectionReports} from './sync-lie-reports.mjs';

syncSectionReports({
  date: '2026-10-19',
  subject: '0069',
  packetPrefix: 'dynamics',
  packetNames: ['austin', 'berger', 'bialy-mironov'],
  coverageFile: 'research/icm2026-dynamics-section-coverage.json',
  rosterFile: 'research/icm2026-section-nine-roster.json',
  manifest: 'research/icm2026-dynamics-first-reports.json',
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
  scope: 'First three chapters in the published Section 9 order: Tim Austin, Pierre Berger, and the joint report of Misha Bialy and Andrey E. Mironov.',
  coverageScope: 'Complete official Section 9 directory, including explicit cross-listings. Baseline records retain the pre-integration review; current counts reflect the first three chapter integrations and three reused cross-listed topics. Published chapter titles need not equal spoken titles. Topic coverage does not imply complete reconstruction of research proofs or publication.',
  reviewAction: '动力系统报告增补',
  narrativeReason: '围绕系统的统计结构、微扰后的复杂性与可积台球展开数学叙述，分别陈述定理、计算与猜想。',
  terminology: {
    reference: 'https://www.bananaspace.org/wiki/首页',
    status: 'Existing site terminology reused; source-specific checks and unresolved translations are recorded in the reading packets.',
  },
});
