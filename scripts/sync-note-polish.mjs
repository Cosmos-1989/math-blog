import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'research/site-evergreen-audit.json');
const register = JSON.parse(fs.readFileSync(file, 'utf8'));
const records = fs.readdirSync(path.join(root, 'research')).filter(f => /^site-polish-.*\.json$/.test(f)).sort();
let reviewed = 0;
const reviewedIds = new Set();
for (const name of records) {
  const record = JSON.parse(fs.readFileSync(path.join(root, 'research', name), 'utf8'));
  if (!record.reviews) continue;
  for (const [id, review] of Object.entries(record.reviews)) {
    register.reviews[id] = {...register.reviews[id], ...review};
    reviewedIds.add(id);
    reviewed++;
  }
  Object.assign(register.prerequisites, record.prerequisites);
  Object.assign(register.splits, record.splits);
  for (const id of record.removeSplits ?? []) delete register.splits[id];
  for (const id of record.removePrerequisites ?? []) delete register.prerequisites[id];
}
const sourceFiles = fs.readdirSync(path.join(root, 'trees'), {recursive:true}).filter(f => f.endsWith('.tree'));
for (const relative of sourceFiles) {
  const id = path.basename(relative, '.tree');
  if (!reviewedIds.has(id)) continue;
  const text = fs.readFileSync(path.join(root, 'trees', relative), 'utf8');
  if (/\\taxon\{(?:Outline|Chapter)\}/.test(text)) delete register.prerequisites[id];
}
register.editorial_review = {date:'2026-09-26', records, scope:'各分组记录分别说明实际阅读范围；文体扫描、格式整理与数学内容审阅分开。'};
fs.writeFileSync(file, JSON.stringify(register, null, 2)+'\n');
const metadataChanges = [];
for (const subject of ['logic','algebra']) {
  const manifestFile = path.join(root, `research/icm2026-${subject}.json`);
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  for (const note of manifest.notes) {
    if (!reviewedIds.has(note.id)) continue;
    const text = fs.readFileSync(path.join(root, note.path), 'utf8');
    const title = text.match(/\\title\{([^}]+)\}/)?.[1];
    const taxon = text.match(/\\taxon\{([^}]+)\}/)?.[1];
    if (title && taxon && (title !== note.title || taxon !== note.taxon)) {
      metadataChanges.push({id:note.id, before:{title:note.title,taxon:note.taxon}, after:{title,taxon}});
      Object.assign(note, {title,taxon});
    }
  }
  fs.writeFileSync(manifestFile, JSON.stringify(manifest,null,2)+'\n');
}
console.log(JSON.stringify({records:records.length, reviewed, metadataChanges}));
