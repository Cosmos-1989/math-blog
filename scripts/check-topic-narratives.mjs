import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const record = read('research/topic-narratives.json');
const notes = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree'))
  .map(file => [path.basename(file, '.tree'), fs.readFileSync(path.join(root, 'trees', file), 'utf8')]));
const links = text => [...text.matchAll(/\]\(([^)\s]+)\)|\\transclude\{([^}]+)\}/g)]
  .map(match => match[1] ?? match[2]).filter(id => !/^(https?:|mailto:|#)/.test(id));
const errors = [];
const rows = [];
const expected = new Set([
  ...read('research/icm2026-logic.json').papers.map(p => p.outline),
  ...read('research/icm2026-algebra.json').papers.map(p => p.outline),
  ...read('research/icm2026-geometry.json').papers.map(p => p.outline).filter(Boolean),
  '0200',
]);
const reviewed = new Set(record.pages.map(p => p.id));
if (reviewed.size !== record.pages.length) errors.push('Duplicate survey ID');
for (const id of expected) if (!reviewed.has(id)) errors.push(`Report survey missing: ${id}`);
for (const page of record.pages) {
  const text = notes.get(page.id);
  if (!text) { errors.push(`Missing survey ${page.id}`); continue; }
  if (!text.includes('\\taxon{Outline}')) errors.push(`${page.id}: not an outline`);
  if (fs.readFileSync(path.join(root, page.path), 'utf8') !== text) errors.push(`${page.id}: path mismatch`);
  const paragraphs = text.split('\n').filter(line => line.startsWith('\\p{'));
  const linkedParagraphs = paragraphs.filter(line => links(line).length > 0).length;
  if (paragraphs.length < 5 || linkedParagraphs < 4) errors.push(`${page.id}: narrative replaced by a short directory`);
  if (/\\(?:ol|ul)\{/.test(text)) errors.push(`${page.id}: catalogue reintroduced into survey`);
  if (!page.question) errors.push(`${page.id}: missing editorial question`);
  for (const id of links(text)) if (!notes.has(id)) errors.push(`${page.id}: broken link ${id}`);
  const reached = new Set();
  const queue = [page.id];
  while (queue.length) {
    const id = queue.pop();
    if (reached.has(id) || !notes.has(id)) continue;
    reached.add(id);
    queue.push(...links(notes.get(id)));
  }
  for (const id of page.previous_targets) {
    if (!reached.has(id)) errors.push(`${page.id}: lost access to original topic ${id}`);
  }
  rows.push({id: page.id, paragraphs: paragraphs.length, linkedParagraphs});
}
console.log(JSON.stringify({surveys: rows.length, pages: rows, errors,
  limitation: 'Checks prose structure, report coverage and reachability, not narrative quality or mathematical truth.'}, null, 2));
if (errors.length) process.exitCode = 1;
