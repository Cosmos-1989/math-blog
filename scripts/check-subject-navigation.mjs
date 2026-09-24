import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const errors = [];
const trees = new Map();
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith(".tree")) trees.set(path.basename(file, ".tree"), fs.readFileSync(file, "utf8"));
  }
}
walk(path.join(root, "trees"));

const links = text => [...text.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)].map(match => match[1]);
const listed = text => [...text.matchAll(/\\li\{[^\n]*/g)].flatMap(match => links(match[0]));
const subjects = links(trees.get("0060") ?? "");
const foundations = new Set(["001C", "001D", "001E", "001F", "0076", "013Y"]);
if (subjects.length !== 20 || new Set(subjects).size !== 20) errors.push("Expected 20 unique subject landing pages");

for (const id of subjects) {
  const text = trees.get(id);
  if (!text) { errors.push(`${id}: missing landing page`); continue; }
  const targets = listed(text);
  if (new Set(targets).size !== targets.length) errors.push(`${id}: duplicated topic entry`);
  if (text.includes("ICM 学科结构")) errors.push(`${id}: conference label in public subject navigation`);
  if (!targets.length && !text.includes("暂未收录独立专题")) errors.push(`${id}: unexplained empty navigation`);
  for (const target of links(text)) {
    if (foundations.has(target)) errors.push(`${id}: foundation hub ${target} belongs inside a topic`);
  }
  for (const target of targets) {
    if (!trees.has(target)) errors.push(`${id}: missing topic ${target}`);
    else if (!trees.get(target).includes("\\taxon{Outline}")) errors.push(`${id}: ${target} is an atomic note, not a topic outline`);
  }
}

const coverage = {};
for (const [id, slug] of [["0061", "logic"], ["0062", "algebra"]]) {
  const manifest = JSON.parse(read(`research/icm2026-${slug}.json`));
  const expected = manifest.papers.map(paper => paper.outline);
  const text = trees.get(id) ?? "";
  const heading = "\\strong{研究专题}";
  const start = text.indexOf(heading);
  const end = text.indexOf("\n\\strong{", start + heading.length);
  const research = start < 0 ? [] : listed(text.slice(start + heading.length, end < 0 ? undefined : end));
  for (const topic of expected) {
    if (research.filter(target => target === topic).length !== 1) errors.push(`${id}: report ${topic} must appear once directly in research topics`);
  }
  for (const topic of research) {
    if (!expected.includes(topic)) errors.push(`${id}: independent topic ${topic} must be listed separately`);
  }
  const other = text.indexOf("\\strong{其他专题}");
  if (other < 0 || !listed(text.slice(other)).includes("003A")) errors.push(`${id}: categorical logic must be a separate topic`);
  coverage[slug] = { expected: expected.length, directlyListed: research.length };
}

console.log(JSON.stringify({ subjects: subjects.length, coverage, errors }, null, 2));
if (errors.length) process.exitCode = 1;
