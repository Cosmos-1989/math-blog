import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const katex=require('/tmp/forester-math-check/node_modules/katex/dist/katex.js');
const root='/Users/sunzy/claude_test/forester2';
const dir=path.join(root,'trees/math/topology/synthetic/types');
const auditFile=path.join(root,'research/riehl-types.json');
const audit=JSON.parse(fs.readFileSync(auditFile,'utf8'));
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const allFiles=walk(path.join(root,'trees')).filter(f=>f.endsWith('.tree'));
const byId=new Map(allFiles.map(f=>[path.basename(f,'.tree'),f]));
const errors=[],warnings=[];
let formulas=0,diagrams=0;
function endGroup(t,start){let d=0;for(let i=start;i<t.length;i++){if(t[i]==='{'&&t[i-1]!=='\\')d++;if(t[i]==='}'&&t[i-1]!=='\\'&&--d===0)return i;}throw new Error('unbalanced');}
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.tree'))){
  const id=f.slice(0,-5),t=fs.readFileSync(path.join(dir,f),'utf8');
  if(/\\!/.test(t))errors.push(id+': forbidden escape');
  for(const m of t.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g))if(!byId.has(m[1]))errors.push(id+': missing link '+m[1]);
  for(const m of t.matchAll(/(##?)\{/g)){
    try {
      const e=endGroup(t,m.index+m[1].length),math=t.slice(m.index+m[1].length+1,e);
      katex.renderToString(math,{throwOnError:true,strict:false,displayMode:m[1]==='##'}); formulas++;
    }catch(e){errors.push(id+': '+e.message);}
  }
  for(const m of t.matchAll(/\\tex\{/g)){
    const start=m.index+4,pe=endGroup(t,start),bs=pe+1,be=endGroup(t,bs);
    const pre=t.slice(start+1,pe),body=t.slice(bs+1,be);
    const d='/tmp/riehl-types-diagram-'+id;fs.mkdirSync(d,{recursive:true});
    fs.writeFileSync(path.join(d,'diagram.tex'),'\\documentclass{standalone}\n'+pre+'\n\\begin{document}\n'+body+'\n\\end{document}\n');
    const run=spawnSync('/Library/TeX/texbin/pdflatex',['-interaction=nonstopmode','-halt-on-error','diagram.tex'],{cwd:d,encoding:'utf8'});
    if(run.status!==0)errors.push(id+': standalone diagram failed: '+run.stdout.slice(-3000));else diagrams++;
  }
  if(!audit.reviews[id])errors.push(id+': missing review');
  if(/本讲义|本章|前文|后文|下一章|上一节|上一命题|上一引理|整理自|原稿/.test(t)&&!id.startsWith('020'))warnings.push(id+': positional/editorial prose');
  for(const dep of audit.prerequisites[id]||[]){
    if(!t.includes(']('+dep+')'))errors.push(id+': dependency not linked '+dep);
    if(byId.has(dep)&&/\\taxon\{(?:Outline|Chapter|Example)\}/.test(fs.readFileSync(byId.get(dep),'utf8')))warnings.push(id+': dependency not definition/result '+dep);
  }
}
const visiting=new Set(),visited=new Set();
const merged={};
for(const f of fs.readdirSync(path.join(root,'research')).filter(f=>/^riehl-.+\.json$/.test(f)))Object.assign(merged,JSON.parse(fs.readFileSync(path.join(root,'research',f),'utf8')).prerequisites||{});
function visit(id,route=[]){if(visiting.has(id)){errors.push('DAG cycle: '+[...route,id].join(' -> '));return;}if(visited.has(id))return;visiting.add(id);for(const d of merged[id]||[])visit(d,[...route,id]);visiting.delete(id);visited.add(id);}
Object.keys(audit.prerequisites).forEach(x=>visit(x));
const sourceDir='/Users/sunzy/Downloads/riehl_synthetic_lectures_source/chapters';
for(const name of audit.chapters){
  const source=fs.readFileSync(path.join(sourceDir,name),'utf8');
  for(const m of source.matchAll(/\\begin\{(definition|example|lemma|proposition|theorem|remark|proof)\}/g)){
    const line=source.slice(0,m.index).split('\n').length;
    if(!audit.sourceCoverage.some(c=>c.file===name&&c.sourceLines[0]<=line&&c.sourceLines[1]>=line))errors.push('uncovered '+name+':'+line);
  }
}
audit.validation={fullForestBuild:'Not run: parent responsibility',pages:fs.readdirSync(dir).filter(f=>f.endsWith('.tree')).length,formulas,standaloneDiagrams:diagrams,diagramVisualReview:'05C2 standalone output inspected; all four objects and arrows legible.',crossGroupPrerequisitesVisited:visited.size,prerequisiteDAG:!errors.some(e=>e.includes('DAG cycle')),errors,warnings,semanticLimit:'These checks validate syntax, coverage intervals and graph shape, not mathematical correctness.'};
if(process.argv.includes('--record'))fs.writeFileSync(auditFile,JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit.validation,null,2));
if(errors.length)process.exitCode=1;
