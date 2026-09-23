import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const write = (name, value) => fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2) + "\n");
const slugs = ["foundations", "tensor", "groups", "representations", "homological", "combinatorial", "torsors"];
const records = slugs.map(slug => ({ slug, ...read(`research/algebra-${slug}.json`) }));
const audit = read("research/site-evergreen-audit.json");
const logic = read("research/icm2026-logic.json");
const greenfeld = logic.papers.find(paper => paper.outline === "007C");
if (!greenfeld) throw new Error("The previously audited Greenfeld report is missing");

const notes = new Map();
const papers = [];
const rosterNames = { "Pramod N. Achar": "Pramod Achar", "Srikanth B. Iyengar": "Srikanth Iyengar" };
for (const record of records) {
  for (const note of record.notes) {
    if (notes.has(note.id)) throw new Error(`Duplicate assigned note ID: ${note.id}`);
    notes.set(note.id, note);
    if (!record.reviews[note.id]) throw new Error(`${record.slug}: unreviewed page ${note.id}`);
    if (["Outline", "Reference"].includes(note.taxon)) delete audit.prerequisites[note.id];
  }
  for (const [id, review] of Object.entries(record.reviews)) {
    audit.reviews[id] = { ...review, scope: review.scope ?? `algebra-${record.slug}` };
  }
  Object.assign(audit.prerequisites, record.prerequisites);
  papers.push(...record.papers.map(paper => ({
    ...paper,
    invited_speakers: paper.invited_speakers ?? paper.authors.map(name => rosterNames[name] ?? name),
  })));
}

// Reuse the existing research graph instead of importing the cross-listed talk again.
const reusedIds = [greenfeld.outline, greenfeld.reference, ...greenfeld.notes];
for (const id of reusedIds) {
  const note = logic.notes.find(note => note.id === id);
  if (!note) throw new Error(`Missing reused note metadata: ${id}`);
  notes.set(id, { ...note, reused: true });
}
papers.push({
  ...greenfeld,
  invited_speakers: greenfeld.authors,
  reused: true,
  full_text_read: true,
  coverage: "Reused the existing audited full-text integration from the Logic section (2026-09-20), including its later atomic refactoring and prerequisite graph; no duplicate definitions or claim of a new full reading.",
  limitations: ["Coverage boundaries and deeper unreproduced tiling constructions remain as documented in ICM2026_LOGIC_SOURCE_AUDIT.md."],
});

for (const [id, file, reason] of [
  ["013Z", "trees/math/algebra/research/013Z.tree", "按数学问题组织十二条研究路线；同一报告与知识节点只出现一次"],
  ["0062", "trees/0062.tree", "代数主页加入新研究路线与共用基础，保留已有入口"],
  ["001C", "trees/math/algebra/001C.tree", "代数基础导航连接模、同调与概形，不改动原有群论节点"],
]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const title = source.match(/\\title\{([^}]+)\}/)[1];
  audit.reviews[id] = { action: id === "013Z" ? "added" : "revise", reason, scope: "algebra-integration", title };
  if (id === "013Z") notes.set(id, { id, path: file, title, taxon: "Outline" });
}
audit.date = "2026-09-23";
audit.scope = "Whole forest, with ICM2026 Algebra report integrations and their separately recorded coverage limits";
const manifest = {
  checked_on: "2026-09-23",
  roster_url: read("research/icm2026-algebra-roster.json").url,
  scope: "All Section 2 invited talks, including cross-listed and joint presentations; report coverage is not exhaustive reproduction of every technical proof",
  root: "013Z",
  foundation_root: "013Y",
  papers: papers.sort((a, b) => a.authors[0].localeCompare(b.authors[0])),
  notes: [...notes.values()].sort((a, b) => a.id.localeCompare(b.id)),
  review_records: slugs.map(slug => `research/algebra-${slug}.json`),
};
write("research/icm2026-algebra.json", manifest);
write("research/site-evergreen-audit.json", audit);
console.log(JSON.stringify({ reports: papers.length, trackedPages: notes.size, reviews: Object.keys(audit.reviews).length }));
