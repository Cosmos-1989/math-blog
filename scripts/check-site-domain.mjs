import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, output, siteUrl, basePath } from './site-config.mjs';

assert.equal(fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim(), siteUrl.hostname);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const ids = walk(path.join(root, 'trees'))
  .filter(file => file.endsWith('.tree')).map(file => path.basename(file, '.tree'));
for (const id of ids) {
  const xml = fs.readFileSync(path.join(output, id, 'index.xml'), 'utf8');
  assert(xml.includes(`base-url="${basePath}"`), `${id}: wrong base path`);
  assert(xml.includes(`<fr:uri>${siteUrl.href}${id}/</fr:uri>`), `${id}: wrong canonical URI`);
  assert(!xml.includes('cosmos-1989.github.io/math-blog/'), `${id}: old public URL`);
  assert(!/(?:href|src)="\/math-blog\//.test(xml), `${id}: old resource/link path`);
}
const search = JSON.parse(fs.readFileSync(path.join(output, 'forest.json'), 'utf8'));
assert(Object.keys(search).length > 0, 'Missing search index');
for (const [id, entry] of Object.entries(search)) {
  assert(!JSON.stringify(entry).includes('/math-blog/'), `${id}: stale search URL`);
}
console.log(`Public domain ${siteUrl.hostname}: ${ids.length} page URIs, base paths and search index passed.`);
