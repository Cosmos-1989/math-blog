import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {bodyLinks} from './note-prerequisite-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, data) => fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
const notes = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => {
    const text = fs.readFileSync(path.join(root, 'trees', file), 'utf8');
    const id = path.basename(file, '.tree');
    return [id, {id, path: `trees/${file}`, text,
      title: text.match(/\\title\{([^}]+)\}/)?.[1],
      taxon: text.match(/\\taxon\{([^}]+)\}/)?.[1] ?? 'Outline',
      sha256: crypto.createHash('sha256').update(text).digest('hex')}];
  }));
const recordFiles = fs.readdirSync(path.join(root, 'research'))
  .filter(file => /^prerequisite-review-2026-10-12-[\w-]+\.json$/.test(file)).sort();
const register = read('research/site-evergreen-audit.json');
const updated = new Set(), readIds = new Set(), scannedIds = new Set(), added = new Set();
const required = {date: '2026-10-12', records: recordFiles, pages: {}};
const unresolved = [], decisions = [], groups = [];
const previousFile = path.join(root, 'research/prerequisite-review-2026-10-12.json');
const previousDecisions = fs.existsSync(previousFile)
  ? JSON.parse(fs.readFileSync(previousFile, 'utf8')).candidate_decisions ?? [] : [];
function reviewHash(decision, file) {
  if (decision.sha256) return decision.sha256;
  const previous = previousDecisions.find(item => item.id === decision.id && item.record === file
    && (item.term ?? item.label) === (decision.term ?? decision.label)
    && item.target === decision.target && item.actualTarget === decision.actualTarget
    && item.decision === decision.decision && item.reason === decision.reason);
  // Synchronizing metadata must not silently renew an unchanged editorial decision.
  return previous?.sha256 ?? notes.get(decision.id).sha256;
}
for (const file of recordFiles) {
  const record = read(`research/${file}`);
  for (const id of record.scanned_ids) { assert(notes.has(id), `${file}: absent scanned page ${id}`); scannedIds.add(id); }
  for (const id of record.read_ids) { assert(notes.has(id), `${file}: absent read page ${id}`); readIds.add(id); }
  for (const id of record.new_note_ids) { assert(notes.has(id), `${file}: absent new page ${id}`); added.add(id); }
  for (const [id, dependencies, reason] of record.entries) {
    const note = notes.get(id);
    assert(note, `${file}: unknown entry ${id}`);
    assert(reason && Array.isArray(dependencies), `${file}: incomplete entry ${id}`);
    assert(!updated.has(id), `Overlapping review ownership: ${id}`);
    updated.add(id);
    const atomic = !['Outline', 'Chapter', 'Reference', 'Person'].includes(note.taxon);
    const actual = new Set(bodyLinks(note.text).map(link => link.target));
    const targets = [...new Set(dependencies)];
    for (const target of targets) {
      assert(actual.has(target), `${id}: dependency ${target} not linked in body`);
      assert(notes.has(target), `${id}: dependency ${target} has no page`);
      assert(!['Outline', 'Chapter', 'Reference', 'Person'].includes(notes.get(target).taxon), `${id}: non-atomic dependency ${target}`);
    }
    register.reviews[id] = {...register.reviews[id], title: note.title,
      prerequisite_review: {date: record.date, record: file, reason,
        scope: record.read_ids.includes(id) ? '全文阅读并核对本轮识别的术语与直接前置' : '已识别术语及其上下文核对；不记为全文语义审查'},
      ...(register.reviews[id] ? {} : {action: 'new-prerequisite-definition', reason})};
    if (atomic) register.prerequisites[id] = targets;
    else delete register.prerequisites[id];
    required.pages[id] = {targets: atomic ? targets : [], sha256: note.sha256};
  }
  for (const issue of record.unresolved ?? []) unresolved.push({...issue, record: file});
  for (const decision of record.candidate_decisions ?? []) {
    assert(decision.reason, `${file}: candidate decision lacks reason`);
    assert(notes.has(decision.id), `${file}: candidate decision has no page`);
    decisions.push({...decision, record: file, sha256: reviewHash(decision, file)});
  }
  for (const decision of record.target_candidate_decisions ?? []) {
    assert(decision.reason && notes.has(decision.id), `${file}: invalid link-target review`);
    const normalized = {...decision, term: decision.term ?? decision.label,
      actualTarget: decision.actualTarget ?? decision.target, kind: 'target'};
    decisions.push({...normalized, record: file, sha256: reviewHash(normalized, file)});
  }
  groups.push({record: file, scope: record.scope, scanned: record.scanned_ids.length,
    read: record.read_ids.length, entries: record.entries.length, added: record.new_note_ids.length});
}
// Catch integration cycles before publishing a register that only looks complete.
const active = new Set(), finished = new Set();
function visit(id, route = []) {
  assert(!active.has(id), `Prerequisite cycle: ${[...route, id].join(' -> ')}`);
  if (finished.has(id)) return;
  active.add(id);
  for (const target of register.prerequisites[id] ?? []) visit(target, [...route, id]);
  active.delete(id); finished.add(id);
}
for (const id of Object.keys(register.prerequisites)) visit(id);
register.prerequisite_review = {date: '2026-10-12', records: recordFiles,
  scope: '正文术语扫描与分学科补充。scanned_ids、read_ids 及逐项决定分别记录；不由链接数量推断数学内容完备。'};
write('research/site-evergreen-audit.json', register);
write('research/prerequisite-required-links.json', required);
for (const subject of ['logic', 'algebra', 'geometry', 'number-theory']) {
  const file = `research/icm2026-${subject}.json`, manifest = read(file);
  for (const entry of manifest.notes) {
    if (!updated.has(entry.id)) continue;
    const note = notes.get(entry.id);
    Object.assign(entry, {title: note.title, taxon: note.taxon});
    if (entry.sha256) entry.sha256 = note.sha256;
  }
  if (subject === 'number-theory') for (const entry of manifest.entries) {
    if (updated.has(entry[0])) entry[1] = register.prerequisites[entry[0]] ?? [];
  }
  write(file, manifest);
}
const inventory = [...notes.values()].map(({id, path, title, taxon, sha256}) => ({id, path, title, taxon, sha256,
  terminologyScan: scannedIds.has(id), fullTextReadThisPass: readIds.has(id), changedOrReviewedEntry: updated.has(id)}));
write('research/prerequisite-review-2026-10-12.json', {date: '2026-10-12',
  scannedPages: scannedIds.size, fullTextReadPages: readIds.size, entryPages: updated.size, addedPages: added.size,
  method: 'Coverage distinguishes lexical scanning, full-text reading and repairs. A prerequisite path is checked structurally, not a proof of exhaustiveness.',
  groups, unresolved, candidate_decisions: decisions, pages: inventory});
console.log(JSON.stringify({scanned: scannedIds.size, fullTextRead: readIds.size, entries: updated.size,
  added: added.size, unresolved: unresolved.length, groups}, null, 2));
