import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { output, staticRoot, staticOutput, siteUrl, basePath } from './site-config.mjs';

const entries = JSON.parse(fs.readFileSync(path.join(output, 'forest.json'), 'utf8'));
const decode = value => value.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, entity => {
  const name = entity.slice(1, -1);
  if (name.startsWith('#')) return String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : +name.slice(1));
  return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[name];
});
const pages = new Map();
for (const entry of entries) {
  const html = fs.readFileSync(path.join(staticRoot, entry.route, 'index.html'), 'utf8');
  assert(/^<!DOCTYPE html\b/i.test(html), `${entry.uri}: missing HTML doctype`);
  assert(html.includes('<meta charset="UTF-8">'), `${entry.uri}: missing charset`);
  assert(html.includes(`href="${new URL(entry.route, siteUrl).href}"`), `${entry.uri}: missing canonical URL`);
  assert(html.includes('id="main-content"') && html.includes('class="tree-content"'), `${entry.uri}: empty page`);
  assert(!/<\?xml|<fr:|\.xsl["?]|http-equiv="refresh"|<script[^>]+\/>/.test(html), `${entry.uri}: browser transformation or redirect remains`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => decode(match[1]));
  assert.equal(new Set(ids).size, ids.length, `${entry.uri}: duplicate element IDs`);
  pages.set(entry.route, { html, ids: new Set(ids) });
  for (const prefix of [basePath, ...(basePath === '/' ? ['/math-blog/'] : [])]) {
    const legacy = fs.readFileSync(path.join(staticRoot, prefix, entry.uri, 'index.xml'), 'utf8');
    assert(legacy.includes('xmlns="http://www.w3.org/1999/xhtml"'), `${entry.uri}: XML route is not XHTML`);
    assert(legacy.includes(`data-redirect="${entry.route}"`), `${entry.uri}: wrong legacy target`);
    assert(!/xml-stylesheet|\.xsl/.test(legacy), `${entry.uri}: legacy route uses XSLT`);
    if (prefix === '/math-blog/') {
      assert(fs.readFileSync(path.join(staticRoot, prefix, entry.uri, 'index.html'), 'utf8').includes(`data-redirect="${entry.route}"`));
    }
  }
}
let links = 0, resources = 0, fragments = 0;
for (const [route, { html }] of pages) {
  for (const match of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    const url = new URL(decode(match[2]), new URL(route, siteUrl));
    if (url.origin !== siteUrl.origin) continue;
    const target = decodeURIComponent(url.pathname);
    assert(!target.endsWith('.xml') && !target.endsWith('.xsl') && !target.startsWith('/math-blog/'), `${route}: noncanonical target ${target}`);
    const note = pages.get(target);
    if (note) {
      links++;
      if (url.hash) {
        fragments++;
        assert(note.ids.has(decodeURIComponent(url.hash.slice(1))), `${route}: missing anchor ${url.href}`);
      }
    } else {
      const file = path.join(staticRoot, target);
      assert(fs.statSync(file).isFile(), `${route}: missing resource ${target}`);
      resources++;
    }
  }
}
assert.deepEqual(fs.readFileSync(path.join(staticOutput, 'forest.json')), fs.readFileSync(path.join(output, 'forest.json')));
assert.deepEqual(fs.readFileSync(path.join(staticOutput, 'index.html')), fs.readFileSync(path.join(staticOutput, 'index/index.html')));
for (const file of ['style.css', 'reading.css', 'reading.js', 'forester.js', 'katex.min.css', 'shulin-mark.svg']) {
  assert.deepEqual(fs.readFileSync(path.join(staticOutput, file)), fs.readFileSync(path.join(output, file)), `Changed theme asset: ${file}`);
}
for (const file of fs.readdirSync(staticOutput)) assert(!file.endsWith('.xsl'), `Public stylesheet: ${file}`);
assert.equal(fs.readFileSync(path.join(staticRoot, 'CNAME'), 'utf8').trim(), siteUrl.hostname);
assert(fs.existsSync(path.join(staticRoot, '.nojekyll')));
console.log(`Static website: ${pages.size} HTML pages; ${links} internal links, ${fragments} anchors, ${resources} resource references; legacy URLs and unchanged theme/search assets passed.`);
