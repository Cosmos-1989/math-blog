import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from '../scripts/note-prerequisite-lib.mjs';
import {listedTopics} from '../scripts/subject-navigation-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const files = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive:true}).filter(f => f.endsWith('.tree'))) {
  const id = path.basename(file, '.tree');
  assert(!files.has(id), `Duplicate ID ${id}`);
  files.set(id, `trees/${file}`);
}
const note = id => read(files.get(id));
const record = json('research/icm2026-plenary-dynamics-probability.json');
const snapshots = json('research/icm2026-plenary-dynamics-probability-snapshots.json');

test('three distinct plenary identities and their actual module placements are retained', () => {
  assert.deepEqual(record.reports.map(r => r.outline), ['4S00', '4T00', '4U00']);
  assert.deepEqual(record.reports.map(r => r.doi), ['10.1137/25M1806971', '10.1137/25M1810726', '10.1137/25M1805643']);
  const plan = json('research/icm2026-plenary-batch-plan.json');
  for (const report of record.reports) {
    const row = plan.reports.find(r => r.planned_outline === report.outline);
    assert(row, report.outline);
    assert.equal(row.status, 'selected-branches-integrated-local');
    assert.equal(row.title, report.title);
    assert.deepEqual([...row.subject_ids].sort(), [...report.subject_ids].sort());
    const placed = Object.entries(record.leading_topics).filter(([,ids]) => ids.includes(report.outline)).map(([id]) => id);
    assert.deepEqual(placed.sort(), [...report.subject_ids].sort());
    assert(note(report.reference).includes(report.doi));
    assert(listedTopics(note(record.report_landings[report.outline])).includes(report.outline));
  }
  assert.equal(record.reports[1].reference, 'icm2026-hee-oh');
  assert(!note('icm2026-oh').includes('25M1810726'));
});

test('new plenaries follow existing plenaries and preserve every former subject topic', () => {
  for (const [subject, leading] of Object.entries(record.leading_topics)) {
    const topics = listedTopics(note(subject));
    assert.deepEqual(topics.slice(0, leading.length), leading, subject);
    for (const id of [...leading, ...record.preserved_topics[subject]])
      assert.equal(topics.filter(x => x === id).length, 1, `${subject}/${id}`);
  }
  for (const [slug, subject] of [['lie','0067'], ['dynamics','0069'], ['pde','006A'], ['mathematical-physics','006B']]) {
    const coverage = json(`research/icm2026-${slug}-section-coverage.json`);
    const previousLeading = record.leading_topics[subject];
    assert.deepEqual(coverage.editorial_leading_topics.map(row => row.outline).slice(0, previousLeading.length), previousLeading);
    for (const row of coverage.editorial_leading_topics.filter(row => ['4S00','4T00','4U00'].includes(row.outline)))
      assert.equal(row.counts_as_section_report, false);
  }
});

test('every new atom has source evidence, proof scope, explicit prerequisites and current snapshots', () => {
  const audit = json('research/site-evergreen-audit.json');
  const required = json('research/prerequisite-required-links.json');
  const titles = new Map();
  for (const id of files.keys()) {
    const title = note(id).match(/\\title\{([^\n]+)\}/)?.[1];
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(id);
  }
  for (const report of record.reports) {
    for (const field of ['reading_scope', 'proof_scope', 'claim_sources', 'version_url', 'license', 'remaining_branches', 'unexpanded_deep_proofs'])
      assert(report[field], `${report.outline}: ${field}`);
    assert(note(report.outline).split('\n').filter(l => l.startsWith('\\p{')).length >= 5);
    const reached = new Set(), pending = [report.outline];
    while (pending.length) {
      const id = pending.pop();
      if (!files.has(id) || reached.has(id)) continue;
      reached.add(id);
      pending.push(...Array.from(note(id).matchAll(/\]\(([^)]+)\)|\\transclude\{([^}]+)\}/g), m => m[1] ?? m[2]));
    }
    const branch = snapshots.notes.filter(row => row.id.startsWith(report.prefix) || row.id === report.reference);
    assert(branch.length > 2, `No atomic content ${report.outline}`);
    for (const row of branch) {
      assert(reached.has(row.id), `Unreachable ${row.id}`);
      assert.equal(hash(note(row.id)), row.sha256, row.id);
      assert.equal(row.sha256, required.pages[row.id].sha256, row.id);
      assert(!note(row.id).includes('\\strong{相关页面}'));
      if (!['Outline', 'Reference'].includes(row.taxon)) {
        assert.deepEqual(titles.get(row.title), [row.id], `Duplicate title ${row.title}`);
        assert(report.proof_scope[row.id] && report.claim_sources[row.id]?.length, row.id);
        for (const source of report.claim_sources[row.id]) assert(source.url && source.location, row.id);
        assert.deepEqual(audit.prerequisites[row.id], record.prerequisites[row.id], row.id);
      }
      const linked = new Set(bodyLinks(note(row.id)).map(link => link.target));
      for (const target of record.prerequisites[row.id]) {
        assert(files.has(target) && linked.has(target), `${row.id}: ${target}`);
        assert(!/\\taxon\{(?:Outline|Chapter|Reference|Person)\}/.test(note(target)), target);
      }
    }
    for (const id of files.keys()) if (id.startsWith(report.prefix)) assert(branch.some(row => row.id === id), id);
  }
  const active = new Set(), done = new Set();
  function visit(id, route=[]) {
    assert(!active.has(id), `Cycle ${[...route,id].join(' -> ')}`);
    if (done.has(id)) return;
    active.add(id);
    for (const target of audit.prerequisites[id] ?? []) { assert(files.has(target), target); visit(target, [...route,id]); }
    active.delete(id); done.add(id);
  }
  Object.keys(record.prerequisites).forEach(id => visit(id));
});

const near = (a,b,tol=1e-9) => assert(Math.abs(a-b) <= tol, `${a} != ${b}`);
test('the rotation geometric sum, resonance bound and renormalization matrix agree', () => {
  assert(note('4S02').replace(/\s/g, '').includes('2N/\\pi'));
  for (const N of [1,2,5,31]) for (const t of [0.017,0.13,0.4,0.501]) {
    let real=0, imaginary=0;
    for (let j=0;j<N;j++) { real+=Math.cos(2*Math.PI*j*t); imaginary+=Math.sin(2*Math.PI*j*t); }
    const amplitude=Math.sin(Math.PI*N*t)/Math.sin(Math.PI*t), phase=Math.PI*(N-1)*t;
    near(real, amplitude*Math.cos(phase)); near(imaginary, amplitude*Math.sin(phase));
    assert(Math.hypot(real,imaginary)<=Math.min(N,1/(2*Math.min(t,1-t)))+1e-9);
  }
  for (const N of [1,2,5,31]) for (const fraction of [0.1,0.3,0.5]) {
    const t=fraction/N;
    assert(Math.abs(Math.sin(Math.PI*N*t)/Math.sin(Math.PI*t))>=2*N/Math.PI-1e-9);
  }
  const beta=Math.sqrt(2)-1, lambda=3+2*Math.sqrt(2);
  near(beta+2,lambda*beta); near(2*beta+5,lambda);
  for (const T of [1,2,100,100000]) {
    const m=Math.ceil(Math.log(T)/Math.log(lambda)), rescaled=T/lambda**m;
    assert(rescaled>1/lambda-1e-12 && rescaled<=1+1e-12);
  }
});

test('Hermitian circles and the Busemann sign survive elementary coordinate checks', () => {
  assert(note('4T01').includes('(g^{-1})^*Qg^{-1}'));
  assert(note('4T03').includes('PGL'));
  for (const A of [-2,1,3]) for (const B of [[0,1],[2,-3]]) {
    const D=(B[0]**2+B[1]**2-4)/A, radius=2/Math.abs(A);
    for (const theta of [0,0.3,2]) {
      const z=[-B[0]/A+radius*Math.cos(theta),-B[1]/A+radius*Math.sin(theta)];
      near(A*(z[0]**2+z[1]**2)+2*(B[0]*z[0]+B[1]*z[1])+D,0);
    }
  }
  const potential=(xi,p)=>Math.log(((p[0]-xi[0])**2+(p[1]-xi[1])**2+p[2]**2)/p[2]);
  const x=[1,0,2],y=[-2,1,0.5],z=[0,3,4],xi=[0.2,-0.4];
  near(potential(xi,x)-potential(xi,z),potential(xi,x)-potential(xi,y)+potential(xi,y)-potential(xi,z));
  near(Math.log(Math.exp(2)/1),2);
});

test('KPZ scaling coefficients and all four TASEP local slopes are consistent', () => {
  assert(note('4U04').replace(/\s/g, '').includes('2-\\chi-z'));
  assert(note('4U04').includes('\\chi+(1-z)/2'));
  const chi=0.5,z=1.5;
  near(2-chi-z,0); near(2-z,0.5); near(chi+(1-z)/2,0.25);
  for (const a of [-1,1]) for (const b of [-1,1])
    near((a*b-1+b-a)/2, a===1 && b===-1 ? -2 : 0);
  for (const t of [0.1,1,5]) near(2*t*t/2,t*t);
  assert(note('4U0A').includes('N\\sim\\operatorname{Poi}(t^2)'));
});

test('two-wedge hitting uses a union, and local KP does not silently fix integration constants', () => {
  assert(note('4U0H').includes('E_1\\cup E_2'));
  for (const first of [0,1]) for (const second of [0,1])
    assert.equal(first + second - first * second, Number(Boolean(first || second)));
  assert(note('4U0J').includes('E_{rr}=0'));
  assert(note('4U0J').includes('a(t,x)r+b(t,x)'));
  assert(note('4U0K').includes('o(\\varepsilon^2)'));
  assert(note('4U0O').includes('\\mathfrak h(t,0;f)'));
  assert(note('4U0O').includes('2|x-y|'));
});

test('hypograph upper limits quantify over arbitrary subsequences', () => {
  assert(note('4U05').includes('任取子列 #{n_k}'));
  assert(note('4U05').includes('H_{f_{n_k}}'));
  const upperAt = n => Math.exp(n % 2);
  const limitUpper = 1, oddPoint = 2;
  for (let n=0; n<10; n++) {
    assert(upperAt(2*n+1) >= oddPoint);
    assert(upperAt(2*n) < oddPoint);
  }
  assert(oddPoint > limitUpper);
});

test('local mixing pairs the translated observation with the contracting BR functional', () => {
  assert(note('4T0L').includes('m^{\\mathrm{BR}*}(f_1)m^{\\mathrm{BR}}(f_2)'));
  assert(note('4T0M').includes('m^{\\mathrm{BR}*}(f_1)'));
  assert(note('4T04').includes('当 #{\\Gamma} 无挠时'));
  for (const delta of [0.3, 1, 1.7]) for (const s of [-2, 0.2, 1]) {
    const k = 2-delta, t=5;
    near(Math.exp(k*t)*Math.exp(-k*(t+s)), Math.exp(-k*s));
    const brStarMass = x => Math.exp(k*x)/k;
    near((brStarMass(1-s)-brStarMass(-s))/(brStarMass(1)-brStarMass(0)), Math.exp(-k*s));
  }
});
