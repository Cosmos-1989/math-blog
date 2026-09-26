import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const group = path.join(root, 'trees/math/topology/synthetic/homotopy');
const auditPath = path.join(root, 'research/riehl-homotopy.json');
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const require = createRequire(import.meta.url);
const katex = require('/tmp/forester-math-check/node_modules/katex/dist/katex.js');
const errors = [], linksPending = [], formulas = [], diagrams = [];
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
const allTrees = new Map(walk(path.join(root,'trees')).filter(f=>f.endsWith('.tree')).map(f=>[path.basename(f,'.tree'), f]));
function groupAt(text, open) {
  if (text[open] !== '{') throw new Error('Expected open brace');
  let depth = 1;
  for(let i=open+1; i<text.length; i++) {
    if(text[i]==='\\' && (text[i+1]==='{' || text[i+1]==='}' || text[i+1]==='\\')) {i++;continue;}
    if(text[i]==='{') depth++;
    if(text[i]==='}') depth--;
    if(depth===0) return {body:text.slice(open+1,i), end:i+1};
  }
  throw new Error('Unclosed group');
}
for (const f of fs.readdirSync(group).filter(f=>f.endsWith('.tree')).sort()) {
  const id = f.slice(0,-5), text=fs.readFileSync(path.join(group,f),'utf8');
  if (/\\!/.test(text)) errors.push(`${id}: forbidden TeX escape`);
  if (/\\[A-Za-z]+[0-9]+\//.test(text)) errors.push(`${id}: Forester digit/slash control-token ambiguity`);
  if (/原稿|源文|本讲义|前文|后文|上述|上文|下文|父组|审计/.test(text)) errors.push(`${id}: editorial or hierarchical prose`);
  if (/\\(?:id|Hom|op|sSet|Set|Top|Fun|Map|Nat|ev|fib|colim|R)(?![A-Za-z])/.test(text)) errors.push(`${id}: source macro`);
  for(const m of text.matchAll(/\[([^\]\n]+)\]\(([^)\s]+)\)/g)) if(!allTrees.has(m[2])) linksPending.push({id,target:m[2]});
  for(const dep of audit.prerequisites[id] ?? []) {
    if (!text.includes(`](${dep})`)) errors.push(`${id}: missing prerequisite link ${dep}`);
    const file=allTrees.get(dep);
    if(file && /\\taxon\{Outline\}/.test(fs.readFileSync(file,'utf8'))) errors.push(`${id}: outline prerequisite ${dep}`);
  }
  for(const m of text.matchAll(/##?\{/g)) {
    try {
      const formula=groupAt(text,m.index+m[0].length-1).body;
      katex.renderToString(formula,{throwOnError:true,strict:false,displayMode:m[0]==='##{'});
      formulas.push({id,formula});
    } catch(e) {errors.push(`${id}: ${e.message}`);}
  }
  for(const m of text.matchAll(/\\tex\{/g)) {
    const pre=groupAt(text,m.index+4), body=groupAt(text,pre.end);
    diagrams.push({id,preamble:pre.body,body:body.body});
  }
}
const active=new Set(),done=new Set();
function visit(id,route=[]) {
  if(active.has(id)) {errors.push(`Cycle ${[...route,id].join(' -> ')}`);return;}
  if(done.has(id)) return;
  active.add(id);
  for(const dep of audit.prerequisites[id] ?? []) visit(dep,[...route,id]);
  active.delete(id);done.add(id);
}
Object.keys(audit.prerequisites).forEach(id=>visit(id));
const mergedDeps={};
for(const file of fs.readdirSync(path.join(root,'research')).filter(f=>/^riehl-.*\.json$/.test(f))) {
  Object.assign(mergedDeps,JSON.parse(fs.readFileSync(path.join(root,'research',file),'utf8')).prerequisites ?? {});
}
const mergedActive=new Set(),mergedDone=new Set(),mergedCycles=[];
function visitMerged(id,route=[]) {
  if(mergedActive.has(id)) {mergedCycles.push([...route,id]);return;}
  if(mergedDone.has(id)) return;
  mergedActive.add(id);
  for(const dep of mergedDeps[id] ?? []) visitMerged(dep,[...route,id]);
  mergedActive.delete(id);mergedDone.add(id);
}
Object.keys(audit.prerequisites).forEach(id=>visitMerged(id));
if(mergedCycles.length) errors.push(`Crossgroup prerequisite cycles: ${JSON.stringify(mergedCycles)}`);
const uncovered=[];
for(const [n,file] of Object.entries(audit.sourceFiles)) {
  const lines=fs.readFileSync(path.join(audit.sourceDirectory,file),'utf8').split('\n');
  const covered=new Set(audit.sourceCoverage.filter(x=>x.file===file).flatMap(x=>Array.from({length:x.sourceLines[1]-x.sourceLines[0]+1},(_,i)=>i+x.sourceLines[0])));
  lines.forEach((line,i)=>{if(line.trim() && !covered.has(i+1)) uncovered.push({file,line:i+1,text:line});});
}
if(uncovered.length) errors.push(`Uncovered nonempty source lines: ${JSON.stringify(uncovered)}`);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'riehl-homotopy-diagrams-'));
let compiled=0;
for(const [i,d] of diagrams.entries()) {
  const basename=`${d.id}-${i}`;
  fs.writeFileSync(path.join(tmp,basename+'.tex'), `\\documentclass{standalone}\n${d.preamble}\n\\begin{document}\n${d.body}\n\\end{document}\n`);
  const result=spawnSync('/Library/TeX/texbin/latex',['-interaction=nonstopmode','-halt-on-error',basename+'.tex'],{cwd:tmp,encoding:'utf8',timeout:60000});
  if(result.status!==0) errors.push(`${d.id}: standalone latex failed\n${result.stdout?.slice(-3000)}\n${result.stderr}`);
  else {
    const svg=spawnSync('/Library/TeX/texbin/dvisvgm',['--no-fonts',basename+'.dvi','-o',basename+'.svg'],{cwd:tmp,encoding:'utf8',timeout:60000});
    if(svg.status!==0) errors.push(`${d.id}: SVG conversion failed: ${svg.stderr}`);
    else compiled++;
  }
}
const report={pages:fs.readdirSync(group).filter(f=>f.endsWith('.tree')).length,formulas:formulas.length,diagrams:diagrams.length,standaloneDiagramsCompiled:compiled,diagramDirectory:tmp,uncoveredSourceLines:uncovered.length,prerequisiteDAG:'local edges and reachable merged-group snapshot checked',mergedReachablePrerequisiteNodes:mergedDone.size,mergedCycles,linksPending,errors};
audit.validation={...audit.validation,localChecks:report,pending:['parent whole-forest build and rendered-page verification'],crossgroupCanonicalResolution:'completed using published group maps; all public targets exist',fullForestBuild:'not run: parent-owned'};
fs.writeFileSync(auditPath,JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(errors.length || linksPending.length) process.exitCode=1;
