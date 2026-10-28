import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from './note-prerequisite-lib.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const write=(f,value)=>fs.writeFileSync(path.join(root,f),JSON.stringify(value,null,2)+'\n');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const date='2026-10-28';
const manifest='research/icm2026-plenary-final-reports.json';
const packetFiles=['nesterov','sarnak'].map(name=>`research/plenary-${name}-packet.json`);
const packets=packetFiles.map(read);
const files=new Map();
for(const file of fs.readdirSync(path.join(root,'trees'),{recursive:true}).filter(f=>f.endsWith('.tree'))) {
  const id=path.basename(file,'.tree');
  assert(!files.has(id),`Duplicate ID ${id}`);files.set(id,`trees/${file}`);
}
const textOf=id=>fs.readFileSync(path.join(root,files.get(id)),'utf8');
const taxonOf=id=>textOf(id).match(/\\taxon\{([^}]+)\}/)?.[1];
const plenary=read('research/icm2026-plenary.json');
const allLeading=structuredClone(plenary.subjects);
for(const batch of ['applied-reports','dynamics-probability','ramsey-formalization','geometric-approximation']) {
  for(const [id,topics] of Object.entries(read(`research/icm2026-plenary-${batch}.json`).leading_topics))
    allLeading[id]=[...new Set([...(allLeading[id]??[]),...topics])];
}
const leading={},preserved={};
for(const {report:r} of packets)for(const id of r.subject_ids) {
  allLeading[id]=[...new Set([...(allLeading[id]??[]),r.outline])];leading[id]=allLeading[id];
}
const audit=read('research/site-evergreen-audit.json');
const required=read('research/prerequisite-required-links.json');
const narratives=read('research/topic-narratives.json');
const introductions=read('research/narrative-review-2026-10-13.json');
const priorSnapshots=read('research/icm2026-plenary-snapshots.json');
const bourbaki=read('research/bourbaki-2026-06.json');
const notes=[],prerequisites={};
for(const packet of packets) {
  const r=packet.report;
  for(const field of ['question','reading_scope','proof_scope','claim_sources','source_url','license','subject_ids'])
    assert(r[field],`${r.outline}: missing ${field}`);
  const ids=[...files.keys()].filter(id=>id.startsWith(r.prefix)||id===r.reference).sort();
  assert(ids.includes(r.outline)&&ids.includes(r.reference),`Incomplete ${r.outline}`);
  assert.deepEqual([...Object.keys(packet.prerequisites)].sort(),ids,`${r.outline}: unregistered page`);
  for(const id of ids) {
    const text=textOf(id),taxon=taxonOf(id),title=text.match(/\\title\{([^\n]+)\}/)?.[1];
    assert(title&&taxon,`Incomplete metadata ${id}`);
    if(!['Outline','Reference'].includes(taxon)) {
      assert(r.proof_scope[id]&&r.claim_sources[id]?.length,`Missing proof/source ${id}`);
      for(const source of r.claim_sources[id])assert(source.location&&/^https:\/\//.test(source.url),`Invalid source ${id}`);
    }
    const targets=packet.prerequisites[id],links=new Set(bodyLinks(text).map(x=>x.target));
    assert.equal(new Set(targets).size,targets.length,`Duplicate prerequisite ${id}`);
    for(const target of targets) {
      assert(files.has(target)&&links.has(target),`${id}: missing linked prerequisite ${target}`);
      assert(!['Outline','Reference','Chapter','Person'].includes(taxonOf(target)),`${id}: non-atomic prerequisite ${target}`);
    }
    const sha256=hash(text);notes.push({id,path:files.get(id),title,taxon,sha256});prerequisites[id]=targets;
    audit.reviews[id]={title,action:'Serre 数学与高阶优化全会专题增补',reason:`${title}。具体来源与证明范围见 ${path.basename(manifest)}。`};
    if(!audit.original_ids.includes(id))audit.original_ids.push(id);
    if(['Outline','Reference'].includes(taxon))delete audit.prerequisites[id];else audit.prerequisites[id]=targets;
    required.pages[id]={targets,sha256};
  }
  const narrative={id:r.outline,path:files.get(r.outline),question:r.question,previous_targets:ids.filter(id=>id!==r.outline)};
  const i=narratives.pages.findIndex(p=>p.id===r.outline);
  if(i<0)narratives.pages.push(narrative);else narratives.pages[i]=narrative;
  const intro={...narrative,previous_targets:[],reason:'从数学问题、代表实例和主要结论组织综述。',
    verified_notes:ids.filter(id=>id!==r.outline&&id!==r.reference),source_notes:r.reading_scope,record:manifest,
    title:textOf(r.outline).match(/\\title\{([^\n]+)\}/)[1],taxon:'Outline',sha256:hash(textOf(r.outline)),reviewed_on:date};
  const j=introductions.pages.findIndex(p=>p.id===r.outline);
  if(j<0)introductions.pages.push(intro);else introductions.pages[j]=intro;
}
const active=new Set(),done=new Set();
function visit(id,route=[]) {
  assert(!active.has(id),`Prerequisite cycle ${[...route,id].join(' -> ')}`);if(done.has(id))return;
  active.add(id);for(const target of audit.prerequisites[id]??[])visit(target,[...route,id]);active.delete(id);done.add(id);
}
Object.keys(prerequisites).forEach(id=>visit(id));
for(const [id,topics] of Object.entries(leading)) {
  const listed=listedTopics(textOf(id));assert.deepEqual(listed.slice(0,topics.length),topics,`Leading ${id}`);
  assert.equal(new Set(listed).size,listed.length,`Repeated ${id}`);
  preserved[id]=listed.filter(topic=>!packets.some(p=>p.report.outline===topic));
  required.pages[id].sha256=hash(textOf(id));
  const intro=introductions.pages.find(p=>p.id===id);assert(intro,`Missing landing review ${id}`);
  intro.sha256=hash(textOf(id));intro.reviewed_on=date;
  for(const rows of [bourbaki.notes,priorSnapshots.notes]) {
    const row=rows.find(n=>n.id===id);if(row)row.sha256=hash(textOf(id));
  }
}
if(!introductions.records.includes(manifest))introductions.records.push(manifest);
write(manifest,{date,subject:'0070',scope:'高阶优化与 Serre 数学的特别全会专题；保留报告来源和逐页证明范围。',
  reports:packets.map(p=>p.report),prerequisites,leading_topics:leading,preserved_topics:preserved,
  cross_subject_landings:packets.flatMap(p=>p.report.subject_ids.map(subject=>({subject,outline:p.report.outline}))),
  navigation_checks:[],report_landings:Object.fromEntries(packets.map(p=>[p.report.outline,p.report.subject_ids[0]])),
  review:{packet_files:packetFiles,status:'local-source-integrated',publication:'not-pushed',
    scope:'报告来源、数学背景、局部证明、引用定理和未展开分支分别记录。'}});
write(manifest.replace('.json','-snapshots.json'),{date,notes});
write('research/site-evergreen-audit.json',audit);
write('research/prerequisite-required-links.json',required);
write('research/topic-narratives.json',narratives);
write('research/narrative-review-2026-10-13.json',introductions);
write('research/icm2026-plenary-snapshots.json',priorSnapshots);
write('research/bourbaki-2026-06.json',bourbaki);
for(const row of plenary.special_plenaries) {
  const r=packets.map(p=>p.report).find(r=>r.speaker===row.speaker);
  if(r)Object.assign(row,{status:'selected-branches-integrated-local',outline:r.outline,manifest,
    reason:'特别全会的所选分支已接入对应学科；实际阅读范围和未展开证明见本批清单。'});
  else if(row.speaker==='Alex Kontorovich')Object.assign(row,{status:'selected-branches-published',outline:'4W00',
    manifest:'research/icm2026-plenary-ramsey-formalization.json',
    reason:'特别全会所选分支已发布，发布证据见 research/icm2026-plenary-ramsey-formalization-release.json。'});
}
write('research/icm2026-plenary.json',plenary);
console.log(JSON.stringify({reports:packets.length,notes:notes.length,landings:Object.keys(leading)},null,2));
