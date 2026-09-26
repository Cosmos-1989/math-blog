import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'trees/math/topology/synthetic/directed');
const audit = JSON.parse(fs.readFileSync(path.join(root, 'research/riehl-directed.json'), 'utf8'));
const require = createRequire(import.meta.url);
const katex = require('/tmp/forester-math-check/node_modules/katex/dist/katex.js');
const errors = [], pendingLinks = [];
let formulas = 0, diagrams = 0;
const allIds = new Set();
function walk(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir,e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.tree')) allIds.add(e.name.slice(0,-5));
  }
}
walk(path.join(root,'trees'));
// Braces escaped for mathematical set notation do not delimit Forester groups.
function braced(s,start) {
  let depth=1;
  for(let i=start+1;i<s.length;i++) {
    if(s[i]==='\\' && ['{','}','\\'].includes(s[i+1])) { i++; continue; }
    if(s[i]==='{') depth++;
    if(s[i]==='}' && --depth===0) return [s.slice(start+1,i),i+1];
  }
  throw new Error('Unclosed group at '+start);
}
const work=fs.mkdtempSync(path.join(os.tmpdir(),'riehl-directed-'));
for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.tree')).sort()) {
  const id=name.slice(0,-5), s=fs.readFileSync(path.join(dir,name),'utf8');
  const links=[...s.matchAll(/\[[^\]\n]+\]\(([0-9A-Z]{4})\)/g)].map(m=>m[1]);
  for(const t of links) if(!allIds.has(t)) {
    if(/^021[0-9A-J]$/.test(t)) pendingLinks.push({id,target:t});
    else errors.push(`${id}: missing ${t}`);
  }
  if(/\\!|\\(?:ref|label|cite)\{|\\begin\{(?:proof|theorem|definition)/.test(s)) errors.push(`${id}: unconverted source syntax`);
  if(!s.includes('\\date{2026-09-25}') || !s.includes('\\author{author}')) errors.push(`${id}: metadata`);
  for(const d of audit.prerequisites[id]??[]) if(!links.includes(d)) errors.push(`${id}: prerequisite ${d} not linked`);
  const math=/#\{/g;
  let m;
  while((m=math.exec(s))) {
    const [tex,end]=braced(s,m.index+1);
    if(/\[[^\]\n]+\]\(/.test(tex)) errors.push(`${id}: Markdown-link-like bracket pattern inside TeX`);
    try { katex.renderToString(tex,{throwOnError:true,strict:false,displayMode:s[m.index-1]==='#'}); formulas++; }
    catch(e) { errors.push(`${id}: ${e.message}`); }
    math.lastIndex=end;
  }
  const figs=/\\figure\{\\tex/g;
  while((m=figs.exec(s))) {
    const [pre,p]=braced(s,m.index+m[0].length);
    const [body,end]=braced(s,p);
    const basename=`${id}-${++diagrams}`;
    const tex='\\documentclass[border=4pt]{standalone}\n'+pre+'\n\\begin{document}\n'+body+'\n\\end{document}\n';
    fs.writeFileSync(path.join(work,basename+'.tex'),tex);
    try {
      execFileSync('/Library/TeX/texbin/latex',['-interaction=nonstopmode','-halt-on-error',basename+'.tex'],{cwd:work,stdio:'pipe'});
      execFileSync('/Library/TeX/texbin/dvisvgm',['--no-fonts','-o',basename+'.svg',basename+'.dvi'],{cwd:work,stdio:'pipe'});
    } catch(e) { errors.push(`${id}: diagram ${basename}: ${e.stdout?.toString().slice(-3000) ?? ''} ${e.stderr?.toString().slice(-1000) ?? e.message}`); }
    figs.lastIndex=end;
  }
}
const active=new Set(),done=new Set();
const mergedPrerequisites={};
for(const name of fs.readdirSync(path.join(root,'research')).filter(n=>/^riehl-.*\.json$/.test(n))) {
  const a=JSON.parse(fs.readFileSync(path.join(root,'research',name),'utf8'));
  Object.assign(mergedPrerequisites,a.prerequisites??{});
}
function dfs(id) {
  if(active.has(id)) { errors.push('Prerequisite cycle: '+[...active,id].join(' -> ')); return; }
  if(done.has(id)) return;
  active.add(id);
  for(const dep of mergedPrerequisites[id]??[]) dfs(dep);
  active.delete(id); done.add(id);
}
for(const id of Object.keys(audit.prerequisites)) dfs(id);
for(const [file,chapter] of [['20_directed.tex','020K'],['21_structures.tex','020L']]) {
  const lines=fs.readFileSync(path.join(audit.sourceRoot,file),'utf8').split('\n');
  const covered=new Set();
  for(const c of audit.sourceCoverage.filter(c=>c.file===file))
    for(let i=c.sourceLines[0];i<=c.sourceLines[1];i++) covered.add(i);
  for(let i=0;i<lines.length;i++) if(lines[i].trim() && !/^\\(?:chapter|section)\{/.test(lines[i]) && !covered.has(i+1))
    errors.push(`${file}:${i+1}: mathematical/prose source line not mapped: ${lines[i]}`);
}
const report={files:fs.readdirSync(dir).filter(n=>n.endsWith('.tree')).length,formulas,diagrams,diagramOutput:work,reachablePrerequisiteNodes:done.size,pendingLinks,errors};
audit.validation={...report,status:errors.length?'failed':'passed-local-checks',fullForestBuild:'not-run-by-instruction',checks:['KaTeX throws on all formulas','Standalone LaTeX and dvisvgm on every figure','Source mathematical and prose line coverage','All local links exist','Necessary prerequisites linked','Merged prerequisite DAG reachable from directed notes is acyclic'],semanticReviewNotInferredFromTests:true};
fs.writeFileSync(path.join(root,'research/riehl-directed.json'),JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(errors.length) process.exitCode=1;
