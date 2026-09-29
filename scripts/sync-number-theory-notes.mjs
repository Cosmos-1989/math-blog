import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, data) => fs.writeFileSync(path.join(root, name), JSON.stringify(data, null, 2) + '\n');
const manifest = read('research/icm2026-number-theory.json');
const register = read('research/site-evergreen-audit.json');
const narratives = read('research/topic-narratives.json');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const snapshots = [];
for (const [id, prerequisites, reason] of manifest.entries) {
  const file = files.get(id);
  if (!file) throw new Error(`Missing note ${id}`);
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const title = text.match(/\\title\{([^}]+)\}/)?.[1];
  const taxon = text.match(/\\taxon\{([^}]+)\}/)?.[1];
  register.reviews[id] = {...register.reviews[id], title, action: '数论报告逐页核对', reason};
  if (taxon === 'Outline') delete register.prerequisites[id];
  else register.prerequisites[id] = prerequisites;
  snapshots.push({id, title, taxon, path: file, sha256: crypto.createHash('sha256').update(text).digest('hex')});
}
for (const [id, question] of [
  ['0C00', '如何把曲线有理点的有限性转为可计算的局部积分和全局筛条件？'],
  ['0C80', '异常谱的稀疏性如何控制整数矩阵的高度和同余类提升？'],
  ['0C0O', '路径的高阶信息如何加强经典 Chabauty 的局部整体条件？'],
]) {
  const existing = narratives.pages.find(page => page.id === id);
  const row = {id, path: files.get(id), question, previous_targets: existing?.previous_targets ?? []};
  if (existing) Object.assign(existing, row);
  else narratives.pages.push(row);
}
manifest.notes = snapshots;
write('research/site-evergreen-audit.json', register);
write('research/topic-narratives.json', narratives);
write('research/icm2026-number-theory.json', manifest);
console.log(JSON.stringify({reviewed: snapshots.length, added: snapshots.length - 1}));
