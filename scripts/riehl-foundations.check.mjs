import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';

const root = '/Users/sunzy/claude_test/forester2';
const own = path.join(root,'trees/math/topology/synthetic/foundations');
const auditFile = path.join(root,'research/riehl-foundations.json');
const audit = JSON.parse(fs.readFileSync(auditFile,'utf8'));
const katexPath = '/tmp/forester-math-check/node_modules/katex/dist/katex.js';
const katex = createRequire(import.meta.url)(katexPath);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(),'riehl-foundations-qa-'));
const errors = [], missingLinks = [], missingPrerequisiteLinks = [], diagrams = [];
let formulas=0;
const treePaths = new Map();
function inventory(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const p = path.join(dir,entry.name);
    if (entry.isDirectory()) inventory(p);
    else if (entry.name.endsWith('.tree')) treePaths.set(entry.name.slice(0,-5),p);
  }
}
inventory(path.join(root,'trees'));
function escaped(text,i) {
  let n=0;while(i>0 && text[--i]==='\\')n++;
  return n%2===1;
}
function balanced(text,start) {
  if(text[start]!=='{')throw Error('Expected argument at '+start);
  let depth=1;
  for(let i=start+1;i<text.length;i++) {
    if(escaped(text,i))continue;
    if(text[i]==='{')depth++;
    if(text[i]==='}' && --depth===0)return {body:text.slice(start+1,i),end:i+1};
  }
  throw Error('Unclosed brace at '+start);
}
for(const file of fs.readdirSync(own).filter(f=>f.endsWith('.tree'))) {
  const id=file.slice(0,-5), text=fs.readFileSync(path.join(own,file),'utf8');
  if(/\\!/.test(text))errors.push(id+': forbidden spacing');
  if(/\$/.test(text))errors.push(id+': unconverted dollar');
  if(/\\(?:id|Hom|Nat|Ob|Set|Top|limm|colim|ev|op|N|R)(?![A-Za-z])/.test(text))errors.push(id+': unexpanded custom macro');
  if(!text.includes('\\date{2026-09-25}')||!text.includes('\\author{author}')||!text.includes('\\meta{source}{[系统讲义](0210)'))errors.push(id+': metadata');
  if(!/^\\taxon\{Outline\}/m.test(text)&&/原稿|本讲义|前文|后文|上述|上一条|整理自/.test(text))errors.push(id+': editorial hierarchy');
  const links=[...text.matchAll(/\]\(([0-9A-Z]{4})\)/g)].map(m=>m[1]);
  for(const target of links)if(!treePaths.has(target))missingLinks.push({id,target});
  for(const target of audit.prerequisites[id]??[])if(!links.includes(target))missingPrerequisiteLinks.push({id,target});
  const math = /#{1,2}\{/g;
  let m;
  while((m=math.exec(text))) {
    try {
      const part=balanced(text,m.index+m[0].length-1);
      katex.renderToString(part.body,{displayMode:m[0].startsWith('##'),throwOnError:true,strict:'ignore'});
      formulas++;math.lastIndex=part.end;
    } catch(e) {errors.push(id+': '+e.message);break;}
  }
  const figure = /\\tex\{/g;
  while((m=figure.exec(text))) {
    const pre=balanced(text,m.index+4);
    const body=balanced(text,pre.end);
    const name=id+'-'+diagrams.length;
    const tex='\\documentclass[tikz,border=2pt]{standalone}\n'+pre.body+'\n\\begin{document}\n'+body.body+'\n\\end{document}\n';
    fs.writeFileSync(path.join(tmp,name+'.tex'),tex);
    const result=spawnSync('/Library/TeX/texbin/pdflatex',['-interaction=nonstopmode','-halt-on-error','-output-directory',tmp,path.join(tmp,name+'.tex')],{encoding:'utf8',timeout:60000});
    diagrams.push({id,status:result.status===0?'compiled-standalone':'failed',pdf:path.join(tmp,name+'.pdf')});
    if(result.status!==0)errors.push(id+': diagram compile failed '+(result.stdout??'').slice(-2000));
    figure.lastIndex=body.end;
  }
}
const graph={};
for(const file of fs.readdirSync(path.join(root,'research')).filter(f=>/^riehl-.*\.json$/.test(f))) {
  const other=JSON.parse(fs.readFileSync(path.join(root,'research',file),'utf8'));
  Object.assign(graph,other.prerequisites??{});
}
Object.assign(graph,audit.prerequisites);
const visiting=new Set(), visited=new Set(), cycles=[];
function visit(id,trail=[]) {
  if(visiting.has(id)){cycles.push([...trail,id]);return;}
  if(visited.has(id))return;
  visiting.add(id);
  for(const child of graph[id]??[])visit(child,[...trail,id]);
  visiting.delete(id);visited.add(id);
}
for(const id of Object.keys(audit.prerequisites))visit(id);
const validation={
  date:'2026-09-25',status:errors.length||cycles.length||missingPrerequisiteLinks.length?'needs-correction':'passed-targeted-checks',
  files:fs.readdirSync(own).filter(f=>f.endsWith('.tree')).length,formulas,katexPath,
  diagrams,errors,missingLinks,missingPrerequisiteLinks,cycles,fullBuild:'parent-owned; not run',
  scope:'本组 KaTeX、独立 LaTeX 图、元数据、源宏与间距约束、链接存在性、已可用各组前置图；数学语义由编辑逐页判断，不由此脚本推断。',
};
audit.validation=validation;
audit.status=validation.status==='passed-targeted-checks'?'complete-with-parent-canonical-additions-tracked':'written-pending-targeted-validation';
fs.writeFileSync(auditFile,JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(validation,null,2));
if(errors.length||cycles.length||missingPrerequisiteLinks.length)process.exitCode=1;
