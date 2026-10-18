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
const record = json('research/icm2026-geometry-harmonic-contact.json');
const snapshot = json('research/icm2026-geometry-harmonic-contact-snapshots.json');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), 'trees/' + file]));
const note = id => read(files.get(id));

test('two reports are linked once and the joint report is counted once', () => {
  assert.equal(record.reports.length, 2);
  const topics = listedTopics(note('0065'));
  assert.deepEqual(topics.slice(0, 2), ['2C00', '2600']);
  const coverage = json('research/icm2026-geometry-section-coverage.json');
  for (const report of record.reports) {
    assert.equal(topics.filter(id => id === report.outline).length, 1);
    assert.equal(coverage.reports.filter(row => row.doi === report.doi).length, 1);
    assert.equal(coverage.reports.find(row => row.doi === report.doi).outline, report.outline);
    assert(report.deferred.length && report.reading_scope && report.question);
  }
  assert.deepEqual(coverage.reports.find(row => row.outline === '2J00').speakers,
    ['Georgios Daskalopoulos', 'Chikako Mese']);
  assert.equal(coverage.counts.primary_reports_with_existing_topic, coverage.reports.filter(row => row.outline).length);
});

test('all imported notes are reachable, hashed and have reviewed dependencies', () => {
  const reached = new Set(), queue = record.reports.map(row => row.outline);
  while (queue.length) {
    const id = queue.pop();
    if (!files.has(id) || reached.has(id)) continue;
    reached.add(id);
    queue.push(...[...note(id).matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1]));
  }
  for (const row of snapshot.notes) {
    assert(reached.has(row.id), row.id);
    assert.equal(crypto.createHash('sha256').update(note(row.id)).digest('hex'), row.sha256, row.id);
    const links = bodyLinks(note(row.id)).map(link => link.target);
    for (const target of record.prerequisites[row.id]) {
      assert(links.includes(target), `${row.id}: unlinked prerequisite ${target}`);
      assert(!/\\taxon\{(?:Outline|Reference)\}/.test(note(target)), `${row.id}: non-atomic prerequisite ${target}`);
    }
  }
  for (const report of record.reports) {
    assert(note(report.outline).split('\n').filter(line => line.startsWith('\\p{')).length >= 5);
    assert(!/\\(?:ul|ol)\{/.test(note(report.outline)));
    for (const id of files.keys()) if (id.startsWith(report.prefix))
      assert(snapshot.notes.some(row => row.id === id), `Unreviewed ${id}`);
  }
});

test('hypotheses and energy normalizations are retained', () => {
  assert.match(note('2J0A'), /\\tfrac\s*12\\Delta/);
  assert.match(note('2J0H'), /边值条件不可省略/);
  assert.match(note('2J0L'), /H\(r\)=\\int_\{\\partial B_r\}h\^2/);
  assert.match(note('2J0R'), /有限能量/);
  assert.match(note('2J0U'), /无界/);
  assert.match(note('2J0V'), /余紧/);
  assert.match(note('2J13'), /内部/);
  assert.match(note('2J13'), /实秩至少为/);
  assert.match(note('2J0Z'), /不按/);
  assert.match(note('2J15'), /4\\pi/);
  assert.match(note('2J04'), /闭测地凸子集/);
  assert.match(note('2J09'), /相对紧区域/);
  assert.match(note('2J10'), /调和当且仅当/);
  assert.match(note('2J11'), /局部 Lipschitz/);
  assert.match(note('2J14'), /\]\(2J1A\)/);
  assert.match(note('2K11'), /n\\geq\s*2/);
  assert.match(note('2K0U'), /松 Legendrian/);
  assert.match(note('2K0Z'), /子午线、经线/);
  assert.match(note('2K13'), /H\^2\(M;\\mathbb Z\)=0/);
});

test('contact examples satisfy their defining identities', () => {
  // The explicit Legendrian unknot satisfies dz=y dx, including at its cusps.
  for (let j = 0; j <= 100; j++) {
    const t = j * Math.PI / 50;
    const xprime = -Math.sin(t), y = -3 * Math.sin(t) * Math.cos(t);
    const zprime = 3 * Math.sin(t) ** 2 * Math.cos(t);
    const yprime = -3 * (Math.cos(t) ** 2 - Math.sin(t) ** 2);
    assert(Math.abs(zprime - y * xprime) < 1e-12);
    assert(xprime ** 2 + yprime ** 2 + zprime ** 2 > 0);
  }
  // Positive and negative stabilization realize exactly the allowed unknot pairs.
  for (let tb = -12; tb <= -1; tb++) for (let rot = tb; rot <= -tb; rot++) {
    const allowed = Math.abs(rot) <= -tb - 1 && Math.abs((tb + rot) % 2) === 1;
    const a = (-tb - 1 + rot) / 2, b = (-tb - 1 - rot) / 2;
    assert.equal(allowed, a >= 0 && b >= 0 && Number.isInteger(a) && Number.isInteger(b));
  }
  // Differentiating z=q.u and eta=q-(q.u)u gives dz-eta.du=u.dq.
  const q = [2, 3, -1], u = [0, 0, 1], dq = [-2, 1, 4], du = [3, -2, 0];
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const z = dot(q, u), eta = q.map((x, i) => x - z * u[i]);
  assert.equal(dot(dq, u) + dot(q, du) - dot(eta, du), dot(u, dq));
});

test('tripod strong convexity holds for many point configurations', () => {
  const distance = ([branch, radius], [other, otherRadius]) => branch === other ? Math.abs(radius - otherRadius) : radius + otherRadius;
  const point = (p, q, t) => {
    if (p[0] === q[0]) return [p[0], (1 - t) * p[1] + t * q[1]];
    const d = t * (p[1] + q[1]);
    return d <= p[1] ? [p[0], p[1] - d] : [q[0], d - p[1]];
  };
  for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) for (let d = 0; d < 3; d++)
    for (const t of [0, 0.2, 0.5, 0.9, 1]) {
      const p = [b, 1.7], q = [c, 0.9], z = [d, 2.2];
      assert(distance(z, point(p, q, t)) ** 2 <= (1-t)*distance(z,p)**2+t*distance(z,q)**2-t*(1-t)*distance(p,q)**2+1e-12);
    }
});

test('normalizations agree with scalar harmonic and warped-metric examples', () => {
  // h=x^2-y^2 has half Delta|dh|^2 = |Hess h|^2 = 8.
  assert.equal(16 / 2, 2 ** 2 + (-2) ** 2);
  for (const r of [0.1, 0.4, 1, 3]) {
    const s = 2 * r, f = s ** 3 / 8, fsecond = 6 * s / 8;
    assert(Math.abs(-fsecond / f + 3 / (2 * r * r)) < 1e-10);
    for (const k of [1, 2, 3, 4]) {
      const H = Math.PI * r ** (2 * k + 1), D = Math.PI * k * r ** (2 * k);
      assert(Math.abs(r * D / H - k) < 1e-10);
    }
  }
  for (const L of [1, 2, 3]) {
    const angularSpeed = L / (2 * Math.PI), epsilon = 0.01, R = 0.5;
    const energy = 0.5 * 2 * Math.PI * angularSpeed ** 2 * Math.log(R / epsilon);
    assert(Math.abs(energy - L ** 2 / (4 * Math.PI) * Math.log(R / epsilon)) < 1e-12);
  }
});
