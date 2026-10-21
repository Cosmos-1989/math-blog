import fs from 'node:fs';
import {syncSectionReports} from './sync-lie-reports.mjs';

syncSectionReports({
  date: '2026-10-20',
  subject: '006A',
  packetPrefix: 'pde',
  packetNames: ['deng', 'elgindi', 'faure'],
  manifest: 'research/icm2026-pde-second-reports.json',
  coverageFile: 'research/icm2026-pde-section-coverage.json',
  rosterFile: 'research/icm2026-section-ten-roster.json',
  scope: 'Published Section 10 chapters five through seven, pp.264-327: Yu Deng, Tarek M. Elgindi and Frederic Faure.',
  sourceMethod: 'Published proceedings and pinned primary research sources. Each packet identifies the version and passages actually read, corrections to source formulas, local proofs and external research inputs.',
  coverageScope: 'Seven primary Section 10 reports have dedicated topics, together with three reused cross-listed topics. Four reports remain without dedicated topics. Integration covers the branches and proof ranges recorded in the two PDE manifests.',
  reviewAction: '偏微分方程报告增补',
  narrativeReason: '从粒子与波的统计演化、理想流体的混合与奇性、双曲动力系统的谱出发组织数学叙事，前置定义、局部计算和引用研究结果分别链接。',
  terminology: 'Reuse existing Chinese mathematical terminology and prerequisite pages; source-specific terminology checks are recorded in each packet.',
});

const coveragePath = new URL('../research/icm2026-pde-section-coverage.json', import.meta.url);
const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
coverage.parent_navigation_action.note = '首页先列三个相关全会专题，其后依照论文集顺序列出七篇偏微分方程专题，并保留三个跨列专题。';
fs.writeFileSync(coveragePath, JSON.stringify(coverage, null, 2) + '\n');
