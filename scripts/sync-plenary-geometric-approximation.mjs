import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from './note-prerequisite-lib.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const write=(file,value)=>fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2)+'\n');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const date='2026-10-28';
const manifest='research/icm2026-plenary-geometric-approximation.json';
const packetFiles=['otto','buffa','ziegler'].map(name=>`research/plenary-${name}-packet.json`);
const packets=packetFiles.map(read);
const files=new Map();
for(const file of fs.readdirSync(path.join(root,'trees'),{recursive:true}).filter(f=>f.endsWith('.tree'))) {
  const id=path.basename(file,'.tree');
  if(files.has(id))throw new Error(`Duplicate ID ${id}`);
  files.set(id,`trees/${file}`);
}
const textOf=id=>fs.readFileSync(path.join(root,files.get(id)),'utf8');
const taxonOf=id=>textOf(id).match(/\\taxon\{([^}]+)\}/)?.[1];
const oldPlenary=read('research/icm2026-plenary.json');
const allLeading=structuredClone(oldPlenary.subjects);
for(const file of ['applied-reports','dynamics-probability','ramsey-formalization']) {
  for(const [id,topics] of Object.entries(read(`research/icm2026-plenary-${file}.json`).leading_topics))
    allLeading[id]=[...new Set([...(allLeading[id]??[]),...topics])];
}
const leading={},preserved={};
for(const {report} of packets) for(const id of report.subject_ids) {
  allLeading[id]=[...new Set([...(allLeading[id]??[]),report.outline])];
  leading[id]=allLeading[id];
}
const audit=read('research/site-evergreen-audit.json');
const required=read('research/prerequisite-required-links.json');
const narratives=read('research/topic-narratives.json');
const introductions=read('research/narrative-review-2026-10-13.json');
const oldSnapshots=read('research/icm2026-plenary-snapshots.json');
const bourbaki=read('research/bourbaki-2026-06.json');
const notes=[],prerequisites={};
for(const packet of packets) {
  const r=packet.report;
  for(const field of ['question','reading_scope','proof_scope','claim_sources','source_url','license','subject_ids'])
    if(!r[field])throw new Error(`${r.outline}: missing ${field}`);
  const ids=Object.keys(packet.prerequisites);
  if(!ids.includes(r.outline)||!ids.includes(r.reference))throw new Error(`Incomplete ${r.outline}`);
  for(const id of ids) {
    if(!(id.startsWith(r.prefix)||id===r.reference||r.outline==='2900'&&/^290[0-3]$/.test(id)))
      throw new Error(`Out of scope ${id}`);
    const text=textOf(id),taxon=taxonOf(id),title=text.match(/\\title\{([^\n]+)\}/)?.[1];
    if(!title||!taxon)throw new Error(`Incomplete metadata ${id}`);
    if(!['Outline','Reference'].includes(taxon)) {
      if(!r.proof_scope[id]||!r.claim_sources[id]?.length)throw new Error(`Missing source/proof ${id}`);
      for(const s of r.claim_sources[id])if(!s.location||!/^https:\/\//.test(s.url))throw new Error(`Invalid source ${id}`);
    }
    const targets=packet.prerequisites[id],links=new Set(bodyLinks(text).map(x=>x.target));
    if(new Set(targets).size!==targets.length)throw new Error(`Duplicate prerequisite ${id}`);
    for(const target of targets) {
      if(!files.has(target)||!links.has(target))throw new Error(`${id}: missing linked prerequisite ${target}`);
      if(['Outline','Reference','Chapter','Person'].includes(taxonOf(target)))throw new Error(`${id}: non-atomic prerequisite ${target}`);
    }
    const sha256=hash(text);
    const row={id,path:files.get(id),title,taxon,sha256};notes.push(row);prerequisites[id]=targets;
    audit.reviews[id]={title,action:'几何型方程、数值逼近与算术配置专题增补',reason:`${title}。来源与证明范围见 ${path.basename(manifest)}。`};
    if(!audit.original_ids.includes(id))audit.original_ids.push(id);
    if(['Outline','Reference'].includes(taxon))delete audit.prerequisites[id];
    else audit.prerequisites[id]=targets;
    required.pages[id]={targets,sha256};
    // Retain the original outline IDs and update only their current source snapshots.
    const old=oldSnapshots.notes.find(n=>n.id===id);
    if(old) {
      Object.assign(old,row);
      oldPlenary.prerequisites[id]=targets;
    }
  }
  const narrative={id:r.outline,path:files.get(r.outline),question:r.question,
    previous_targets:ids.filter(id=>id!==r.outline)};
  const ni=narratives.pages.findIndex(p=>p.id===r.outline);
  if(ni<0)narratives.pages.push(narrative);else narratives.pages[ni]=narrative;
  const intro={...narrative,previous_targets:[],reason:'以问题、实例、主要构造和结论组织综述。',
    verified_notes:ids.filter(id=>id!==r.outline&&id!==r.reference),source_notes:r.reading_scope,
    record:manifest,title:textOf(r.outline).match(/\\title\{([^\n]+)\}/)[1],taxon:'Outline',
    sha256:hash(textOf(r.outline)),reviewed_on:date};
  const ii=introductions.pages.findIndex(p=>p.id===r.outline);
  if(ii<0)introductions.pages.push(intro);else introductions.pages[ii]=intro;
}
const active=new Set(),done=new Set();
function visit(id,route=[]) {
  if(active.has(id))throw new Error(`Prerequisite cycle ${[...route,id].join(' -> ')}`);
  if(done.has(id))return;active.add(id);
  for(const target of audit.prerequisites[id]??[])visit(target,[...route,id]);
  active.delete(id);done.add(id);
}
Object.keys(prerequisites).forEach(id=>visit(id));
for(const [id,topics] of Object.entries(leading)) {
  const listed=listedTopics(textOf(id));
  if(JSON.stringify(listed.slice(0,topics.length))!==JSON.stringify(topics))throw new Error(`Leading topics ${id}`);
  if(new Set(listed).size!==listed.length)throw new Error(`Repeated topic ${id}`);
  preserved[id]=listed.filter(topic=>!packets.some(p=>p.report.outline===topic));
  required.pages[id].sha256=hash(textOf(id));
  const intro=introductions.pages.find(p=>p.id===id);
  if(!intro)throw new Error(`Missing landing review ${id}`);
  intro.sha256=hash(textOf(id));intro.reviewed_on=date;
  for(const rows of [bourbaki.notes,oldSnapshots.notes]) {
    const row=rows.find(n=>n.id===id);if(row)row.sha256=hash(textOf(id));
  }
}
if(!introductions.records.includes(manifest))introductions.records.push(manifest);
for(const [slug,subject,section] of [['pde','006A',10],['dynamics','0069',9]]) {
  const file=`research/icm2026-${slug}-section-coverage.json`,coverage=read(file);
  for(const {report:r} of packets.filter(p=>p.report.subject_ids.includes(subject))) {
    const row={outline:r.outline,speaker:r.speaker,speakers:[r.speaker],title:r.title,doi:r.doi??null,
      reference:r.reference,source_url:r.source_url,version_url:r.version_url,category:'Plenary Lectures',
      on_subject_landing:true,order:leading[subject].indexOf(r.outline)+1,counts_as_section_report:false,
      section_excluded_from_count:section,decision_status:'selected-branches-integrated-local',
      decided_on:date,manifest,coverage_scope:r.coverage_status??r.integration_status};
    const index=coverage.editorial_leading_topics.findIndex(x=>x.outline===r.outline);
    if(index<0)coverage.editorial_leading_topics.push(row);else coverage.editorial_leading_topics[index]=row;
  }
  coverage.editorial_leading_topics.sort((a,b)=>a.order-b.order);
  assertOrder(coverage.editorial_leading_topics.map(x=>x.outline),leading[subject],subject);
  if(coverage.sync_compatibility)coverage.sync_compatibility.editorial_leading_topics=`Current editorial plenary order: ${leading[subject].join(', ')}. Excluded from official sectional counts.`;
  write(file,coverage);
}
function assertOrder(actual,expected,subject) {
  if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error(`Coverage order ${subject}`);
}
write(manifest,{date,subject:'006A',scope:'Otto、Buffa 与 Ziegler 专题增补；报告身份与实际核读材料分别登记。',
  reports:packets.map(p=>p.report),prerequisites,leading_topics:leading,preserved_topics:preserved,
  cross_subject_landings:packets.flatMap(p=>p.report.subject_ids.map(subject=>({subject,outline:p.report.outline}))),
  navigation_checks:[],report_landings:Object.fromEntries(packets.map(p=>[p.report.outline,p.report.subject_ids[0]])),
  review:{packet_files:packetFiles,status:'local-source-integrated',publication:'not-pushed',
    scope:'核读范围、背景材料、局部证明、引用定理和待展开分支逐篇记录。'}});
write(manifest.replace('.json','-snapshots.json'),{date,notes});
write('research/site-evergreen-audit.json',audit);
write('research/prerequisite-required-links.json',required);
write('research/topic-narratives.json',narratives);
write('research/narrative-review-2026-10-13.json',introductions);
write('research/icm2026-plenary.json',oldPlenary);
write('research/icm2026-plenary-snapshots.json',oldSnapshots);
write('research/bourbaki-2026-06.json',bourbaki);
console.log(JSON.stringify({reports:packets.length,notes:notes.length,landings:Object.keys(leading)},null,2));
