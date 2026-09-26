import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['tree.xsl', 'reading.css', 'reading.js', 'shulin-mark.svg']) {
  fs.copyFileSync(path.join(root, 'theme-overrides', file), path.join(root, 'theme', file));
}
console.log('Applied reading theme and Chinese labels.');
