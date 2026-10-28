import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from './note-prerequisite-lib.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const write = (file,value) => fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2)+'\n');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const date = '2026-10-28';
const manifest = 'research/icm2026-plenary-ramsey-formalization.json';
const packetFiles = ['morris','kontorovich'].map(name=>`research/plenary-${name}-packet.json`);
const packets = packetFiles.map(read);
const leading = {'006D':['4V00'],'006E':['4P00','4Q00','4R00','4W00'],
  '0061':['2300','4W00'],'0073':['4W00']};
const preserved = {
  '006D':['0N00','2X00','01C0','01C2','0079','007C','005C','00AU'],
  '006E':['4P00','4Q00','4R00','0079','007C','003A'],
  '0061':['2300','0077','0078','0079','007A','007B','007C','007D','007E','003A','0006'],
  '0073':[],
};
const files = new Map();
for(const file of fs.readdirSync(path.join(root,'trees'),{recursive:true}).filter(f=>f.endsWith('.tree'))) {
  const id=path.basename(file,'.tree');
  if(files.has(id)) throw new Error(`Duplicate ID ${id}`);
  files.set(id,`trees/${file}`);
}
const textOf = id=>fs.readFileSync(path.join(root,files.get(id)),'utf8');
const taxonOf = id=>textOf(id).match(/\\taxon\{([^}]+)\}/)?.[1];
const audit=read('research/site-evergreen-audit.json');
const required=read('research/prerequisite-required-links.json');
const narratives=read('research/topic-narratives.json');
const introductions=read('research/narrative-review-2026-10-13.json');
const bourbaki=read('research/bourbaki-2026-06.json');
const notes=[],prerequisites={};
for(const packet of packets) {
  const report=packet.report;
  for(const field of ['question','reading_scope','proof_scope','claim_sources','source_url','license','subject_ids'])
    if(!report[field]) throw new Error(`${report.outline}: missing ${field}`);
  const ids=[...files.keys()].filter(id=>id.startsWith(report.prefix)||id===report.reference).sort();
  if(!ids.includes(report.outline)||!ids.includes(report.reference)) throw new Error(`Incomplete ${report.prefix}`);
  for(const id of ids) {
    const text=textOf(id),taxon=taxonOf(id),title=text.match(/\\title\{([^\n]+)\}/)?.[1];
    if(!title||!taxon||!Object.hasOwn(packet.prerequisites,id)) throw new Error(`Incomplete review ${id}`);
    if(!['Outline','Reference'].includes(taxon)) {
      if(!report.proof_scope[id]||!report.claim_sources[id]?.length) throw new Error(`Missing source/proof scope ${id}`);
      for(const source of report.claim_sources[id])
        if(!source.location||!/^https:\/\//.test(source.url)) throw new Error(`Invalid claim source ${id}`);
    }
    const targets=packet.prerequisites[id],links=new Set(bodyLinks(text).map(row=>row.target));
    if(new Set(targets).size!==targets.length) throw new Error(`Duplicate prerequisite ${id}`);
    for(const target of targets) {
      if(!files.has(target)||!links.has(target)) throw new Error(`${id}: missing linked prerequisite ${target}`);
      if(['Outline','Reference','Chapter','Person'].includes(taxonOf(target))) throw new Error(`${id}: non-atomic prerequisite ${target}`);
    }
    const sha256=hash(text);
    notes.push({id,path:files.get(id),title,taxon,sha256});
    prerequisites[id]=targets;
    audit.reviews[id]={title,action:'全会报告组合与形式化第三批增补',reason:`${title}。来源及证明范围见 ${path.basename(manifest)}。`};
    if(!audit.original_ids.includes(id)) audit.original_ids.push(id);
    if(['Outline','Reference'].includes(taxon)) delete audit.prerequisites[id];
    else audit.prerequisites[id]=targets;
    required.pages[id]={targets,sha256};
  }
  const narrative={id:report.outline,path:files.get(report.outline),question:report.question,
    previous_targets:ids.filter(id=>id!==report.outline)};
  const i=narratives.pages.findIndex(p=>p.id===report.outline);
  if(i<0) narratives.pages.push(narrative); else narratives.pages[i]=narrative;
  const intro={...narrative,previous_targets:[],reason:'由数学问题、基本对象、可证明的结论与研究方向组织综述。',
    verified_notes:ids.filter(id=>id!==report.outline&&id!==report.reference),source_notes:report.reading_scope,
    record:manifest,title:textOf(report.outline).match(/\\title\{([^\n]+)\}/)[1],taxon:'Outline',
    sha256:hash(textOf(report.outline)),reviewed_on:date};
  const j=introductions.pages.findIndex(p=>p.id===report.outline);
  if(j<0) introductions.pages.push(intro); else introductions.pages[j]=intro;
  const actual=Object.entries(leading).filter(([,topics])=>topics.includes(report.outline)).map(([id])=>id).sort();
  if(JSON.stringify(actual)!==JSON.stringify([...report.subject_ids].sort())) throw new Error(`Placement mismatch ${report.outline}`);
}
const active=new Set(),done=new Set();
function visit(id,route=[]) {
  if(active.has(id)) throw new Error(`Prerequisite cycle ${[...route,id].join(' -> ')}`);
  if(done.has(id)) return;
  active.add(id);
  for(const target of audit.prerequisites[id]??[]) visit(target,[...route,id]);
  active.delete(id);done.add(id);
}
Object.keys(prerequisites).forEach(id=>visit(id));
for(const [id,topics] of Object.entries(leading)) {
  const listed=listedTopics(textOf(id));
  if(JSON.stringify(listed.slice(0,topics.length))!==JSON.stringify(topics)) throw new Error(`Leading topics ${id}`);
  for(const topic of new Set([...topics,...preserved[id]]))
    if(listed.filter(x=>x===topic).length!==1) throw new Error(`${id}: missing or repeated ${topic}`);
  required.pages[id].sha256=hash(textOf(id));
  const intro=introductions.pages.find(p=>p.id===id);
  if(!intro) throw new Error(`Missing landing review ${id}`);
  intro.sha256=hash(textOf(id));intro.reviewed_on=date;
  const earlierLanding=bourbaki.notes.find(row=>row.id===id);
  if(earlierLanding) earlierLanding.sha256=hash(textOf(id));
}
if(!introductions.records.includes(manifest)) introductions.records.push(manifest);
write(manifest,{date,subject:'006D',scope:'第三批组合学与数学形式化全会报告；学科归属为编辑分类。',
  reports:packets.map(p=>p.report),prerequisites,leading_topics:leading,preserved_topics:preserved,
  cross_subject_landings:Object.entries(leading).flatMap(([subject,topics])=>topics
    .filter(outline=>packets.some(p=>p.report.outline===outline)).map(outline=>({subject,outline}))),
  navigation_checks:['4V00'],report_landings:{'4V00':'006D','4W00':'006E'},
  render_text_checks:{'4W00':['0.0043%'],'4W02':['0.0043171%']},
  source_errata:packets.flatMap(p=>[...(p.source_errata??[]),...(p.source_findings??[])]),
  review:{packet_files:packetFiles,status:'local-source-integrated',publication:'not-pushed',
    scope:'本地证明、引用定理和作者展望分别记录，选定分支接入不等于全部研究证明展开。'}});
write(manifest.replace(/\.json$/,'-snapshots.json'),{date,notes});
write('research/site-evergreen-audit.json',audit);
write('research/prerequisite-required-links.json',required);
write('research/topic-narratives.json',narratives);
write('research/narrative-review-2026-10-13.json',introductions);
write('research/bourbaki-2026-06.json',bourbaki);
console.log(JSON.stringify({reports:packets.length,notes:notes.length,landings:Object.keys(leading)},null,2));
