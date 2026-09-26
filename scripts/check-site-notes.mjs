import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const auditPath = path.join(root, "research/site-evergreen-audit.json");
const audit = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, "utf8")) : null;
const sourceOnly = process.argv.includes("--source-only");
const katexIndex = process.argv.indexOf("--katex");
if (katexIndex >= 0 && !process.argv[katexIndex + 1]) throw new Error("--katex requires a module path");
const katex = katexIndex < 0 ? null : require(path.resolve(process.argv[katexIndex + 1]));
const errors = [], warnings = [], trees = new Map();
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
function links(text) {
  return [...text.matchAll(/\[([^\]\n]+)\]\(([^)\s]+)\)/g)]
    .map(match => ({ label: match[1], target: match[2] }));
}
function targets(text) {
  return [...links(text).map(link => link.target),
    ...[...text.matchAll(/\\(?:transclude|author)\{([^}]+)\}/g)].map(match => match[1])]
    .filter(target => !/^(https?:|mailto:|#)/.test(target));
}
for (const file of walk(path.join(root, "trees")).filter(file => file.endsWith(".tree"))) {
  const id = path.basename(file, ".tree");
  const text = fs.readFileSync(file, "utf8");
  if (trees.has(id)) errors.push(`Duplicate ID ${id}`);
  trees.set(id, { file, text, taxon: text.match(/\\taxon\{([^}]+)\}/)?.[1] ?? "Outline",
    title: text.match(/\\title\{([^}]+)\}/)?.[1] });
}
const reached = new Set(), queue = ["index"];
while (queue.length) {
  const id = queue.pop();
  if (reached.has(id) || !trees.has(id)) continue;
  reached.add(id);
  queue.push(...targets(trees.get(id).text));
}
let formulas = 0, diagrams = 0;
const titles = new Map();
for (const [id, tree] of trees) {
  if (!tree.title) errors.push(`${id}: missing title`);
  if (titles.has(tree.title)) warnings.push(`Same title: ${titles.get(tree.title)}, ${id}: ${tree.title}`);
  titles.set(tree.title, id);
  if (!reached.has(id)) errors.push(`${id}: unreachable from index`);
  for (const target of targets(tree.text)) if (!trees.has(target)) errors.push(`${id}: broken link ${target}`);
  if (/\(@[\w-]+\)/.test(tree.text)) errors.push(`${id}: unresolved symbolic link`);
  if (/\\strong\{相关页面\}|\\title\{相关页面\}/.test(tree.text)) errors.push(`${id}: manual related-pages section`);
  if (/\\!/.test(tree.text)) errors.push(`${id}: unsupported Forester TeX escape`);
  if (/\\[A-Za-z][A-Za-z0-9_-]*\/[A-Za-z0-9\\]/.test(tree.text)) errors.push(`${id}: TeX command adjacent to slash; separate it with whitespace or use \\frac to avoid Forester path syntax`);
  for (const { label, target } of links(tree.text)) {
    const expected = audit?.terminology_targets?.[target]?.[label];
    if (expected) errors.push(`${id}: '${label}' still links ${target}, expected ${expected}`);
  }
  if (sourceOnly) continue;
  const output = path.join(root, "output/math-blog", id, "index.xml");
  if (!fs.existsSync(output)) { errors.push(`${id}: missing built XML`); continue; }
  const xml = fs.readFileSync(output, "utf8");
  const main = xml.match(/<fr:mainmatter>([\s\S]*?)<\/fr:mainmatter>/)?.[1] ?? "";
  if (!main.trim()) errors.push(`${id}: empty rendered body`);
  for (const match of main.matchAll(/<fr:tex\b[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/fr:tex>/g)) {
    formulas++;
    if (katex) try { katex.renderToString(match[1], { throwOnError: true, strict: false }); }
    catch (error) { errors.push(`${id}: ${error.message}`); }
  }
  for (const match of main.matchAll(/<html:img\b[^>]*src="([^"]+)"/g)) {
    if (/^https?:/.test(match[1])) continue;
    const resource = path.join(root, "output", match[1].replace(/^\//, ""));
    diagrams++;
    if (!fs.existsSync(resource)) errors.push(`${id}: missing image ${match[1]}`);
    else if (resource.endsWith(".svg") && !fs.readFileSync(resource, "utf8").includes("<svg")) {
      errors.push(`${id}: invalid SVG ${match[1]}`);
    }
  }
}
if (!audit) errors.push("Missing whole-site semantic review register");
else {
  for (const id of audit.original_ids) {
    if (!trees.has(id)) errors.push(`Removed original ID: ${id}`);
    if (!audit.reviews[id]) errors.push(`Original page not reviewed: ${id}`);
  }
  for (const id of trees.keys()) if (!audit.reviews[id]) errors.push(`Page absent from review register: ${id}`);
  for (const [id, review] of Object.entries(audit.reviews)) {
    if (!trees.has(id)) errors.push(`Review has no page: ${id}`);
    if (!review.reason || review.action === "pending") errors.push(`Incomplete review: ${id}`);
  }
  for (const [id, prerequisites] of Object.entries(audit.prerequisites)) {
    const tree = trees.get(id);
    if (!tree) { errors.push(`Unknown prerequisite source ${id}`); continue; }
    const body = tree.text.slice(tree.text.indexOf("\n\n") + 2);
    const actual = new Set(targets(body));
    if (["Outline", "Chapter"].includes(tree.taxon)) errors.push(`${id}: outline registered as atomic`);
    for (const target of prerequisites) {
      if (!actual.has(target)) errors.push(`${id}: prerequisite ${target} not linked in body`);
      if (!trees.has(target)) errors.push(`${id}: missing prerequisite ${target}`);
      if (["Outline", "Chapter"].includes(trees.get(target)?.taxon)) errors.push(`${id}: prerequisite ${target} is navigation`);
    }
  }
  const active = new Set(), completed = new Set();
  function visit(id, route) {
    if (active.has(id)) { errors.push(`Prerequisite cycle: ${[...route, id].join(" -> ")}`); return; }
    if (completed.has(id)) return;
    active.add(id);
    for (const target of audit.prerequisites[id] ?? []) visit(target, [...route, id]);
    active.delete(id);
    completed.add(id);
  }
  Object.keys(audit.prerequisites).forEach(id => visit(id, []));
  for (const [id, children] of Object.entries(audit.splits)) {
    const tree = trees.get(id);
    if (tree?.taxon !== "Outline") errors.push(`${id}: split old ID is not an Outline`);
    const actual = new Set(targets(tree?.text ?? ""));
    for (const child of children) if (!actual.has(child)) errors.push(`${id}: extracted page ${child} missing from outline`);
  }
}
console.log(JSON.stringify({ scope: "all trees, not only research notes", pages: trees.size,
  originalPages: audit?.original_ids.length ?? 0, reviewedPages: Object.keys(audit?.reviews ?? {}).length,
  reachablePages: reached.size, formulas, diagrams, katexChecked: Boolean(katex),
  semanticLimit: "The register records editorial review; structural checks do not prove mathematical correctness or semantic atomicity.",
  errors, warnings }, null, 2));
if (errors.length) process.exitCode = 1;
