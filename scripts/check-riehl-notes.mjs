import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const groups=['foundations','homotopy','types','categories','directed','calculations','semantics','integration'];
const errors=[];
const manifest=JSON.parse(read('research/riehl-source-manifest.json'));
const archive='research/sources/riehl-synthetic-lectures';
for(const file of manifest.files) {
  const bytes=fs.readFileSync(path.join(root,archive,file.file));
  if(bytes.length!==file.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256) errors.push(`Archived source changed: ${file.file}`);
}
const trees=new Map();
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.tree'))trees.set(path.basename(f,'.tree'),fs.readFileSync(f,'utf8'));}}
walk(path.join(root,'trees'));
const coverage=[];
const reviews=new Set();
for(const group of groups) {
  const file=`research/riehl-${group}.json`;
  if(!fs.existsSync(path.join(root,file))){errors.push(`Missing review ${file}`);continue;}
  const review=JSON.parse(read(file));
  coverage.push(...(review.sourceCoverage??[]));
  for(const id of Object.keys(review.reviews??{}))reviews.add(id);
  for(const item of review.deferred??[])errors.push(`Deferred integration in ${group}: ${JSON.stringify(item)}`);
  for(const item of review.existingAugmentations??[])if(item.status?.includes('required'))errors.push(`Canonical augmentation not integrated in ${group}: ${item.id}`);
}
const chapters=[];
for(const file of manifest.files.filter(f=>f.file.startsWith('chapters/'))) {
  const tex=read(`${archive}/${file.file}`);
  const units=[...tex.matchAll(/\\begin\{(definition|example|lemma|proposition|theorem|remark|proof)\}(?:\[[^\]]*\])?[\s\S]*?\\end\{\1\}/g)];
  let mapped=0;
  const forFile=coverage.filter(c=>path.basename(c.file??'')===path.basename(file.file));
  for(const unit of units) {
    const line=tex.slice(0,unit.index).split('\n').length;
    const end=tex.slice(0,unit.index+unit[0].length).split('\n').length;
    const lines=tex.split('\n');
    const complete=Array.from({length:end-line+1},(_,i)=>line+i).every(n=>{
      if(!lines[n-1].trim()||/^\\(?:begin|end)\{(?:definition|example|lemma|proposition|theorem|remark|proof)\}/.test(lines[n-1].trim()))return true;
      return forFile.some(c=>Array.isArray(c.sourceLines)&&c.sourceLines[0]<=n&&c.sourceLines[1]>=n);
    });
    if(!complete)errors.push(`${file.file}:${line}-${end}: unmapped ${unit[1]}`);
    else mapped++;
  }
  chapters.push({file:path.basename(file.file),formalUnits:units.length,mapped});
}
for(const c of coverage)for(const id of c.ids??[])if(!trees.has(id))errors.push(`Coverage points to absent tree ${id}`);
const newIDs=[...trees.keys()].filter(id=>/^0[2-9][0-9A-Z]{2}$/.test(id));
for(const id of newIDs) {
  const text=trees.get(id);
  if(!reviews.has(id)&&!['0200','020P'].includes(id))errors.push(`Unreviewed lecture page ${id}`);
  if(/\\(?:cite|ref|eqref|label)\{/.test(text))errors.push(`${id}: raw LaTeX cross reference remains`);
  if(text.includes('\\begin{tikzcd}')&&!text.includes('\\tex{'))errors.push(`${id}: diagram not using Sterling resource pipeline`);
}
for(const id of ['0066','001F'])if(!trees.get(id)?.includes('(0200)'))errors.push(`${id}: missing topic entry`);
console.log(JSON.stringify({scope:'User-authored synthetic lectures; source preservation and mapping, not a mathematical proof verifier',archivedFiles:manifest.files.length,newPages:newIDs.length,chapters,formalUnits:chapters.reduce((s,c)=>s+c.formalUnits,0),mappedUnits:chapters.reduce((s,c)=>s+c.mapped,0),errors},null,2));
if(errors.length)process.exitCode=1;
