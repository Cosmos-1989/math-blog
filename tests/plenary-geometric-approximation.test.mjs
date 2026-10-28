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
for(const f of fs.readdirSync(path.join(root,'trees'),{recursive:true}).filter(f=>f.endsWith('.tree'))) {
  const id=path.basename(f,'.tree');assert(!files.has(id),`Duplicate ${id}`);files.set(id,`trees/${f}`);
}
const note=id=>read(files.get(id));
const record=json('research/icm2026-plenary-geometric-approximation.json');
const snapshots=json('research/icm2026-plenary-geometric-approximation-snapshots.json');

test('fourth batch preserves speaker identity, source roles and the existing Ziegler address',()=>{
  assert.deepEqual(record.reports.map(r=>r.speaker),['Felix Otto','Annalisa Buffa','Tamar Ziegler']);
  assert.deepEqual(record.reports.map(r=>r.outline),['4X00','4Y00','2900']);
  assert(!files.has('4Z00'),'Ziegler must not acquire a duplicate outline');
  for(const r of record.reports) {
    for(const key of ['reading_scope','source_url','source_url_role','license','proof_scope','claim_sources','remaining_branches','unexpanded_deep_proofs'])
      assert(r[key],`${r.outline}: ${key}`);
    assert(note(r.reference).includes(r.source_url),`${r.reference}: identity source`);
    assert(!r.doi&&!r.pages,`${r.outline}: no verified proceedings chapter`);
    const plan=json('research/icm2026-plenary-batch-plan.json').reports.find(p=>p.speaker===r.speaker);
    assert.equal(plan.planned_outline,r.outline);
    assert.deepEqual([...plan.existing_subject_ids].sort(),[...r.subject_ids].sort());
  }
});

test('subject navigation preserves older topics and shares rather than duplicates the new surveys',()=>{
  for(const [id,leading] of Object.entries(record.leading_topics)) {
    const listed=listedTopics(note(id));
    assert.deepEqual(listed.slice(0,leading.length),leading,id);
    for(const topic of new Set([...leading,...record.preserved_topics[id]]))
      assert.equal(listed.filter(t=>t===topic).length,1,`${id}/${topic}`);
  }
  for(const r of record.reports) {
    const placed=record.cross_subject_landings.filter(x=>x.outline===r.outline).map(x=>x.subject);
    assert.deepEqual(placed.sort(),[...r.subject_ids].sort());
    assert(note(r.outline).split('\n').filter(l=>l.startsWith('\\p{')).length>=5);
  }
  for(const [slug,subject] of [['pde','006A'],['dynamics','0069']]) {
    const coverage=json(`research/icm2026-${slug}-section-coverage.json`);
    assert.deepEqual(coverage.editorial_leading_topics.map(r=>r.outline),record.leading_topics[subject]);
    for(const row of coverage.editorial_leading_topics.filter(r=>['4X00','4Y00','2900'].includes(r.outline)))
      assert.equal(row.counts_as_section_report,false);
  }
});

test('every owned atom is reachable, sourced, mathematically scoped and explicitly linked to its prerequisites',()=>{
  const audit=json('research/site-evergreen-audit.json');
  const required=json('research/prerequisite-required-links.json');
  const titles=new Map();
  for(const id of files.keys()) {
    const title=note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if(!titles.has(title))titles.set(title,[]);titles.get(title).push(id);
  }
  for(const r of record.reports) {
    const reached=new Set(),pending=[r.outline];
    while(pending.length) {
      const id=pending.pop();if(!files.has(id)||reached.has(id))continue;reached.add(id);
      pending.push(...bodyLinks(note(id)).map(x=>x.target));
    }
    const owned=snapshots.notes.filter(n=>n.id.startsWith(r.prefix)||n.id===r.reference||r.outline==='2900'&&/^290[0-3]$/.test(n.id));
    for(const row of owned) {
      if(row.taxon==='Reference') {
        assert([...reached].some(id=>note(id).includes(`](${row.id})`)),`Unlinked reference ${row.id}`);
      } else assert(reached.has(row.id),`Unreachable ${row.id}`);
      assert.equal(hash(note(row.id)),row.sha256,row.id);
      assert.equal(row.sha256,required.pages[row.id].sha256,row.id);
      assert(!/(?<!\\)%/.test(note(row.id)),`${row.id}: unescaped percent can comment out a Forester group`);
      if(!['Outline','Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title),[row.id],row.title);
        assert(r.proof_scope[row.id]&&r.claim_sources[row.id]?.length,row.id);
        assert.deepEqual(audit.prerequisites[row.id],record.prerequisites[row.id],row.id);
      }
      const linked=new Set(bodyLinks(note(row.id)).map(x=>x.target));
      for(const target of record.prerequisites[row.id]) {
        assert(files.has(target)&&linked.has(target),`${row.id}: ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)),target);
      }
    }
    for(const id of files.keys())if(id.startsWith(r.prefix))assert(owned.some(n=>n.id===id),`Unregistered ${id}`);
  }
});

test('dependencies remain acyclic through reused undergraduate foundations',()=>{
  const graph=json('research/site-evergreen-audit.json').prerequisites;
  const active=new Set(),done=new Set();
  function visit(id,route=[]) {
    assert(!active.has(id),`Cycle ${[...route,id].join(' -> ')}`);if(done.has(id))return;
    active.add(id);for(const target of graph[id]??[])visit(target,[...route,id]);active.delete(id);done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id=>visit(id));
});
