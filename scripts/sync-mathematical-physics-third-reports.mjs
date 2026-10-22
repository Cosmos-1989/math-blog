import fs from 'node:fs';
import crypto from 'node:crypto';
import {syncSectionReports} from './sync-lie-reports.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

const read = name => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const write = (name, value) => fs.writeFileSync(new URL(`../${name}`, import.meta.url), JSON.stringify(value, null, 2) + '\n');
const sharedPath = 'trees/math/analysis/operator-boundaries/0Z1C.tree';
const sharedHash = crypto.createHash('sha256').update(fs.readFileSync(new URL(`../${sharedPath}`, import.meta.url))).digest('hex');
const sharedTargets = ['0Z01', '0Z02', '0Z03', '0A38'];
const sharedReason = '用正半定形式的极化直接证明抽象 C* 代数上的 Schwarz 不等式；以代数内绝对收敛级数证明状态范数界。';
const audit = read('research/site-evergreen-audit.json');
audit.prerequisites['0Z1C'] = sharedTargets;
audit.reviews['0Z1C'] = {...audit.reviews['0Z1C'], action: '共享基础证明修订', reason: sharedReason};
write('research/site-evergreen-audit.json', audit);
const required = read('research/prerequisite-required-links.json');
required.pages['0Z1C'] = {targets: sharedTargets, sha256: sharedHash};
write('research/prerequisite-required-links.json', required);
const peterson = read('research/icm2026-analysis-peterson.json');
const entry = peterson.entries.find(row => row[0] === '0Z1C');
entry[1] = sharedTargets;
entry[2] = sharedReason;
peterson.local_revisions = (peterson.local_revisions ?? []).filter(row => row.id !== '0Z1C');
peterson.local_revisions.push({id: '0Z1C', date: '2026-10-22', sha256: sharedHash,
  reason: sharedReason, statement_changed: false,
  review: 'research/mathematical-physics-perez-garcia-review.json'});
write('research/icm2026-analysis-peterson.json', peterson);
const analysis = read('research/icm2026-analysis.json');
analysis.notes.find(row => row.id === '0Z1C').sha256 = sharedHash;
write('research/icm2026-analysis.json', analysis);

syncSectionReports({
  date: '2026-10-22',
  subject: '006B',
  packetPrefix: 'mathematical-physics',
  packetNames: ['pausader', 'perez-garcia', 'rhodes-vargas'],
  manifest: 'research/icm2026-mathematical-physics-third-reports.json',
  coverageFile: 'research/icm2026-mathematical-physics-section-coverage.json',
  rosterFile: 'research/icm2026-section-eleven-roster.json',
  scope: 'The next three Section Eleven chapters in proceedings order: Pausader, Perez-Garcia, and the joint Rhodes-Vargas report, pp.516-574.',
  sharedSnapshotManifests: ['research/bourbaki-2026-06.json'],
  sourceMethod: 'Published proceedings and versioned primary research; packets distinguish passages read, local derivations, cited theorems, conditional statements and open questions.',
  coverageScope: 'Official Section Eleven directory compared with dedicated local topics. Topic coverage records exposition and linked prerequisites, not reproduction of every cited research proof.',
  reviewAction: '数学物理报告增补',
  narrativeReason: '围绕无碰撞输运的稳定性、二维量子相的分类和 Liouville 共形场论的概率构造展开叙述，分别链接定义、计算和定理。',
  terminology: 'Reuse established forest terminology; individual packets retain terminology and source checks.',
});

const manifestName = 'research/icm2026-mathematical-physics-third-reports.json';
const manifest = read(manifestName);
manifest.shared_revisions = [{id: '0Z1C', path: sharedPath, sha256: sharedHash,
  reason: sharedReason, review: 'research/mathematical-physics-perez-garcia-review.json'}];
write(manifestName, manifest);

const file = new URL('../research/icm2026-mathematical-physics-section-coverage.json', import.meta.url);
const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const [batch, ids] of [['first', ['4B00', '4C00', '4D00']], ['second', ['4E00', '4F00', '4G00']]]) {
  const name = `research/icm2026-mathematical-physics-${batch}-release.json`;
  const releaseFile = new URL(`../${name}`, import.meta.url);
  if (!fs.existsSync(releaseFile)) continue;
  const release = JSON.parse(fs.readFileSync(releaseFile, 'utf8'));
  if (release.result !== 'published-and-live-verified') continue;
  for (const row of coverage.reports.filter(row => ids.includes(row.outline))) {
    row.integration.status = 'published-and-live-verified';
    row.integration.publication = {record: name, commit: release.commit};
  }
}
for (const row of coverage.reports.filter(row => ['4H00', '4I00', '4J00'].includes(row.outline))) {
  row.coverage_class = 'dedicated-topic-present';
  row.note = '已建立专题综述与原子条目，复用既有基础；推导、引用定理、条件性结论与猜想在正文中分别注明。';
  row.integration = {
    date: '2026-10-22', status: 'registered-in-local-source',
    validation_record: 'research/icm2026-mathematical-physics-third-validation.json',
    publication: 'This batch is integrated locally; publication requires a separate deployment record.',
  };
}
coverage.parent_navigation_action.decided_order = listedTopics(fs.readFileSync(new URL('../trees/006B.tree', import.meta.url), 'utf8'));
coverage.parent_navigation_action.note = '既有全会专题领衔，数学物理分组报告依论文集顺序排列；交叉列出的 Zaag 专题复用原页，独立专题另列。';
fs.writeFileSync(file, JSON.stringify(coverage, null, 2) + '\n');
