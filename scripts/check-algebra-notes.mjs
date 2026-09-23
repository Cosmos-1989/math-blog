import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const manifest = read("research/icm2026-algebra.json");
const roster = read("research/icm2026-algebra-roster.json");
const sourceOnly = process.argv.includes("--source-only");
const errors = [];
const normalize = name => name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const tracked = new Map(manifest.notes.map(note => [note.id, note]));
const speakerCounts = new Map(roster.speakers.map(speaker => [normalize(speaker.name), 0]));
const outlines = new Set();

for (const paper of manifest.papers) {
  if (outlines.has(paper.outline)) errors.push(`Report counted twice: ${paper.outline}`);
  outlines.add(paper.outline);
  for (const name of paper.invited_speakers) {
    const key = normalize(name);
    if (!speakerCounts.has(key)) errors.push(`Speaker not in official Algebra roster: ${name}`);
    else speakerCounts.set(key, speakerCounts.get(key) + 1);
  }
  if (!paper.full_text_read) errors.push(`${paper.title}: full text not confirmed`);
  if (!paper.url || !paper.coverage || !paper.limitations) errors.push(`${paper.title}: incomplete source audit`);
  for (const id of [paper.outline, paper.reference, ...paper.notes]) {
    if (!tracked.has(id)) errors.push(`Untracked coverage ID ${id}`);
  }
  const ref = tracked.get(paper.reference);
  if (ref && paper.doi && !fs.readFileSync(path.join(root, ref.path), "utf8").includes(paper.doi)) {
    errors.push(`${paper.reference}: DOI mismatch`);
  }
}
for (const [speaker, count] of speakerCounts) {
  if (count !== 1) errors.push(`${speaker}: expected one report, found ${count}`);
}
if (tracked.size !== manifest.notes.length) errors.push("Duplicate manifest note IDs");
if (manifest.papers.length !== 12) errors.push("Expected 12 joint/cross-listed Algebra reports in the verified roster");

for (const note of manifest.notes) {
  const file = path.join(root, note.path);
  if (!fs.existsSync(file)) { errors.push(`Missing source ${note.id}`); continue; }
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes(`\\title{${note.title}}`)) errors.push(`${note.id}: title mismatch`);
  if (!text.includes(`\\taxon{${note.taxon}}`)) errors.push(`${note.id}: taxon mismatch`);
  if (!["Reference", "Outline"].includes(note.taxon) && !text.includes("\\meta{source}")) {
    errors.push(`${note.id}: missing source metadata`);
  }
  if (sourceOnly) continue;
  const output = path.join(root, "output/math-blog", note.id, "index.xml");
  if (!fs.existsSync(output)) errors.push(`${note.id}: missing built page`);
  else if (!fs.readFileSync(output, "utf8").includes("<fr:mainmatter>")) errors.push(`${note.id}: no rendered mainmatter`);
}
console.log(JSON.stringify({
  reports: manifest.papers.length,
  invitedSpeakers: speakerCounts.size,
  trackedPages: tracked.size,
  reusedReports: manifest.papers.filter(paper => paper.reused).length,
  errors,
  limitation: "Checks source records and roster coverage, not mathematical truth or completeness of proofs; run check-site-notes.mjs for links, prerequisites and KaTeX.",
}, null, 2));
if (errors.length) process.exitCode = 1;
