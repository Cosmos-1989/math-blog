import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const files=new Map();
for(const file of fs.readdirSync(path.join(root,'trees'),{recursive:true}).filter(f=>f.endsWith('.tree'))) {
  const id=path.basename(file,'.tree');assert(!files.has(id),`Duplicate ID ${id}`);files.set(id,`trees/${file}`);
}
const note=id=>read(files.get(id));
const manifest=json('research/icm2026-plenary-final-reports.json');
const snapshots=json('research/icm2026-plenary-final-reports-snapshots.json');
const plan=json('research/icm2026-plenary-batch-plan.json');

test('both dedicated mathematical test files are present in the release',()=>{
  for(const name of ['nesterov','sarnak'])
    assert(fs.existsSync(path.join(root,`tests/plenary-${name}-math.test.mjs`)),`${name}: missing test file`);
});

test('the final batch retains the special-lecture identities and one outline per speaker',()=>{
  assert.deepEqual(manifest.reports.map(r=>r.speaker),['Yurii Nesterov','Peter Sarnak']);
  assert.deepEqual(manifest.reports.map(r=>r.outline),['5000','5100']);
  assert.equal(plan.reports.length,22);
  assert.equal(new Set(plan.reports.map(r=>r.speaker)).size,22);
  assert.equal(plan.reports.filter(r=>r.kind==='ordinary').length,19);
  assert.equal(plan.reports.filter(r=>r.kind==='special').length,3);
  assert.equal(new Set(plan.reports.map(r=>r.planned_outline)).size,22);
  for(const row of plan.reports)assert(row.planned_outline&&files.has(row.planned_outline),row.speaker);
  for(const r of manifest.reports) {
    const row=plan.reports.find(p=>p.speaker===r.speaker);
    assert.equal(row.planned_outline,r.outline);
    assert.equal(row.batch,5);
    assert.equal(row.kind,'special');
    assert.equal(row.official_category,'Special Plenary Lectures');
    assert.deepEqual([...row.existing_subject_ids].sort(),[...r.subject_ids].sort());
    for(const key of ['reading_scope','source_url','license','proof_scope','claim_sources','remaining_branches','unexpanded_deep_proofs'])
      assert(r[key],`${r.outline}: ${key}`);
    assert(note(r.reference).includes(r.source_url),`${r.reference}: source link`);
  }
});

test('new topics are directly linked ahead of sectional topics without duplicating the earlier ones',()=>{
  for(const [id,leading] of Object.entries(manifest.leading_topics)) {
    const listed=listedTopics(note(id));assert.deepEqual(listed.slice(0,leading.length),leading,id);
    for(const topic of new Set([...leading,...manifest.preserved_topics[id]]))
      assert.equal(listed.filter(t=>t===topic).length,1,`${id}/${topic}`);
  }
  for(const r of manifest.reports) {
    assert.deepEqual(manifest.cross_subject_landings.filter(x=>x.outline===r.outline).map(x=>x.subject).sort(),[...r.subject_ids].sort());
    assert(note(r.outline).split('\n').filter(l=>l.startsWith('\\p{')).length>=5,r.outline);
  }
});

test('new atoms have unique titles, precise proof scopes and real prerequisite links',()=>{
  const audit=json('research/site-evergreen-audit.json');
  const required=json('research/prerequisite-required-links.json');
  const titles=new Map();
  for(const id of files.keys()) {
    const title=note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if(!titles.has(title))titles.set(title,[]);titles.get(title).push(id);
  }
  for(const r of manifest.reports) {
    const reached=new Set(),pending=[r.outline];
    while(pending.length) {
      const id=pending.pop();if(!files.has(id)||reached.has(id))continue;
      reached.add(id);pending.push(...bodyLinks(note(id)).map(x=>x.target));
    }
    const owned=snapshots.notes.filter(n=>n.id.startsWith(r.prefix)||n.id===r.reference);
    for(const row of owned) {
      if(row.taxon==='Reference')assert([...reached].some(id=>note(id).includes(`](${row.id})`)),row.id);
      else assert(reached.has(row.id),`Unreachable ${row.id}`);
      assert.equal(hash(note(row.id)),row.sha256,row.id);
      assert.equal(row.sha256,required.pages[row.id].sha256,row.id);
      assert(!/(?<!\\)%/.test(note(row.id)),`${row.id}: unescaped percent`);
      if(!['Outline','Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title),[row.id],row.title);
        assert(r.proof_scope[row.id]&&r.claim_sources[row.id]?.length,row.id);
        assert.deepEqual(audit.prerequisites[row.id],manifest.prerequisites[row.id],row.id);
      }
      const linked=new Set(bodyLinks(note(row.id)).map(x=>x.target));
      for(const target of manifest.prerequisites[row.id]) {
        assert(files.has(target)&&linked.has(target),`${row.id}: ${target}`);
        assert(!/\\taxon\{(?:Outline|Reference|Chapter|Person)\}/.test(note(target)),target);
      }
    }
    for(const id of files.keys())if(id.startsWith(r.prefix))assert(owned.some(n=>n.id===id),`Unregistered ${id}`);
  }
});

test('prerequisite dependencies are acyclic through the reused foundations',()=>{
  const graph=json('research/site-evergreen-audit.json').prerequisites;
  const active=new Set(),done=new Set();
  function visit(id,route=[]) {
    assert(!active.has(id),`Cycle ${[...route,id].join(' -> ')}`);if(done.has(id))return;
    active.add(id);for(const target of graph[id]??[])visit(target,[...route,id]);active.delete(id);done.add(id);
  }
  Object.keys(manifest.prerequisites).forEach(id=>visit(id));
});
