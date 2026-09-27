import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('research/icm2026-geometry.json'));
const roster = JSON.parse(read(manifest.roster));
const errors = [];
const expected = new Set(roster.speakers.map(speaker => speaker.name));
const actual = manifest.papers.flatMap(paper => paper.authors);
if (expected.size !== manifest.expected_speakers) errors.push('Official speaker count differs');
if (manifest.papers.length !== manifest.expected_reports) errors.push('Report count differs');
if (new Set(actual).size !== actual.length) errors.push('Speaker appears in multiple report entries');
if (actual.some(name => !expected.has(name)) || [...expected].some(name => !actual.includes(name))) {
  errors.push('Report grouping does not cover exactly the official speakers');
}
const sources = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const landing = read(sources.get(manifest.landing));
for (const paper of manifest.papers) {
  if (!paper.outline) continue;
  if (!sources.has(paper.outline)) errors.push(`Missing outline ${paper.outline}`);
  if (!landing.includes(`](${paper.outline})`)) errors.push(`Report ${paper.id} not listed directly`);
  if (!sources.has(paper.reference)) errors.push(`Missing source page for ${paper.id}`);
}
if (new Set(manifest.new_note_ids).size !== manifest.new_note_ids.length) errors.push('Duplicate new note ID');
for (const id of manifest.new_note_ids) {
  const note = manifest.notes.find(note => note.id === id);
  if (!note || sources.get(id) !== note.path) { errors.push(`Missing metadata for ${id}`); continue; }
  const text = read(note.path);
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  if (hash !== note.sha256) errors.push(`Stale snapshot ${id}; run sync-geometry-notes.mjs`);
}
for (const id of manifest.research_statements_without_local_proof) {
  const text = read(sources.get(id));
  if (!text.includes('\\meta{source}')) errors.push(`Unattributed research theorem ${id}`);
  if (manifest.proofs_written.includes(id)) errors.push(`Citation confused with a proof: ${id}`);
}

// Exact sample computations catch transcription errors; they do not replace the written proofs.
let calculations = 0;
const sameProjective = (a, b) => a.some(x => x !== 0n) && b.some(x => x !== 0n)
  && a.every((x, i) => a.every((y, j) => x * b[j] === y * b[i]));
for (let s = -4n; s <= 4n; s++) for (let t = -4n; t <= 4n; t++) {
  if (s === 0n && t === 0n) continue;
  const x = 2n*s*t, y = s*s-t*t, z = s*s+t*t;
  assert.equal(x*x+y*y, z*z);
  if (y+z !== 0n) assert(sameProjective([s,t], [y+z,x]));
  calculations++;
}
const sigma = ([x,y,z]) => [y*z,x*z,x*y];
for (const x of [1n,2n,-3n]) for (const y of [1n,-2n]) for (const z of [1n,4n]) {
  assert(sameProjective(sigma(sigma([x,y,z])), [x,y,z]));
  calculations++;
}
for (const [u,v,s,t] of [[2n,3n,4n,5n],[-1n,2n,3n,4n],[0n,1n,2n,1n]]) {
  const [x,y,z] = [u*t,s*v,v*t];
  assert(sameProjective([x,z],[u,v]));
  assert(sameProjective([y,z],[s,t]));
  calculations++;
}
console.log(JSON.stringify({speakers: expected.size, reports: manifest.papers.length,
  addedTopics: manifest.papers.filter(p => p.status === 'selected-branches-integrated').length,
  reusedTopics: manifest.papers.filter(p => p.status === 'reuse-existing').length,
  newPages: manifest.notes.length, exactSampleCalculations: calculations,
  coverage: manifest.status, errors}, null, 2));
if (errors.length) process.exitCode = 1;
