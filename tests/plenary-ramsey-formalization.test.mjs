import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const files=new Map();
for(const file of fs.readdirSync(path.join(root,'trees'),{recursive:true}).filter(f=>f.endsWith('.tree'))) {
  const id=path.basename(file,'.tree');
  assert(!files.has(id),`Duplicate ID ${id}`);files.set(id,`trees/${file}`);
}
const note=id=>read(files.get(id));
const record=json('research/icm2026-plenary-ramsey-formalization.json');
const snapshots=json('research/icm2026-plenary-ramsey-formalization-snapshots.json');

test('Ramsey and formalization reports retain their identities and ordinary/special distinction',()=>{
  assert.deepEqual(record.reports.map(r=>r.outline),['4V00','4W00']);
  assert.deepEqual(record.reports.map(r=>r.doi),['10.1137/25M1833369','10.1137/25M1806764']);
  const plan=json('research/icm2026-plenary-batch-plan.json');
  for(const [index,report] of record.reports.entries()) {
    const row=plan.reports.find(r=>r.planned_outline===report.outline);
    assert.equal(row.kind,index===0?'ordinary':'special');
    assert.equal(row.title,report.title);
    assert.equal(row.status,'selected-branches-integrated-local');
    assert.deepEqual([...row.subject_ids].sort(),[...report.subject_ids].sort());
    assert(note(report.reference).includes(report.doi));
    const placed=record.cross_subject_landings.filter(r=>r.outline===report.outline).map(r=>r.subject).sort();
    assert.deepEqual(placed,[...report.subject_ids].sort());
  }
  assert.deepEqual(record.reports[0].subject_ids,['006D']);
  assert(!record.reports[1].subject_ids.includes('0063'));
});

test('new topics precede sectional topics and preserve previous subject navigation',()=>{
  for(const [subject,leading] of Object.entries(record.leading_topics)) {
    const topics=listedTopics(note(subject));
    assert.deepEqual(topics.slice(0,leading.length),leading,subject);
    for(const id of new Set([...leading,...record.preserved_topics[subject]]))
      assert.equal(topics.filter(x=>x===id).length,1,`${subject}/${id}`);
  }
  assert(!note('0073').includes('暂未收录独立专题'));
});

test('small probability percentages remain text outside Forester math',()=>{
  for(const [id,value] of [['4W00','0.0043'],['4W02','0.0043171']]) {
    assert(note(id).includes(`#{${value}}\\%`),id);
    assert.deepEqual(record.render_text_checks[id],[`${value}%`]);
  }
});

test('new atomic notes have unique titles, source locations, proof scope and explicit acyclic prerequisites',()=>{
  const audit=json('research/site-evergreen-audit.json');
  const required=json('research/prerequisite-required-links.json');
  const titles=new Map();
  for(const id of files.keys()) {
    const title=note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if(!titles.has(title)) titles.set(title,[]);titles.get(title).push(id);
  }
  for(const report of record.reports) {
    for(const field of ['reading_scope','proof_scope','claim_sources','version_url','license','remaining_branches','unexpanded_deep_proofs'])
      assert(report[field],`${report.outline}: ${field}`);
    assert(note(report.outline).split('\n').filter(l=>l.startsWith('\\p{')).length>=5);
    const reached=new Set(),pending=[report.outline];
    while(pending.length) {
      const id=pending.pop();if(!files.has(id)||reached.has(id)) continue;reached.add(id);
      pending.push(...Array.from(note(id).matchAll(/\]\(([^)]+)\)|\\transclude\{([^}]+)\}/g),m=>m[1]??m[2]));
    }
    const branch=snapshots.notes.filter(row=>row.id.startsWith(report.prefix)||row.id===report.reference);
    for(const row of branch) {
      assert(reached.has(row.id),`Unreachable ${row.id}`);
      assert.equal(hash(note(row.id)),row.sha256,row.id);
      assert.equal(row.sha256,required.pages[row.id].sha256,row.id);
      if(!['Outline','Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title),[row.id],`Duplicate title ${row.title}`);
        assert(report.proof_scope[row.id]&&report.claim_sources[row.id]?.length,row.id);
        for(const source of report.claim_sources[row.id]) assert(source.url&&source.location,row.id);
        assert.deepEqual(audit.prerequisites[row.id],record.prerequisites[row.id],row.id);
      }
      const linked=new Set(bodyLinks(note(row.id)).map(l=>l.target));
      for(const target of record.prerequisites[row.id]) {
        assert(files.has(target)&&linked.has(target),`${row.id}: ${target}`);
        assert(!/\\taxon\{(?:Outline|Chapter|Reference|Person)\}/.test(note(target)),target);
      }
    }
    for(const id of files.keys()) if(id.startsWith(report.prefix)) assert(branch.some(row=>row.id===id),id);
  }
  const active=new Set(),done=new Set();
  function visit(id,route=[]) {
    assert(!active.has(id),`Cycle ${[...route,id].join(' -> ')}`);if(done.has(id)) return;
    active.add(id);for(const target of audit.prerequisites[id]??[]) visit(target,[...route,id]);
    active.delete(id);done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id=>visit(id));
});
