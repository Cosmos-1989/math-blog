import {syncLieReports} from './sync-lie-reports.mjs';

syncLieReports({
  date: '2026-10-19',
  packetNames: ['hernandez', 'knop', 'lam'],
  manifest: 'research/icm2026-lie-second-reports.json',
  scope: 'Second Section 7 batch: Hernandez, Knop and Lam.',
  crossLandings: [{subject: '006D', outline: '2X00'}],
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
  terminology: {
    reference: 'https://www.bananaspace.org/wiki/首页',
    status: 'Existing site terminology reused. Source-by-source checks and unavailable references are recorded in the reading packets; no site-wide terminology verification claimed.',
  },
});
