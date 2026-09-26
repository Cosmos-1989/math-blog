import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = process.argv[2];
const output = process.argv[3];
const reviews = new Map(), groups = [];
for (const name of fs.readdirSync(path.join(root, 'research')).filter(n => /^site-polish-.*\.json$/.test(n)).sort()) {
  const record = JSON.parse(fs.readFileSync(path.join(root, 'research', name), 'utf8'));
  for (const [id, review] of Object.entries(record.reviews ?? {})) reviews.set(id, review);
  groups.push({file:'research/'+name, reviewed:Object.keys(record.reviews ?? {}).length});
}
const files = fs.readdirSync(path.join(root, 'trees'), {recursive:true}).filter(n => n.endsWith('.tree'));
const missing = [], added = [], changed = [], retained = [];
for (const file of files) {
  const id = path.basename(file, '.tree');
  if (!reviews.has(id)) missing.push({id, file:'trees/'+file});
  if (!baseline) continue;
  const before = path.join(path.resolve(baseline), file);
  if (!fs.existsSync(before)) added.push(id);
  else if (fs.readFileSync(before,'utf8') !== fs.readFileSync(path.join(root,'trees',file),'utf8')) changed.push(id);
  else retained.push(id);
}
const result = {date:'2026-09-26', pages:files.length, recordedReviews:files.length-missing.length,
  missing, groups, deferred:[...reviews].filter(([,r])=>r.action==='deferred').map(([id])=>id),
  comparison:baseline ? {added,changed,retained} : null,
  interpretation:'实际逐页审阅记录的并集；登记审阅、机器检查通过与全部证明自足是三个不同的判据。未完成的数学细节保存在各分组记录的 remaining 字段。'};
if (output) fs.writeFileSync(path.resolve(output), JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({pages:result.pages,recordedReviews:result.recordedReviews,missing,
  added:added.length,changed:changed.length,retained:retained.length,deferred:result.deferred},null,2));
