import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { root, output, basePath, siteUrl, staticRoot } from './site-config.mjs';

const escape = text => String(text).replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);

export function renderHtml(file) {
  let html = execFileSync('xsltproc', ['--nonet', path.join(root, 'scripts/static-html.xsl'), file],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  // libxslt versions differ: some use sequential IDs, others memory addresses.
  // Chrome used id1, id2, ... in first-use order. Preserve that bookmark format
  // and make repeated builds byte-identical, including forward references.
  const generated = new Set([...html.matchAll(/<details\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]));
  const anchors = new Map();
  html = html.replace(/(\b(?:id|href|data-target)=")(#?)([^"\s]+)(")/g, (attribute, start, hash, id, end) => {
    if (!generated.has(id)) return attribute;
    if (!anchors.has(id)) anchors.set(id, `id${anchors.size + 1}`);
    return `${start}${hash}${anchors.get(id)}${end}`;
  });
  return html.replace(/^<!DOCTYPE html[^>]*>/, '<!DOCTYPE html>');
}

export function legacyPage(route, title, xml = false) {
  // .xml URLs are served as XML by GitHub Pages. A well-formed XHTML landing
  // document executes the redirect without any stylesheet or XSLT processor.
  return `${xml ? '<?xml version="1.0" encoding="UTF-8"?>\n' : ''}<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN" data-redirect="${escape(route)}">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title><link rel="canonical" href="${escape(new URL(route, siteUrl).href)}" />
<meta name="robots" content="noindex" />
<script src="${basePath}legacy-url.js"></script>
<noscript><meta http-equiv="refresh" content="0;url=${escape(route)}" /></noscript>
</head><body><p><a href="${escape(route)}">${escape(title)}</a></p></body></html>\n`;
}

export function buildStaticHtml() {
  const entries = JSON.parse(fs.readFileSync(path.join(output, 'forest.json'), 'utf8'));
  if (!Array.isArray(entries) || !entries.length) throw new Error('Build Forester before generating HTML');
  const ids = new Set();
  for (const entry of entries) {
    if (!/^[A-Za-z0-9_-]+$/.test(entry.uri) || entry.route !== `${basePath}${entry.uri}/` || ids.has(entry.uri)) {
      throw new Error(`Invalid or duplicate note route: ${entry.route}`);
    }
    ids.add(entry.uri);
  }
  if (!ids.has('index')) throw new Error('Missing homepage');
  fs.mkdirSync(path.dirname(staticRoot), { recursive: true });
  const staging = fs.mkdtempSync(path.join(path.dirname(staticRoot), '.static-'));
  const destination = path.join(staging, basePath);
  const write = (route, content) => {
    const file = path.join(staging, route);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  try {
    fs.mkdirSync(destination, { recursive: true });
    // Copy resources, never old note directories, generated redirects or XSLT.
    for (const entry of fs.readdirSync(output, { withFileTypes: true })) {
      if (ids.has(entry.name) || entry.name.startsWith('.') || entry.name === 'math-blog') continue;
      if (entry.isDirectory() && entry.name !== 'fonts') continue;
      if (entry.isFile() && !/\.(?:css|js|json|svg|png|ico|jpg|jpeg|webp|pdf|woff2?|ttf|otf)$/.test(entry.name)) continue;
      if (/^package(?:-lock)?\.json$/.test(entry.name)) continue;
      fs.cpSync(path.join(output, entry.name), path.join(destination, entry.name), { recursive: true });
    }
    fs.copyFileSync(path.join(root, 'theme-overrides/legacy-url.js'), path.join(destination, 'legacy-url.js'));
    for (const [index, entry] of entries.entries()) {
      const html = renderHtml(path.join(output, entry.uri, 'index.xml'));
      if (!html.includes('id="main-content"') || /<\?xml-stylesheet/.test(html)) {
        throw new Error(`Invalid static HTML: ${entry.uri}`);
      }
      write(`${entry.route}index.html`, html);
      write(`${entry.route}index.xml`, legacyPage(entry.route, entry.title, true));
      if (basePath === '/') {
        write(`/math-blog/${entry.uri}/index.html`, legacyPage(entry.route, entry.title));
        write(`/math-blog/${entry.uri}/index.xml`, legacyPage(entry.route, entry.title, true));
      }
      if ((index + 1) % 500 === 0) console.log(`Static HTML: ${index + 1}/${entries.length}`);
    }
    // Serve real content at the root too; its canonical address stays /index/.
    fs.copyFileSync(path.join(destination, 'index/index.html'), path.join(destination, 'index.html'));
    if (basePath === '/') write('/math-blog/index.html', legacyPage('/index/', '數林廣記'));
    fs.copyFileSync(path.join(root, 'CNAME'), path.join(staging, 'CNAME'));
    fs.writeFileSync(path.join(staging, '.nojekyll'), '');
    fs.rmSync(staticRoot, { recursive: true, force: true });
    fs.renameSync(staging, staticRoot);
    console.log(`Published directory ready: ${staticRoot} (${entries.length} HTML pages, XML and /math-blog/ compatibility routes).`);
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildStaticHtml();
