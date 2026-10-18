import {syncLieReports} from './sync-lie-reports.mjs';

syncLieReports({
  date: '2026-10-18',
  packetNames: ['potent', 'davison', 'fintzen'],
  manifest: 'research/icm2026-lie-first-reports.json',
  scope: 'First Section 7 batch: Ben-Zvi-Nadler, Davison and Fintzen.',
  terminology: {
    reference: 'https://www.bananaspace.org/wiki/首页', checked_on: '2026-10-18',
    status: 'Unavailable: direct retrieval returned HTTP 403; searches yielded no usable BananaSpace entries. Existing site vocabulary retained; no external terminology verification claimed.',
  },
});
