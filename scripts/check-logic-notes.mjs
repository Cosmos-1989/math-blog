import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { output as siteOutput } from "./site-config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research/icm2026-logic.json"), "utf8"));
const require = createRequire(import.meta.url);
const katexArg = process.argv.indexOf("--katex");
const katex = katexArg < 0 ? null : require(path.resolve(process.argv[katexArg + 1]));
const errors = [];
const trees = new Map();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

for (const file of walk(path.join(root, "trees")).filter(p => p.endsWith(".tree"))) {
  const id = path.basename(file, ".tree");
  if (trees.has(id)) errors.push("Duplicate ID " + id + ": " + file);
  trees.set(id, { file, text: fs.readFileSync(file, "utf8") });
}

function localLinks(text) {
  const markdown = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1]);
  const transclusions = [...text.matchAll(/\\transclude\{([^}]+)\}/g)].map(m => m[1]);
  return [...markdown, ...transclusions].filter(s => !/^(https?:|mailto:|#)/.test(s));
}

const reached = new Set();
const queue = [manifest.root];
while (queue.length) {
  const id = queue.pop();
  if (reached.has(id) || !trees.has(id)) continue;
  reached.add(id);
  queue.push(...localLinks(trees.get(id).text));
}

let formulas = 0;
let diagrams = 0;
const duplicateTitles = new Map();
for (const note of manifest.notes) {
  const tree = trees.get(note.id);
  if (!tree) {
    errors.push("Missing tree " + note.id);
    continue;
  }
  if (path.relative(root, tree.file) !== note.path) errors.push("Path mismatch " + note.id);
  if (!tree.text.includes("\\title{" + note.title + "}")) errors.push("Title mismatch " + note.id);
  if (!reached.has(note.id)) errors.push("Unreachable from " + manifest.root + ": " + note.id);
  for (const target of localLinks(tree.text)) {
    if (!trees.has(target)) errors.push(note.id + ": broken link " + target);
  }
  if (/\(\s*@[\w-]+\)/.test(tree.text)) errors.push(note.id + ": unresolved symbolic link");
  if (/相关页面/.test(tree.text)) errors.push(note.id + ": manual related-pages block");
  if (note.taxon !== "Outline" && note.taxon !== "Reference" &&
      !/\\meta\{source\}/.test(tree.text)) errors.push(note.id + ": missing source");
  if (duplicateTitles.has(note.title)) errors.push("Duplicate new title: " + note.title);
  duplicateTitles.set(note.title, note.id);

  const output = path.join(siteOutput, note.id, "index.xml");
  if (!fs.existsSync(output)) {
    errors.push(note.id + ": missing built XML");
    continue;
  }
  const xml = fs.readFileSync(output, "utf8");
  const main = xml.match(/<fr:mainmatter>([\s\S]*?)<\/fr:mainmatter>/)?.[1] ?? "";
  if (!main.trim()) errors.push(note.id + ": empty mainmatter");
  // Check generated TeX, not source spelling that Forester may transform.
  for (const match of main.matchAll(/<fr:tex\b[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/fr:tex>/g)) {
    formulas++;
    if (katex) {
      try {
        katex.renderToString(match[1], { throwOnError: true, strict: false });
      } catch (error) {
        errors.push(note.id + ": " + error.message);
      }
    }
  }
  for (const match of main.matchAll(/<html:img\b[^>]*src="([^"]+)"/g)) {
    const resource = path.join(root, "output", match[1].replace(/^\//, ""));
    diagrams++;
    if (!fs.existsSync(resource) || !fs.readFileSync(resource, "utf8").includes("<svg")) {
      errors.push(note.id + ": missing SVG " + match[1]);
    }
  }
}

for (const paper of manifest.papers) {
  for (const id of [paper.outline, paper.reference, ...paper.notes]) {
    if (!manifest.notes.some(n => n.id === id)) errors.push("Untracked coverage ID " + id);
  }
  if (!trees.get(paper.reference)?.text.includes(paper.doi)) {
    errors.push(paper.reference + ": DOI mismatch");
  }
}

console.log(JSON.stringify({
  pages: manifest.notes.length,
  papers: manifest.papers.length,
  authors: new Set(manifest.papers.flatMap(p => p.authors)).size,
  reachablePages: manifest.notes.filter(n => reached.has(n.id)).length,
  formulas,
  diagrams,
  katexChecked: Boolean(katex),
  errors,
}, null, 2));
if (errors.length) process.exitCode = 1;
