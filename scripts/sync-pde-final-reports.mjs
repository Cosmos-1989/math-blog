import fs from 'node:fs';
import {syncSectionReports} from './sync-lie-reports.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

syncSectionReports({
  date: '2026-10-21',
  subject: '006A',
  packetPrefix: 'pde',
  packetNames: ['killip-visan', 'oh', 'zaag', 'ping-zhang'],
  manifest: 'research/icm2026-pde-final-reports.json',
  coverageFile: 'research/icm2026-pde-section-coverage.json',
  rosterFile: 'research/icm2026-section-ten-roster.json',
  scope: 'The remaining four Section 10 proceedings chapters, pp.328-407: Killip-Visan, Oh, Zaag and Ping Zhang. Zaag remains an officially cross-listed report with primary Section 8.',
  crossLandings: [{subject: '0068', outline: '4900'}, {subject: '006B', outline: '4900'}],
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
  sourceMethod: 'Published proceedings and versioned primary research. Exact reading ranges, hypotheses, local derivations and cited research proofs are recorded separately in each packet.',
  coverageScope: 'All 10 primary and 4 officially cross-listed PDE reports have dedicated topics. Seven earlier and four new integrations retain their stated proof ranges; three cross-listed topics reuse existing material. Topic coverage is distinct from reproduction of every research proof.',
  reviewAction: '偏微分方程报告增补',
  narrativeReason: '围绕低正则适定性、波的长时渐近、有限时爆破与流体耗散组织数学叙事，分别链接定义、估计、局部证明与研究定理。',
  terminology: 'Reuse existing Chinese terminology; per-report terminology reading and limitations are recorded in the source packets.',
});

const coveragePath = new URL('../research/icm2026-pde-section-coverage.json', import.meta.url);
const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
coverage.parent_navigation_action.decided_order = listedTopics(fs.readFileSync(new URL('../trees/006A.tree', import.meta.url), 'utf8'));
coverage.parent_navigation_action.note = '三个相关全会专题领衔，随后按论文集次序列出十一篇专题，并复用其余三个跨列报告。Zaag 在分析、偏微分方程和数学物理首页共享同一专题。';
coverage.sync_compatibility.prerequisites = 'syncSectionReports matches a DOI uniquely across the primary and cross-listed arrays without changing its official section membership.';
coverage.directory_recheck = 'research/icm2026-pde-final-directory-check.json';
fs.writeFileSync(coveragePath, JSON.stringify(coverage, null, 2) + '\n');
