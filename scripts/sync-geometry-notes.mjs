import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
const record = read('research/site-polish-geometry.json');
const register = read('research/site-evergreen-audit.json');
const manifest = read('research/icm2026-geometry.json');
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const snapshots = new Map();
for (const [id, review] of Object.entries(record.reviews)) {
  if (!files.has(id)) throw new Error(`Missing reviewed page ${id}`);
  const file = files.get(id);
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const title = text.match(/\\title\{([^}]+)\}/)?.[1];
  const taxon = text.match(/\\taxon\{([^}]+)\}/)?.[1];
  register.reviews[id] = {...register.reviews[id], ...review, title};
  if (taxon === 'Outline') delete register.prerequisites[id];
  else register.prerequisites[id] = record.prerequisites[id] ?? [];
  snapshots.set(id, {id, title, taxon, path: file,
    sha256: crypto.createHash('sha256').update(text).digest('hex')});
}
manifest.notes = manifest.new_note_ids.map(id => {
  if (!snapshots.has(id)) throw new Error(`Unreviewed geometry page ${id}`);
  return snapshots.get(id);
});
write('research/site-evergreen-audit.json', register);
write('research/icm2026-geometry.json', manifest);
console.log(JSON.stringify({updatedReviews: snapshots.size, newPages: manifest.notes.length}));
