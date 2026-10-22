import fs from 'node:fs';
import {syncSectionReports} from './sync-lie-reports.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

syncSectionReports({
  date: '2026-10-22',
  subject: '006B',
  packetPrefix: 'mathematical-physics',
  packetNames: ['aggarwal', 'ferrari', 'gaiotto'],
  manifest: 'research/icm2026-mathematical-physics-first-reports.json',
  coverageFile: 'research/icm2026-mathematical-physics-section-coverage.json',
  rosterFile: 'research/icm2026-section-eleven-roster.json',
  scope: 'The first three previously absent chapters in Section Eleven proceedings order: Aggarwal, Ferrari and Gaiotto, pp.411-461.',
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
  sourceMethod: 'Published proceedings and versioned primary research. Each packet distinguishes the passages read, local derivations, cited research inputs and conjectural proposals.',
  coverageScope: 'Complete official Section Eleven directory checked against the local forest. Three new report topics are integrated, and existing report topics are reused. Topic coverage does not imply reproduction of every research proof.',
  reviewAction: '数学物理报告增补',
  narrativeReason: '由多体运动、碰撞线性化和矩阵的大秩展开解释核心问题，连接原子定义、计算、定理及其证明。',
  terminology: 'Reuse existing Chinese mathematical terminology; source checks and terminology decisions are recorded in the individual packets.',
});

const file = new URL('../research/icm2026-mathematical-physics-section-coverage.json', import.meta.url);
const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));
const topics = listedTopics(fs.readFileSync(new URL('../trees/006B.tree', import.meta.url), 'utf8'));
for (const row of coverage.editorial_leading_topics) {
  row.on_subject_landing = topics.includes(row.outline);
  row.decision_status = 'integrated-in-local-source';
}
for (const row of coverage.reports.filter(row => ['4B00', '4C00', '4D00'].includes(row.outline))) {
  row.coverage_class = 'dedicated-topic-present';
  row.note = '已建立独立综述、原子定义及推导，复用既有基础页；局部证明、引用的研究定理与猜想分别标明。构建与独立复核结果见本批验证记录，当前状态不表示已发布。';
  row.integration = {
    date: '2026-10-22',
    status: 'registered-in-local-source',
    validation_record: 'research/icm2026-mathematical-physics-first-validation.json',
    publication: 'No new publication requested in this task; local registration is not deployment.',
  };
}
coverage.parent_navigation_action.decided_order = topics;
coverage.parent_navigation_action.note = 'Yau 的既有全会专题领衔；Aggarwal、Ferrari、Gaiotto 按论文集顺序排列，随后复用 Zaag。Sabin 的 Bourbaki 专题单列，报告身份与前置材料分别记录。';
fs.writeFileSync(file, JSON.stringify(coverage, null, 2) + '\n');
