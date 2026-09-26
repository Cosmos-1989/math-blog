import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const auditPath=path.join(root,'research/riehl-categories.json');
const audit=JSON.parse(fs.readFileSync(auditPath,'utf8'));
const require=createRequire(import.meta.url);
const katex=require('/tmp/forester-math-check/node_modules/katex/dist/katex.js');
const dir=path.join(root,'trees/math/topology/synthetic/categories');
const errors=[],pending=[];
let formulaCount=0,diagramCount=0;
const temp=fs.mkdtempSync('/private/tmp/riehl-categories-');
const diagramFiles=[];
function group(s,opening) {
  let depth=1;
  for(let i=opening+1;i<s.length;i++) {
    if(s[i]==='\\' && /[{}]/.test(s[i+1]??'')){i++;continue;}
    if(s[i]==='{')depth++;
    if(s[i]==='}' && --depth===0)return {body:s.slice(opening+1,i),end:i+1};
  }
  throw Error('Unbalanced braces');
}
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const all=new Map(walk(path.join(root,'trees')).filter(p=>p.endsWith('.tree')).map(p=>[path.basename(p,'.tree'),p]));
const texts={};
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.tree'))) {
  const id=f.slice(0,-5),s=fs.readFileSync(path.join(dir,f),'utf8');texts[id]=s;
  if(/\\!/.test(s))errors.push(`${id}: forbidden negative spacing escape`);
  if(/\\(?:source|section|chapter|cite|ref|label)\{/.test(s))errors.push(`${id}: untranslated source command`);
  if(!/^02/.test(id)&&/原稿|本讲义|前文|后文|整理自|上一章|下一定理/.test(s))errors.push(`${id}: editorial or hierarchical body phrase`);
  for(const m of s.matchAll(/\[[^\]\n]+\]\(([^)]+)\)/g)) {
    if(!all.has(m[1]))(m[1].startsWith('021')?pending:errors).push(`${id}: missing ${m[1]}`);
  }
  for(const dep of audit.prerequisites[id]??[]) {
    if(!s.includes(`](${dep})`))errors.push(`${id}: missing prerequisite link ${dep}`);
    if(all.has(dep)) {
      const target=fs.readFileSync(all.get(dep),'utf8');
      if(/\\taxon\{(?:Outline|Chapter|Example|Remark)\}/.test(target))errors.push(`${id}: prerequisite ${dep} has non-prerequisite taxon`);
    }
  }
  for(let i=0;i<s.length;i++) {
    if(s.startsWith('#{',i)) {
      try {
        const g=group(s,i+1);formulaCount++;
        katex.renderToString(g.body,{throwOnError:true,strict:false});i=g.end-1;
      }catch(e){errors.push(`${id}: math ${e.message}`);break;}
    } else if(s.startsWith('\\tex{',i)) {
      const pre=group(s,i+4);if(s[pre.end]!=='{')throw Error(`${id}: tex missing second arg`);
      const body=group(s,pre.end);diagramCount++;
      const name=`${id}-${diagramCount}`;
      const tex=`\\documentclass{standalone}\n${pre.body}\n\\begin{document}\n${body.body}\n\\end{document}\n`;
      fs.writeFileSync(path.join(temp,name+'.tex'),tex);
      const run=spawnSync('/Library/TeX/texbin/pdflatex',['-interaction=nonstopmode','-halt-on-error',name+'.tex'],{cwd:temp,encoding:'utf8'});
      if(run.status!==0)errors.push(`${id}: diagram compilation failed: ${(run.stdout??'').slice(-2200)}`);
      else diagramFiles.push(path.join(temp,name+'.pdf'));
      i=body.end-1;
    }
  }
}
const active=new Set(),complete=new Set();
const mergedPrerequisites={...audit.prerequisites};
for(const filename of fs.readdirSync(path.join(root,'research')).filter(x=>/^riehl-.*\.json$/.test(x)&&x!=='riehl-categories.json')) {
 const data=JSON.parse(fs.readFileSync(path.join(root,'research',filename),'utf8'));
 for(const [id,deps] of Object.entries(data.prerequisites??{}))if(!mergedPrerequisites[id])mergedPrerequisites[id]=deps;
}
function visit(id,route=[]) {
  if(active.has(id)){errors.push(`DAG cycle: ${[...route,id].join(' -> ')}`);return;}
  if(complete.has(id))return;
  active.add(id);for(const dep of mergedPrerequisites[id]??[])visit(dep,[...route,id]);active.delete(id);complete.add(id);
}
Object.keys(audit.prerequisites).forEach(id=>visit(id));
const missingCoverage=[];
for(const file of audit.assignedChapters) {
 const lines=fs.readFileSync(path.join(audit.sourceRoot,'chapters',file),'utf8').split('\n');
 const covered=new Set();
 for(const c of audit.sourceCoverage.filter(x=>x.file===file))for(let i=c.sourceLines[0];i<=c.sourceLines[1];i++)covered.add(i);
 for(let i=0;i<lines.length;i++)if(lines[i].trim()&&!covered.has(i+1))missingCoverage.push({file,line:i+1,text:lines[i]});
}
if(missingCoverage.length)errors.push(`Unmapped source lines: ${JSON.stringify(missingCoverage)}`);
const result={scope:'categories only; no forest build',pages:Object.keys(texts).length,formulaCount,diagramCount,diagramFiles,sourceLinesFullyMapped:!missingCoverage.length,errors,pendingReferencePages:pending,semanticLimit:'These checks validate syntax, local prerequisite structure, formula rendering, and source line accounting; mathematical review is separately editorial.'};
console.log(JSON.stringify(result,null,2));
if(process.argv.includes('--record')) {
 audit.validation=result;
 if(!audit.changedFiles.includes('scripts/riehl-categories.check.mjs'))audit.changedFiles.push('scripts/riehl-categories.check.mjs');
 fs.writeFileSync(auditPath,JSON.stringify(audit,null,2)+'\n');
}
if(errors.length)process.exitCode=1;
