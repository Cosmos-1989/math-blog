import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const register = JSON.parse(fs.readFileSync(path.join(root, 'research/site-evergreen-audit.json'), 'utf8'));
const pages = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive:true}).filter(f => f.endsWith('.tree'))) {
  const text = fs.readFileSync(path.join(root, 'trees', file), 'utf8'), id = path.basename(file, '.tree');
  pages.set(id, {id, file:'trees/'+file, title:text.match(/\\title\{([^}]+)/)?.[1], taxon:text.match(/\\taxon\{([^}]+)/)?.[1] ?? 'Outline'});
}
const knowledge = [...pages.values()].filter(p => !['Outline','Chapter','Reference','Person'].includes(p.taxon));
const cache = new Map(), active = new Set();
function descend(id) {
  if (cache.has(id)) return cache.get(id);
  if (active.has(id)) throw new Error('Dependency cycle involving '+id);
  active.add(id);
  const deps = register.prerequisites[id] ?? [];
  const summaries = deps.map(descend);
  const value = {depth:deps.length ? 1+Math.max(...summaries.map(s=>s.depth)) : 0, leaves:deps.length ? [...new Set(summaries.flatMap(s=>s.leaves))].sort() : [id]};
  active.delete(id); cache.set(id, value); return value;
}
const paths = knowledge.map(p => ({...p, prerequisites:register.prerequisites[p.id] ?? [], ...descend(p.id)}));
const terminals = paths.filter(p => !p.prerequisites.length);
const result = {date:'2026-09-26', knowledgePages:paths.length, prerequisiteEdges:paths.reduce((n,p)=>n+p.prerequisites.length,0), terminals, pages:paths,
  method:'仅展开已登记的数学前置关系，终点清单供逐页核查；无循环和存在路径不等于证明前置完整。'};
const output = process.argv[2];
if (output) fs.writeFileSync(path.resolve(output), JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({knowledgePages:paths.length, prerequisiteEdges:result.prerequisiteEdges, terminalCount:terminals.length, maximumDepth:Math.max(...paths.map(p=>p.depth)), terminals:terminals.map(p=>({id:p.id,title:p.title}))},null,2));
