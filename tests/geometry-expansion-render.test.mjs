import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {root} from '../scripts/site-config.mjs';

if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE to an installed Playwright module');
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE);
const batches = ['shen', 'xie', 'zhuang', 'integration'].map(name =>
  JSON.parse(fs.readFileSync(path.join(root, `research/geometry-${name}.json`), 'utf8')));
const ids = [...new Set(batches.flatMap(batch => batch.entries.map(([id]) => id)))];
const outlines = batches.flatMap(batch => Object.values(batch.papers ?? {}).map(paper => paper.outline));
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), `trees/${file}`]));
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8083/';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'geometry-expansion-render-'));
const browser = await chromium.launch({headless: true, args: ['--disable-blink-features=XSLT'],
  ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
const errors = [], checks = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({viewport: {width, height: 1000}, reducedMotion: 'reduce'});
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    for (const id of ids) {
      const response = await page.goto(`${base}${id}/`, {waitUntil: 'load'});
      assert.equal(response.status(), 200, `${id}: HTTP status`);
      await page.locator('.search-trigger:not([disabled])').waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => typeof XSLTProcessor), 'undefined');
      assert.equal(await page.locator('.katex-error').count(), 0, `${id}: invalid math`);
      const content = await page.locator('article > section > details > .tree-content').innerText();
      assert(content.trim().length > 30, `${id}: empty body`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 1, `${id} at ${width}: horizontal overflow ${overflow}`);
      const clippedFormulas = await page.locator('.katex-display').evaluateAll(displays =>
        displays.filter(display => display.scrollWidth > display.clientWidth + 1
          && !['auto', 'scroll'].includes(getComputedStyle(display).overflowX)).length);
      assert.equal(clippedFormulas, 0, 'Wide display formulas must remain horizontally scrollable');
      const formulas = await page.locator('article .katex').count();
      const source = fs.readFileSync(path.join(root, files.get(id)), 'utf8');
      if (source.includes('#{')) assert(formulas > 0, `${id}: math was not typeset`);
      if (id === '0064') for (const outline of outlines) {
        assert.equal(await page.locator(`article > section > details > .tree-content a[href="/${outline}/"]`).count(), 1);
      }
      checks.push({id, width, formulas, overflow});
      if (outlines.includes(id) || ['0M00', '0M01', '0M03', '0L0A', '0K0Z'].includes(id)) {
        await page.screenshot({path: path.join(screenshots, `${id}-${width}.png`), fullPage: true});
        await page.screenshot({path: path.join(screenshots, `${id}-${width}-viewport.png`)});
        await page.locator('article > section > details > .tree-content').screenshot({
          path: path.join(screenshots, `${id}-${width}-body.png`)});
      }
    }
    await page.close();
  }
  const page = await browser.newPage();
  for (const [id, query, title] of [
    ['0J00', '阿贝尔纤维化', '阿贝尔纤维化：分解、反常滤过与内蕴上同调环'],
    ['0K00', '复动力系统的刚性', '复动力系统的刚性：乘子谱与动力 André–Oort'],
    ['0L00', 'klt 奇点的局部体积', 'klt 奇点的局部体积与稳定退化'],
  ]) {
    await page.goto(`${base}0064/`);
    await page.locator('.search-trigger:not([disabled])').click();
    await page.keyboard.insertText(query);
    const result = page.locator('ninja-action').filter({hasText: title}).first();
    await result.waitFor({state: 'visible'});
    await result.click();
    await page.waitForURL(`${base}${id}/`);
    await page.waitForLoadState('load');
    assert((await page.locator('article').innerText()).includes(title));
  }
  for (const id of outlines) {
    await page.goto(`${base}${id}/index.xml`, {waitUntil: 'commit'});
    await page.waitForURL(`${base}${id}/`);
    await page.waitForLoadState('load');
    assert.equal(await page.locator('article').count(), 1, `${id}: legacy route`);
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({result: 'pass', pages: ids.length, checks, screenshots,
    scope: 'Desktop/mobile rendering, formulas, direct and search navigation, and legacy XML routes. Mathematical review is recorded separately.'}, null, 2));
} finally {
  await browser.close();
}
