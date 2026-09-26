import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prose, styleRules, normalizeFormat} from './note-editorial-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = fs.readdirSync(path.join(root, 'trees'), {recursive:true}).filter(f => f.endsWith('.tree')).sort();
const exceptionsFile = path.join(root, 'research/note-editorial-exceptions.json');
const exceptions = fs.existsSync(exceptionsFile) ? JSON.parse(fs.readFileSync(exceptionsFile, 'utf8')) : {};
const errors = [], candidates = [], format = [];
for (const file of files) {
  const text = fs.readFileSync(path.join(root, 'trees', file), 'utf8');
  const id = path.basename(file, '.tree'), plain = prose(text);
  const taxon = text.match(/\\taxon\{([^}]+)\}/)?.[1];
  if (taxon && !['Person','Reference','Outline','Chapter'].includes(taxon)) {
    for (const field of ['title','date','author']) {
      if (!new RegExp('^\\\\'+field+'\\{','m').test(text)) errors.push({id,rule:'missing-metadata',text:field});
    }
  }
  if (normalizeFormat(text) !== text) format.push(id);
  if (/\\meta\{proof-status\}\{(?:完整|全部)/.test(text)) errors.push({id,rule:'self-assessment-metadata',text:'Replace self-assessment with mathematical content or a precise source.'});
  for (const [rule, pattern] of styleRules) {
    for (const m of plain.matchAll(pattern)) {
      if (exceptions[id]?.[rule]?.includes(m[0])) continue;
      errors.push({id, rule, line:plain.slice(0, m.index).split('\n').length, text:m[0]});
    }
  }
  if (/\\p\{前置[：:]/.test(text)) candidates.push({id, kind:'prerequisites-list'});
  if (/——|链条(?!件)|\bscheme\b/i.test(plain)) candidates.push({id, kind:'context-sensitive-wording'});
  if (/\\taxon\{(?:Definition|Construction)\}/.test(text) && /\\strong\{(?:例|定理|命题)/.test(text)) candidates.push({id, kind:'possible-multiple-topics'});
}
const result = {pages:files.length, errors, format, candidates};
const outputIndex = process.argv.indexOf('--output');
if (outputIndex >= 0) fs.writeFileSync(path.resolve(process.argv[outputIndex+1]), JSON.stringify(result, null, 2)+'\n');
console.log(JSON.stringify({pages:files.length, errors:errors.length, format:format.length, candidates:candidates.length, details:outputIndex < 0 ? errors : undefined}, null, 2));
if (errors.length || (process.argv.includes('--strict-format') && format.length)) process.exitCode = 1;
