import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from './note-prerequisite-lib.mjs';
import {listedTopics} from './subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, data) => fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const date = '2026-10-25';
const manifest = 'research/icm2026-plenary-dynamics-probability.json';
const packetFiles = ['dolgopyat', 'hee-oh', 'quastel'].map(name => `research/plenary-${name}-packet.json`);
const packets = packetFiles.map(read);
const leading = {
  "0069": [
    "4S00",
    "4T00"
  ],
  "006C": [
    "4U00",
    "4S00"
  ],
  "0063": [
    "2400",
    "2900",
    "2500",
    "2300",
    "4S00"
  ],
  "0065": [
    "2C00",
    "2600",
    "4T00"
  ],
  "0067": [
    "2400",
    "4T00"
  ],
  "006A": [
    "2A00",
    "2700",
    "2C00",
    "4U00"
  ],
  "006B": [
    "2B00",
    "4U00"
  ],
  "0072": [
    "4Q00",
    "4U00"
  ]
};
const preserved = {
  "0069": [
    "3000",
    "3100",
    "3200",
    "3300",
    "3400",
    "3500",
    "3600",
    "3700",
    "3800",
    "3900",
    "2D00",
    "2H00",
    "007C",
    "0V00",
    "0P00",
    "007B"
  ],
  "006C": [
    "0N00",
    "0GS0",
    "0079",
    "007B",
    "005C"
  ],
  "0063": [
    "2400",
    "2900",
    "2500",
    "2300",
    "0C00",
    "0C80",
    "0GC0",
    "0G80",
    "0GG0",
    "0H00",
    "0GS0",
    "0H40",
    "0GO0",
    "0GK0",
    "0G00",
    "0G40",
    "007C",
    "007A",
    "007D",
    "0160",
    "01A0"
  ],
  "0065": [
    "2C00",
    "2600",
    "0BL0",
    "2D00",
    "2E00",
    "2M00",
    "2F00",
    "2Q00",
    "2G00",
    "2L00",
    "2P00",
    "2J00",
    "2K00",
    "2H00",
    "2I00",
    "2N00",
    "2R00",
    "0U00",
    "0N00",
    "0GS0",
    "007C",
    "014Z",
    "0056",
    "0040"
  ],
  "0067": [
    "2400",
    "2S00",
    "2T00",
    "2U00",
    "2V00",
    "2W00",
    "2X00",
    "2Y00",
    "2Z00",
    "0181",
    "2D00",
    "01C0",
    "0BJ0",
    "014Z",
    "00AU",
    "007E"
  ],
  "006A": [
    "2A00",
    "2700",
    "2C00",
    "4000",
    "4100",
    "4200",
    "4300",
    "4400",
    "4500",
    "4600",
    "4700",
    "4800",
    "4900",
    "4A00",
    "2G00",
    "1200",
    "2I00"
  ],
  "006B": [
    "2B00",
    "4B00",
    "4C00",
    "4D00",
    "4E00",
    "4F00",
    "4G00",
    "4H00",
    "4I00",
    "4J00",
    "4K00",
    "4L00",
    "4M00",
    "4N00",
    "4O00",
    "4900",
    "0Q00",
    "0006",
    "004U",
    "0040"
  ],
  "0072": [
    "4Q00",
    "005C"
  ]
};
const files = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive:true}).filter(f => f.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  if (files.has(id)) throw new Error(`Duplicate ID ${id}`);
  files.set(id, `trees/${file}`);
}
const textOf = id => fs.readFileSync(path.join(root, files.get(id)), 'utf8');
const taxonOf = id => textOf(id).match(/\\taxon\{([^}]+)\}/)?.[1];
const audit = read('research/site-evergreen-audit.json');
const required = read('research/prerequisite-required-links.json');
const narratives = read('research/topic-narratives.json');
const introductions = read('research/narrative-review-2026-10-13.json');
const bourbaki = read('research/bourbaki-2026-06.json');
const numberTheory = read('research/icm2026-number-theory.json');
const notes = [], prerequisites = {};

for (const packet of packets) {
  const report = packet.report;
  for (const field of ['question','reading_scope','proof_scope','claim_sources','source_url','license','subject_ids'])
    if (!report[field]) throw new Error(`${report.outline}: missing ${field}`);
  const ids = [...files.keys()].filter(id => id.startsWith(report.prefix) || id === report.reference).sort();
  if (!ids.includes(report.outline) || !ids.includes(report.reference)) throw new Error(`Incomplete ${report.prefix}`);
  for (const id of ids) {
    const text = textOf(id), taxon = taxonOf(id), title = text.match(/\\title\{([^\n]+)\}/)?.[1];
    if (!title || !taxon) throw new Error(`Missing metadata ${id}`);
    if (!Object.hasOwn(packet.prerequisites, id)) throw new Error(`Missing prerequisite review ${id}`);
    if (!['Outline','Reference'].includes(taxon)) {
      if (!report.proof_scope[id] || !report.claim_sources[id]?.length) throw new Error(`Missing source/proof scope ${id}`);
      for (const source of report.claim_sources[id]) {
        source.url ??= report.source_url;
        if (!source.location || !/^https:\/\//.test(source.url)) throw new Error(`Invalid claim source ${id}`);
      }
    }
    const targets = packet.prerequisites[id], links = new Set(bodyLinks(text).map(row => row.target));
    if (new Set(targets).size !== targets.length) throw new Error(`Duplicate dependency ${id}`);
    for (const target of targets) {
      if (!files.has(target) || !links.has(target)) throw new Error(`${id}: missing explicit prerequisite ${target}`);
      if (['Outline','Reference','Chapter','Person'].includes(taxonOf(target))) throw new Error(`${id}: non-atomic prerequisite ${target}`);
    }
    const sha256 = hash(text);
    notes.push({id,path:files.get(id),title,taxon,sha256});
    prerequisites[id] = targets;
    audit.reviews[id] = {title,action:'全会报告动力与概率第二批增补',reason:`${title}。来源及证明范围见 ${path.basename(manifest)}。`};
    if (!audit.original_ids.includes(id)) audit.original_ids.push(id);
    if (['Outline','Reference'].includes(taxon)) delete audit.prerequisites[id];
    else audit.prerequisites[id] = targets;
    required.pages[id] = {targets,sha256};
  }
  const narrative = {id:report.outline,path:files.get(report.outline),question:report.question,
    previous_targets:ids.filter(id => id !== report.outline)};
  const i = narratives.pages.findIndex(p => p.id === report.outline);
  if (i < 0) narratives.pages.push(narrative); else narratives.pages[i] = narrative;
  const intro = {...narrative,previous_targets:[],reason:'由数学问题、基本对象、可证明的结论与研究方向组织综述。',
    verified_notes:ids.filter(id => id !== report.outline && id !== report.reference),source_notes:report.reading_scope,
    record:manifest,title:textOf(report.outline).match(/\\title\{([^\n]+)\}/)[1],taxon:'Outline',
    sha256:hash(textOf(report.outline)),reviewed_on:date};
  const j = introductions.pages.findIndex(p => p.id === report.outline);
  if (j < 0) introductions.pages.push(intro); else introductions.pages[j] = intro;
  const actual = Object.entries(leading).filter(([,topics]) => topics.includes(report.outline)).map(([id]) => id).sort();
  if (JSON.stringify(actual) !== JSON.stringify([...report.subject_ids].sort()))
    throw new Error(`${report.outline}: placement differs from packet`);
}
const active = new Set(), done = new Set();
function visit(id, route = []) {
  if (active.has(id)) throw new Error(`Prerequisite cycle: ${[...route,id].join(' -> ')}`);
  if (done.has(id)) return;
  active.add(id);
  for (const target of audit.prerequisites[id] ?? []) visit(target,[...route,id]);
  active.delete(id); done.add(id);
}
Object.keys(prerequisites).forEach(id => visit(id));
for (const [id, topics] of Object.entries(leading)) {
  const listed = listedTopics(textOf(id));
  if (JSON.stringify(listed.slice(0,topics.length)) !== JSON.stringify(topics)) throw new Error(`Leading topics ${id}`);
  for (const topic of [...topics,...preserved[id]])
    if (listed.filter(x => x === topic).length !== 1) throw new Error(`${id}: missing or repeated ${topic}`);
  required.pages[id].sha256 = hash(textOf(id));
  const intro = introductions.pages.find(p => p.id === id);
  if (!intro) throw new Error(`Missing landing review ${id}`);
  intro.sha256 = hash(textOf(id)); intro.reviewed_on = date;
  const earlierLanding = bourbaki.notes.find(note => note.id === id);
  if (earlierLanding) earlierLanding.sha256 = hash(textOf(id));
  const numberTheoryLanding = numberTheory.notes.find(note => note.id === id);
  if (numberTheoryLanding) numberTheoryLanding.sha256 = hash(textOf(id));
}
if (!introductions.records.includes(manifest)) introductions.records.push(manifest);
write(manifest,{date,subject:'0069',scope:'第二批动力系统、齐性几何和概率全会报告；学科归属为编辑分类。',
  reports:packets.map(p => p.report),prerequisites,leading_topics:leading,preserved_topics:preserved,
  cross_subject_landings:Object.entries(leading).flatMap(([subject,topics]) => topics
    .filter(outline => packets.some(packet => packet.report.outline === outline))
    .map(outline => ({subject,outline}))),
  navigation_checks:['4S00','4T00'],report_landings:{'4S00':'0069','4T00':'0065','4U00':'006C'},source_errata:packets.flatMap(p => [...(p.source_errata ?? []),...(p.source_findings ?? [])]),
  review:{packet_files:packetFiles,status:'local-source-integrated',publication:'not-pushed',
    scope:'原子知识点的直接前置关系、局部证明、引用定理与未展开分支分别记录。'}});
write(manifest.replace(/\.json$/,'-snapshots.json'),{date,notes});
write('research/site-evergreen-audit.json',audit);
write('research/prerequisite-required-links.json',required);
write('research/topic-narratives.json',narratives);
write('research/narrative-review-2026-10-13.json',introductions);
write('research/bourbaki-2026-06.json',bourbaki);
write('research/icm2026-number-theory.json',numberTheory);
console.log(JSON.stringify({reports:packets.length,notes:notes.length,landings:Object.keys(leading)},null,2));
