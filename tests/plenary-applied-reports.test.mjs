import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const json = file => JSON.parse(read(file));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const files = new Map();
for (const file of fs.readdirSync(path.join(root,'trees'),{recursive:true}).filter(f => f.endsWith('.tree'))) {
  const id = path.basename(file,'.tree');
  assert(!files.has(id),`Duplicate ID ${id}`);
  files.set(id,`trees/${file}`);
}
const note = id => read(files.get(id));
const record = json('research/icm2026-plenary-applied-reports.json');
const snapshots = json('research/icm2026-plenary-applied-reports-snapshots.json');

test('the complete plenary queue retains ordinary, special and applied-module coverage', () => {
  const plan = json('research/icm2026-plenary-batch-plan.json');
  assert.equal(plan.reports.length,22);
  assert.equal(plan.reports.filter(r=>r.kind==='ordinary').length,19);
  assert.equal(plan.reports.filter(r=>r.kind==='special').length,3);
  assert.equal(new Set(plan.reports.map(r=>r.speaker_id)).size,22);
  assert.equal(plan.subject_modules.length,20);
  const integrated = plan.reports.filter(r=>r.status==='selected-branches-integrated-local');
  const pending = plan.reports.filter(r=>['queued','in_progress'].includes(r.status));
  assert.equal(plan.counts.new_selected_branch_topics,integrated.length);
  assert.equal(plan.counts.outstanding_reports,pending.length);
  assert.equal(plan.counts.source_bound_topics_now,
    integrated.length+plan.reports.filter(r=>r.status==='keep_existing').length);
  for (const row of plan.subject_modules) assert(files.has(row.id));
  for (const report of record.reports) {
    const row = plan.reports.find(r=>r.planned_outline===report.outline || r.existing_outline===report.outline);
    assert(row,report.outline);
    assert.equal(row.status,'selected-branches-integrated-local');
    assert.equal(row.title,report.title);
    assert.deepEqual([...row.subject_ids].sort(),[...report.subject_ids].sort());
  }
  const ziegler = plan.reports.find(r=>r.speaker==='Tamar Ziegler');
  assert.equal(ziegler.existing_outline,'2900');
  assert.equal(ziegler.action,'upgrade_existing_outline');
});

test('three source-bound plenaries lead the applicable modules without displacing old topics', () => {
  assert.deepEqual(record.reports.map(r => r.outline),['4P00','4Q00','4R00']);
  assert.deepEqual(record.reports.map(r => r.doi),['10.1137/25M1807617','10.1137/25M1808064','10.1137/25M1806831']);
  for (const [subject,leading] of Object.entries(record.leading_topics)) {
    const topics = listedTopics(note(subject));
    assert.deepEqual(topics.slice(0,leading.length),leading,subject);
    for (const id of [...leading,...record.preserved_topics[subject]])
      assert.equal(topics.filter(x => x === id).length,1,`${subject}/${id}`);
  }
  for (const report of record.reports) {
    const placed = Object.entries(record.leading_topics).filter(([,ids]) => ids.includes(report.outline)).map(([id]) => id).sort();
    assert.deepEqual(placed,[...report.subject_ids].sort());
    assert(note(report.reference).includes(report.doi));
  }
});

test('each atom has a source, proof scope, explicit acyclic prerequisites and a current snapshot', () => {
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  const titles = new Map();
  for (const id of files.keys()) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title,[]);
    titles.get(title).push(id);
  }
  for (const report of record.reports) {
    for (const field of ['reading_scope','proof_scope','claim_sources','version_url','license','remaining_branches','unexpanded_deep_proofs'])
      assert(report[field],`${report.outline}: ${field}`);
    assert(note(report.outline).split('\n').filter(l => l.startsWith('\\p{')).length >= 5);
    const reached = new Set(), pending = [report.outline];
    while (pending.length) {
      const id = pending.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      pending.push(...Array.from(note(id).matchAll(/\]\(([^)]+)\)|\\transclude\{([^}]+)\}/g), m => m[1] ?? m[2]));
    }
    const branch = snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
    assert(branch.length >= 20);
    for (const row of branch) {
      assert(reached.has(row.id),`Unreachable ${row.id}`);
      assert.equal(hash(note(row.id)),row.sha256,row.id);
      assert.equal(row.sha256,required.pages[row.id].sha256,row.id);
      assert(!note(row.id).includes('\\strong{相关页面}'));
      if (!['Outline','Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title),[row.id],`Duplicate concept title ${row.title}`);
        assert(report.proof_scope[row.id] && report.claim_sources[row.id]?.length,row.id);
        for (const source of report.claim_sources[row.id]) assert(source.url && source.location,row.id);
        assert.deepEqual(audit.prerequisites[row.id],record.prerequisites[row.id],row.id);
      }
      const linked = new Set(bodyLinks(note(row.id)).map(link => link.target));
      for (const target of record.prerequisites[row.id]) {
        assert(files.has(target) && linked.has(target),`${row.id}: ${target}`);
        assert(!/\\taxon\{(?:Outline|Chapter|Reference|Person)\}/.test(note(target)),target);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix)) assert(branch.some(row => row.id === id),id);
  }
  const active = new Set(), done = new Set();
  function visit(id,route=[]) {
    assert(!active.has(id),`Cycle ${[...route,id].join(' -> ')}`);
    if (done.has(id)) return;
    active.add(id);
    for (const target of audit.prerequisites[id] ?? []) {assert(files.has(target),target); visit(target,[...route,id]);}
    active.delete(id); done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id => visit(id));
});

const near = (a,b,tol=1e-10) => assert(Math.abs(a-b) <= tol,`${a} != ${b}`);
test('reviewed probability and convergence hypotheses remain explicit', () => {
  assert(note('4P0M').includes('0<\\delta\\le 1/2'));
  assert(note('4P0R').includes('y\\in\\{-1,1\\}'));
  assert(note('4R0K').includes('假设鞍点存在'));
  assert(note('4R0I').includes('使新点仍属于 #{\\mathcal N_\\gamma}'));
  const queue = note('4Q0T');
  assert(queue.includes('条件概率') && queue.includes('历史'));
  for (const n of [1,3,10]) for (const c of [0.01,0.1,0.4]) {
    const q = c/(n+c)/2;
    assert(-(1-q)*c+q*n < 0);
  }
  for (const delta of [1e-8,0.01,0.1,0.5])
    assert(Math.log(4/delta)<=3*Math.log(1/delta)+1e-12);
});

test('quadratic GD, Nesterov energy and the nonmonotone two-step example have the stated bounds', () => {
  const L=4, eigen=[1,4], star=[0,0], f=x => x.reduce((s,v,i)=>s+eigen[i]*v*v/2,0);
  const norm2=x => x.reduce((s,v)=>s+v*v,0);
  for (const x0 of [[1,2],[-3,0.5],[0,1]]) {
    let x=[...x0], y=[...x0], t=1, energy=L*norm2(x0)/2;
    for (let k=1;k<=50;k++) {
      const old=x, next=y.map((v,i)=>v*(1-eigen[i]/L));
      const z=next.map((v,i)=>t*v-(t-1)*old[i]-star[i]);
      const newEnergy=t*t*f(next)+L*norm2(z)/2;
      assert(newEnergy<=energy+1e-11);
      assert(f(next)<=2*L*norm2(x0)/(k+1)**2+1e-12);
      energy=newEnergy;
      const tn=(1+Math.sqrt(1+4*t*t))/2;
      y=next.map((v,i)=>v+(t-1)/tn*(v-old[i])); x=next; t=tn;
    }
  }
  let x=[0,1]; near(f(x),2);
  x=x.map((v,i)=>v*(1-eigen[i])); near(f(x),18);
  x=x.map((v,i)=>v*(1-eigen[i]/4)); near(f(x),0);
});

test('the long-step LP direction preserves feasibility, neighborhood and its exact gap formula', () => {
  // A=(1,1), b=1, c=(1,2), y=0. Exact elimination of the 5 by 5 Newton system.
  const gamma=0.2, sigma=0.6, n=2, alpha=Math.min(1,sigma*(1-gamma)/(1+1/gamma))/n;
  for (const x1 of [0.2,0.4,0.5,0.7]) {
    const x=[x1,1-x1], s=[1,2], mu=(x[0]*s[0]+x[1]*s[1])/n;
    if (Math.min(x[0]*s[0],x[1]*s[1])<gamma*mu) continue;
    const r=x.map((v,i)=>sigma*mu-v*s[i]);
    const dy=-(r[0]/s[0]+r[1]/s[1])/(x[0]/s[0]+x[1]/s[1]);
    const dx=x.map((v,i)=>(r[i]+v*dy)/s[i]), ds=[-dy,-dy];
    near(dx[0]+dx[1],0); near(dx[0]*ds[0]+dx[1]*ds[1],0);
    const xp=x.map((v,i)=>v+alpha*dx[i]), sp=s.map((v,i)=>v+alpha*ds[i]);
    const gap=xp[0]*sp[0]+xp[1]*sp[1];
    near(gap/n,(1-alpha*(1-sigma))*mu);
    assert(xp.every(v=>v>0) && sp.every(v=>v>0));
    assert(xp.every((v,i)=>v*sp[i]>=gamma*gap/n-1e-12));
  }
});

test('multiplicative weights obeys the recorded finite-horizon regret bound', () => {
  for (const T of [1,4,25,100]) {
    const N=4, eta=Math.sqrt(2*Math.log(N)/T), weights=Array(N).fill(1), totals=Array(N).fill(0);
    let mixed=0;
    for (let t=0;t<T;t++) {
      const losses=weights.map((_,i)=>(1+Math.sin(3*t+2*i))/2), sum=weights.reduce((a,b)=>a+b,0);
      mixed+=weights.reduce((s,w,i)=>s+w/sum*losses[i],0);
      losses.forEach((loss,i)=>{totals[i]+=loss; weights[i]*=Math.exp(-eta*loss);});
    }
    assert(mixed-Math.min(...totals)<=Math.log(N)/eta+eta*T/2+1e-10);
  }
});

test('affine routing bound and minimum-norm interpolation sanity cases', () => {
  for (const a of [0,0.5,1,3]) for (const b of [0,0.3,2])
    for (const x of [0,0.2,1,4]) for (const y of [0,0.1,2,5])
      assert(y*(a*x+b)<=y*(a*y+b)+x*(a*x+b)/4+1e-12);
  // One observation X=(1,2); the kernel component of GD remains fixed.
  const data=[1,2], response=3, initial=[2,-1], kernel=[2,-1];
  let theta=[...initial];
  for (let i=0;i<50;i++) {
    const residual=data[0]*theta[0]+data[1]*theta[1]-response;
    theta=theta.map((v,j)=>v-0.1*data[j]*residual);
  }
  near(theta[0]+2*theta[1],response);
  near(2*theta[0]-theta[1],2*kernel[0]-kernel[1]);
  near(theta[0],0.6+kernel[0]); near(theta[1],1.2+kernel[1]);
});
