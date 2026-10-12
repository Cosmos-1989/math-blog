import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bodyLinks, findTerms, linksInsideMath, shortDefinitionRules} from './note-prerequisite-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const notes = fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).sort().map(file => {
    const text = fs.readFileSync(path.join(root, 'trees', file), 'utf8');
    return {id: path.basename(file, '.tree'), path: `trees/${file}`, text,
      title: text.match(/\\title\{([^}]+)\}/)?.[1] ?? '',
      taxon: text.match(/\\taxon\{([^}]+)\}/)?.[1] ?? 'Outline'};
  });
const byId = new Map(notes.map(note => [note.id, note]));
const recordFiles = fs.readdirSync(path.join(root, 'research'))
  .filter(file => /^prerequisite-review-2026-10-12-[\w-]+\.json$/.test(file)).sort();
const records = recordFiles.map(file => JSON.parse(fs.readFileSync(path.join(root, 'research', file), 'utf8')));
const requiredFile = path.join(root, 'research/prerequisite-required-links.json');
const required = fs.existsSync(requiredFile) ? JSON.parse(fs.readFileSync(requiredFile, 'utf8')) : {pages: {}};
const errors = [];
for (const note of notes) for (const link of linksInsideMath(note.text)) {
  errors.push(`${note.id}:${link.line}: link ${link.target} appears inside a formula; move its explanation to prose`);
}
if (!fs.existsSync(requiredFile)) errors.push('Missing prerequisite-required-links.json; run the current review synchronization.');
const register = JSON.parse(fs.readFileSync(path.join(root, 'research/site-evergreen-audit.json'), 'utf8'));
for (const [id, entry] of Object.entries(required.pages)) {
  const note = byId.get(id);
  if (!note) { errors.push(`${id}: required page missing`); continue; }
  const sourceHash = crypto.createHash('sha256').update(note.text).digest('hex');
  if (entry.sha256 !== sourceHash) {
    errors.push(`${id}: prerequisite snapshot differs from source; review changes and synchronize the current records`);
  }
  const actual = new Set(bodyLinks(note.text).map(link => link.target));
  for (const target of entry.targets) {
    if (!actual.has(target)) errors.push(`${id}: required explanatory link ${target} missing`);
    if (!byId.has(target)) errors.push(`${id}: definition ${target} missing`);
    if (!(register.prerequisites[id] ?? []).includes(target)) errors.push(`${id}: reviewed prerequisite ${target} missing from register`);
    if (['Outline', 'Chapter', 'Reference', 'Person'].includes(byId.get(target)?.taxon)) {
      errors.push(`${id}: explanatory target ${target} is not an atomic knowledge note`);
    }
  }
}
const ruleMap = new Map(shortDefinitionRules(notes).map(rule => [rule.term + '\0' + rule.target, rule]));
for (const record of records) for (const rule of record.terms ?? []) {
  ruleMap.set(rule.term + '\0' + rule.target, rule);
  if (!byId.has(rule.target)) errors.push(`Unknown term target ${rule.term}: ${rule.target}`);
}
const rules = [...ruleMap.values()];
const candidates = notes.filter(note => !['Reference', 'Person'].includes(note.taxon))
  .flatMap(note => findTerms(note, rules));
const definitionsByName = new Map();
for (const note of notes.filter(note => note.taxon === 'Definition')) {
  if (!definitionsByName.has(note.title)) definitionsByName.set(note.title, []);
  definitionsByName.get(note.title).push(note.id);
}
const targetCandidates = [];
for (const note of notes) for (const link of bodyLinks(note.text)) {
  const definitions = definitionsByName.get(link.label);
  if (!definitions || definitions.includes(link.target) || !byId.has(link.target)) continue;
  targetCandidates.push({id: note.id, path: note.path, label: link.label, actualTarget: link.target,
    actualTitle: byId.get(link.target).title, definitionTargets: definitions,
    line: note.text.slice(0, link.index).split('\n').length});
}
const reviewFile = path.join(root, 'research/prerequisite-review-2026-10-12.json');
const decisions = fs.existsSync(reviewFile)
  ? JSON.parse(fs.readFileSync(reviewFile, 'utf8')).candidate_decisions ?? [] : [];
const hashes = new Map(notes.map(note => [note.id, crypto.createHash('sha256').update(note.text).digest('hex')]));
function matchingDecision(candidate) {
  return decisions.find(decision => decision.id === candidate.id
    && decision.sha256 === hashes.get(candidate.id)
    && (decision.term ?? decision.label) === (candidate.term ?? candidate.label)
    && (candidate.target ? decision.target === candidate.target
      : decision.actualTarget === candidate.actualTarget));
}
for (const candidate of [...candidates, ...targetCandidates]) {
  const decision = matchingDecision(candidate);
  if (decision) candidate.review = {decision: decision.decision, reason: decision.reason, record: decision.record};
}
const result = {date: '2026-10-12', scannedPages: notes.length, termRules: rules.length,
  requiredPages: Object.keys(required.pages).length, candidateCount: candidates.length,
  targetCandidateCount: targetCandidates.length,
  reviewedCandidates: candidates.filter(candidate => candidate.review).length,
  reviewedTargetCandidates: targetCandidates.filter(candidate => candidate.review).length,
  method: 'Exact definition titles and reviewed aliases in prose; formulas, metadata, URLs and existing links excluded. Candidates require mathematical reading; local definitions and longer constructions can satisfy a prerequisite without a direct link.',
  errors, candidates, targetCandidates};
const outIndex = process.argv.indexOf('--report');
if (outIndex >= 0) {
  if (!process.argv[outIndex + 1]) throw new Error('--report requires a file');
  fs.writeFileSync(path.resolve(process.argv[outIndex + 1]), JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify({...result, candidates: process.argv.includes('--details') ? candidates : undefined,
  targetCandidates: process.argv.includes('--details') ? targetCandidates : undefined}, null, 2));
if (errors.length) process.exitCode = 1;
