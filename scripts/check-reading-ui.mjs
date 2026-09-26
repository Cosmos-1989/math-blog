import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'output/math-blog');
for (const file of ['tree.xsl', 'reading.css', 'reading.js', 'shulin-mark.svg']) {
  assert.equal(fs.readFileSync(path.join(output, file), 'utf8'), fs.readFileSync(path.join(root, 'theme-overrides', file), 'utf8'), `Stale theme: ${file}`);
}
const pages = ['index', '0062', '013Z', '004M', '004R', '003J'];
for (const id of pages) {
  const html = execFileSync('xsltproc', [path.join(output, 'default.xsl'), path.join(output, id, 'index.xml')], { encoding: 'utf8' });
  for (const marker of ['lang="zh-CN"', 'reading.css?v=', 'reading.js?v=', 'id="main-content"', 'class="tree-content"', 'class="search-trigger"']) {
    assert(html.includes(marker), `${id}: missing ${marker}`);
  }
  assert(!/September|April|March/.test(html), `${id}: unlocalized date`);
  assert(html.includes('數林廣記'), `${id}: missing site name`);
  assert(html.includes('shulin-mark.svg?v='), `${id}: missing site mark`);
  assert(!/数学博客作者|数学博客首页/.test(html), `${id}: stale branding`);
  if (id === 'index') assert(html.includes('依然范德彪'), 'Missing author name');
}
console.log('Reading theme: generated assets and six representative XSL transformations passed.');

// Browser checks are optional so CI can run the static checks without installing a browser.
if (process.env.PLAYWRIGHT_MODULE) {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  const base = process.env.PREVIEW_URL || 'http://localhost:8083/math-blog/';
  const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'forester-reading-'));
  const errors = [];
  try {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      for (const id of pages) {
        await page.goto(`${base}${id}/index.xml`, { waitUntil: 'commit' });
        await page.locator('.search-trigger:not([disabled])').waitFor();
        await page.evaluate(() => document.fonts.ready);
        assert(await page.locator('.site-mark').evaluate(img => img.complete && img.naturalWidth > 0), 'Site mark failed to load');
        const geometry = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
        assert(geometry.scroll <= geometry.width + 1, `${id} at ${width}: page overflows horizontally ${JSON.stringify(geometry)}`);
        if (['004M', '004R', '003J'].includes(id)) assert(await page.locator('.katex').count() > 0, `${id}: formulas not rendered`);
        if (id === '003J') {
          const images = await page.locator('article figure img').evaluateAll(nodes => nodes.map(img => img.complete && img.naturalWidth > 0));
          assert(images.length && images.every(Boolean), 'Sterling diagrams failed to load');
        }
        if (['004M', '004R'].includes(id)) {
          const background = await page.locator('article > section > details > .tree-content').evaluate(el => getComputedStyle(el).backgroundColor);
          assert.equal(background, id === '004M' ? 'rgb(255, 252, 241)' : 'rgb(242, 250, 255)');
        }
        await page.screenshot({ path: path.join(shots, `${id}-${width}.png`), fullPage: false });
      }
      await page.locator('.search-trigger').click();
      await page.waitForFunction(() => document.querySelector('ninja-keys').visible);
      await page.keyboard.type('Bessel');
      await page.locator('ninja-action').filter({ hasText: 'Bessel' }).first().waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('ninja-keys').visible);
      await page.keyboard.press('/');
      await page.waitForFunction(() => document.querySelector('ninja-keys').visible);
      await page.keyboard.press('Escape');
      await page.locator('article > section > details > summary').click();
      assert.equal(await page.locator('article > section > details').getAttribute('open'), null);
      await page.locator('article > section > details > summary').click();
      assert.notEqual(await page.locator('article > section > details').getAttribute('open'), null);
      assert(await page.locator('footer a.heading-link').count() > 0, 'Related titles must be links');
      await page.route('**/__reading_fixture__/index.xml', route => route.fulfill({
        contentType: 'text/xml', body: fs.readFileSync(path.join(root, 'scripts/fixtures/reading.xml'), 'utf8'),
      }));
      await page.goto(`${base}__reading_fixture__/index.xml`, { waitUntil: 'commit' });
      await page.locator('.search-trigger:not([disabled])').waitFor();
      const toc = page.locator('.toc-panel');
      assert.equal(await toc.getAttribute('open') !== null, width > 1050, 'Responsive TOC default');
      if (width <= 1050) await toc.locator('summary').click();
      const proofLink = page.locator('.toc-anchor').filter({ hasText: '证明样本' });
      await proofLink.focus();
      await page.keyboard.press('Enter');
      assert(await page.locator('section[data-taxon="Proof"] > details').evaluate(el => el.open), 'Keyboard TOC opens collapsed proof');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 1, `Nested content overflows at ${width}`);
      await page.screenshot({ path: path.join(shots, `nested-${width}.png`), fullPage: true });
      await page.close();
    }
    assert.deepEqual(errors, [], 'Browser errors');
    console.log(`Desktop / mobile / narrow-mobile checks passed; screenshots: ${shots}`);
  } finally {
    await browser.close();
  }
}
