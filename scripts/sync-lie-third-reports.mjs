import {syncLieReports} from './sync-lie-reports.mjs';

syncLieReports({
  date: '2026-10-19',
  packetNames: ['mellit', 'zhu'],
  manifest: 'research/icm2026-lie-third-reports.json',
  scope: 'Third Section 7 batch: Anton Mellit and Yongchang Zhu.',
  terminology: {
    reference: 'https://www.bananaspace.org/wiki/首页',
    status: 'Existing site terminology reused; source-specific checks are recorded in the reading packets.',
  },
});
