import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeFormat} from './note-editorial-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');
const changed = [];
for (const file of fs.readdirSync(path.join(root, 'trees'), {recursive:true}).filter(f => f.endsWith('.tree')).sort()) {
  const full = path.join(root, 'trees', file), before = fs.readFileSync(full, 'utf8'), after = normalizeFormat(before);
  if (after !== before) { changed.push(file); if (write) fs.writeFileSync(full, after); }
}
console.log(JSON.stringify({mode:write ? 'write' : 'check', changed}, null, 2));
if (!write && changed.length) process.exitCode = 1;
