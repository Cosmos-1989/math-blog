import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {groupEnd, prose} from './note-editorial-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, data) => fs.writeFileSync(path.join(root, name), JSON.stringify(data, null, 2) + '\n');
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const notes = new Map();
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive: true}).filter(f => f.endsWith('.tree')).sort()) {
  const id = path.basename(file, '.tree');
  assert(!notes.has(id), `Duplicate note ${id}`);
  const text = fs.readFileSync(path.join(root, 'trees', file), 'utf8');
  notes.set(id, {id, path: `trees/${file}`, text,
    title: text.match(/\\title\{([^}]+)\}/)?.[1],
    taxon: text.match(/\\taxon\{([^}]+)\}/)?.[1] ?? 'Outline'});
}

const register = read('research/site-evergreen-audit.json');
const records = fs.readdirSync(path.join(root, 'research')).filter(f => /^readability-2026-09-29-[a-z]+\.json$/.test(f)).sort();
const reviewed = new Set(), changed = new Set(), added = new Set(), groups = [];
for (const file of records) {
  const record = read(`research/${file}`);
  for (const field of ['reviewed', 'changed', 'added']) {
    assert(Array.isArray(record[field]), `${file}: missing ${field}`);
    for (const id of record[field]) assert(notes.has(id), `${file}: unknown ${id}`);
  }
  const covered = new Set(record.reviewed);
  for (const id of covered) assert(record.reviews?.[id]?.reason, `${file}: reviewed page ${id} has no decision`);
  for (const id of [...record.changed, ...record.added]) assert(covered.has(id), `${file}: changed page ${id} not reviewed`);
  record.reviewed.forEach(id => reviewed.add(id));
  record.changed.forEach(id => changed.add(id));
  record.added.forEach(id => added.add(id));
  for (const [id, review] of Object.entries(record.reviews ?? {})) {
    assert(covered.has(id), `${file}: decision outside review scope: ${id}`);
    assert(review.reason, `${file}: missing reason for ${id}`);
    register.reviews[id] = {...register.reviews[id], ...review, title: notes.get(id).title};
  }
  for (const [id, prerequisites] of Object.entries(record.prerequisites ?? {})) {
    assert(covered.has(id), `${file}: dependency edit outside review scope: ${id}`);
    assert(Array.isArray(prerequisites), `${id}: prerequisites must be an array`);
    if (['Outline', 'Chapter'].includes(notes.get(id).taxon)) delete register.prerequisites[id];
    else register.prerequisites[id] = prerequisites;
  }
  for (const split of record.splits ?? []) {
    assert(notes.has(split.original), `${file}: split has no original`);
    // A retained atomic definition can shed independent material without becoming an outline.
    if (notes.get(split.original).taxon === 'Outline') register.splits[split.original] = split.new_ids;
  }
  groups.push({file, scope: record.scope, reviewed: covered.size, changed: record.changed.length,
    added: record.added.length, remaining: record.remaining ?? []});
}

// Refresh metadata only for explicitly reviewed pages; never replay older dependency decisions.
for (const subject of ['logic', 'algebra', 'geometry', 'number-theory']) {
  const file = `research/icm2026-${subject}.json`, manifest = read(file);
  for (const note of manifest.notes) {
    if (!reviewed.has(note.id)) continue;
    const current = notes.get(note.id);
    Object.assign(note, {title: current.title, taxon: current.taxon});
    if (note.sha256) note.sha256 = digest(current.text);
  }
  if (subject === 'number-theory') {
    for (const entry of manifest.entries) {
      if (reviewed.has(entry[0])) entry[1] = register.prerequisites[entry[0]] ?? [];
    }
  }
  write(file, manifest);
}
register.readability_review = {date: '2026-09-29', records,
  scope: '逐页语义阅读限于各记录的 reviewed；全站结构扫描另列，不作为数学完备性证明。'};
write('research/site-evergreen-audit.json', register);

const inventory = [...notes.values()].map(note => {
  const paragraphs = [...note.text.matchAll(/\\p\{/g)].map(match => {
    const end = groupEnd(note.text, match.index + 2);
    return prose(note.text.slice(match.index + 3, end - 1)).replace(/\\\w+|[{}\s]/g, '').length;
  });
  const atomic = !['Outline', 'Chapter', 'Reference', 'Person'].includes(note.taxon);
  const candidates = [];
  if (atomic && Math.max(0, ...paragraphs) > 200) candidates.push('long-prose-paragraph');
  if (atomic && paragraphs.length > 10) candidates.push('long-knowledge-note');
  return {id: note.id, path: note.path, title: note.title, taxon: note.taxon,
    sha256: digest(note.text), semanticReview: reviewed.has(note.id),
    paragraphCount: paragraphs.length, longestProseParagraph: Math.max(0, ...paragraphs), candidates};
});
const result = {date: '2026-09-29', scanned: notes.size, semanticallyReviewed: reviewed.size,
  changed: changed.size, added: added.size, groups,
  recordHistory: '各组 remaining 保留该批次结束时的记录；后续批次可能已处理。当前未审阅页面以 notSemanticallyReviewed 为准。',
  notSemanticallyReviewed: inventory.filter(n => !n.semanticReview).map(n => n.id),
  limitation: 'Paragraph metrics find candidates only. They cannot establish atomicity, readability or completeness of proofs.',
  pages: inventory};
write('research/readability-2026-09-29.json', result);
console.log(JSON.stringify({scanned: notes.size, semanticallyReviewed: reviewed.size,
  changed: changed.size, added: added.size, candidates: inventory.filter(n => n.candidates.length).length,
  groups: groups.map(({file, reviewed, changed, added}) => ({file, reviewed, changed, added}))}, null, 2));
