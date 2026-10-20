import fs from 'node:fs';
import {listedTopics} from './subject-navigation-lib.mjs';
import {syncSectionReports} from './sync-lie-reports.mjs';

syncSectionReports({
  date: '2026-10-20',
  subject: '006A',
  packetPrefix: 'pde',
  packetNames: ['armstrong-kuusi', 'berti', 'cabre', 'colombo'],
  manifest: 'research/icm2026-pde-first-reports.json',
  coverageFile: 'research/icm2026-pde-section-coverage.json',
  rosterFile: 'research/icm2026-section-ten-roster.json',
  scope: 'The first four chapters of published Section 10, pp.193-263: Armstrong-Kuusi, Berti, Cabre, and Colombo. Joint chapters count as one report.',
  sourceMethod: 'Publisher metadata, accessible proceedings text and pinned author preprints. Each packet and independent review distinguishes the version and passages actually read from external proofs and unread material.',
  coverageScope: 'The first four primary Section 10 reports have dedicated topics. Cross-listed and plenary topics are reused where available; other reports retain their verified coverage status. Locally reproduced proofs are recorded separately from cited research results.',
  reviewAction: '偏微分方程报告增补',
  narrativeReason: '围绕介质的有效方程、水波的长期运动、椭圆方程的稳定解和流体解的唯一性组织叙述，定义、计算、证明与引用定理分别链接到独立条目。',
  terminology: 'Existing Chinese definitions are reused. Each source packet records the actual terminology checks, source locations and proof boundaries.',
});

const coveragePath = new URL('../research/icm2026-pde-section-coverage.json', import.meta.url);
const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
const topics = listedTopics(fs.readFileSync(new URL('../trees/006A.tree', import.meta.url), 'utf8'));
for (const entry of coverage.editorial_leading_topics) {
  entry.on_subject_landing = topics.includes(entry.outline);
  entry.decision_status = 'integrated-in-local-source';
  entry.note = '已有全会专题按编辑决定列于偏微分方程首页，不计入官方 Section 10 报告。';
}
for (const entry of coverage.plenary_audit.related_candidates)
  entry.on_subject_landing = Boolean(entry.outline && topics.includes(entry.outline));
coverage.parent_navigation_action.note = '首页先列三个相关全会专题，其后为本批四篇报告及三个复用的跨列专题。基线记录保持不变。';
coverage.sync_compatibility.not_executed = false;
coverage.sync_compatibility.editorial_leading_topics = 'The order 2A00, 2700, 2C00 is verified against the current subject page. These editorial plenary links remain outside the official Section 10 report count.';
coverage.limitations_scope = 'The limitations below describe the frozen roster audit. Current integration and validation are recorded separately.';
fs.writeFileSync(coveragePath, JSON.stringify(coverage, null, 2) + '\n');
