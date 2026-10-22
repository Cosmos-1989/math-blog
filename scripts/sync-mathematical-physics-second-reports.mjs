import fs from 'node:fs';
import {syncSectionReports} from './sync-lie-reports.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

syncSectionReports({
  date: '2026-10-22',
  subject: '006B',
  packetPrefix: 'mathematical-physics',
  packetNames: ['hutchcroft', 'mahadev', 'martinelli'],
  manifest: 'research/icm2026-mathematical-physics-second-reports.json',
  coverageFile: 'research/icm2026-mathematical-physics-section-coverage.json',
  rosterFile: 'research/icm2026-section-eleven-roster.json',
  scope: 'The next three previously absent Section Eleven chapters in proceedings order: Hutchcroft, Mahadev and Martinelli, pp.462-515.',
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
  sourceMethod: 'Published proceedings and versioned primary research; each packet records the passages read, local proofs, cited research inputs and conditional statements.',
  coverageScope: 'Official Section Eleven directory compared with dedicated local topics. Topic coverage records exposition and linked prerequisites, not reproduction of every cited research proof.',
  reviewAction: '数学物理报告增补',
  narrativeReason: '围绕长程渗流、量子验证与受约束随机动力学的主要问题组织数学叙述，将定义、计算、证明和引用的研究结果分别链接。',
  terminology: 'Reuse established forest terminology; individual packets retain terminology and source checks.',
});

const file = new URL('../research/icm2026-mathematical-physics-section-coverage.json', import.meta.url);
const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));
const topics = listedTopics(fs.readFileSync(new URL('../trees/006B.tree', import.meta.url), 'utf8'));
const releaseFile = new URL('../research/icm2026-mathematical-physics-first-release.json', import.meta.url);
if (fs.existsSync(releaseFile)) {
  const release = JSON.parse(fs.readFileSync(releaseFile, 'utf8'));
  if (release.result === 'published-and-live-verified') {
    for (const row of coverage.reports.filter(row => ['4B00', '4C00', '4D00'].includes(row.outline))) {
      row.note = '已建立独立专题并完成发布；具体阅读范围、引用定理与证明范围见首批记录。';
      row.integration.status = 'published-and-live-verified';
      row.integration.publication = {
        record: 'research/icm2026-mathematical-physics-first-release.json',
        commit: release.commit,
      };
    }
  }
}
for (const row of coverage.reports.filter(row => ['4E00', '4F00', '4G00'].includes(row.outline))) {
  row.coverage_class = 'dedicated-topic-present';
  row.note = '已建立专题综述与原子条目，复用既有基础；推导、引用定理、条件性结论与猜想在正文中分别注明。';
  row.integration = {
    date: '2026-10-22', status: 'registered-in-local-source',
    validation_record: 'research/icm2026-mathematical-physics-second-validation.json',
    publication: 'This batch is integrated locally; publication requires a separate deployment record.',
  };
}
coverage.parent_navigation_action.decided_order = topics;
coverage.parent_navigation_action.note = '既有全会专题领衔，数学物理分组报告依论文集顺序排列；交叉列出的 Zaag 专题复用原页，独立专题另列。';
fs.writeFileSync(file, JSON.stringify(coverage, null, 2) + '\n');
