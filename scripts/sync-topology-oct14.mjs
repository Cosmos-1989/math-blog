import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizeFormat} from './note-editorial-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
const recordFile = process.argv[2] ?? 'research/icm2026-topology-oct14.json';
const record = read(recordFile);
const audit = read('research/site-evergreen-audit.json');
const required = read('research/prerequisite-required-links.json');
const narratives = read('research/narrative-review-2026-10-13-other.json');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const notes = [];
for (const [id, targets] of Object.entries(record.prerequisites)) {
  const file = files.get(id);
  if (!file) throw new Error(`Missing reviewed note ${id}`);
  const source = normalizeFormat(fs.readFileSync(path.join(root, file), 'utf8'));
  const title = source.match(/\\title\{([^}]+)\}/)?.[1];
  const taxon = source.match(/\\taxon\{([^}]+)\}/)?.[1];
  if (!title || !taxon) throw new Error(`Missing metadata ${id}`);
  fs.writeFileSync(path.join(root, file), source);
  const sha256 = crypto.createHash('sha256').update(source).digest('hex');
  const navigation = ['Outline', 'Reference'].includes(taxon);
  if (navigation && targets.length) throw new Error(`Navigation prerequisites ${id}`);
  if (navigation) delete audit.prerequisites[id];
  else audit.prerequisites[id] = targets;
  audit.reviews[id] = {...audit.reviews[id], title, action: '拓扑报告增补',
    reason: `${title}。逐页核对定义、符号与显式前置；研究输入及证明范围见 ${path.basename(recordFile)}。`};
  required.pages[id] = {targets, sha256};
  notes.push({id, title, taxon, path: file, sha256});
}
for (const report of record.reports) {
  const note = notes.find(row => row.id === report.outline);
  const previous = narratives.pages.find(row => row.id === report.outline);
  const page = {id: report.outline, path: note.path, question: report.question,
    previous_targets: previous?.previous_targets ?? [],
    reason: '按问题、模型、构造、定理及应用组织叙述，技术内容链接到独立条目。',
    verified_notes: notes.filter(row => row.id.startsWith(report.prefix) && row.id !== report.outline).map(row => row.id),
    source_notes: report.reading_scope};
  if (previous) Object.assign(previous, page);
  else narratives.pages.push(page);
}
write('research/site-evergreen-audit.json', audit);
write('research/prerequisite-required-links.json', required);
write('research/narrative-review-2026-10-13-other.json', narratives);
write(recordFile.replace(/\.json$/, '-snapshots.json'), {date: record.date, subject: record.subject, notes});
console.log(JSON.stringify({reviewedPages: notes.length, reports: record.reports.length}));
