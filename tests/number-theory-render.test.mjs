import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE to an installed Playwright module');
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'research/icm2026-number-theory.json'), 'utf8'));
const pages = ['0063', ...manifest.papers.map(paper => paper.outline), '0H0J', '0H47', '0GC4', '0GS8',
  '0H84', '0HC4', '0HG4', '0HL3', '0HO2', '0HS3', '0HW3', '0I03', '0I42', '0I84', '0I8E', '0I8G'];
const base = process.env.PREVIEW_URL ?? 'http://localhost:8083/';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'number-theory-render-'));
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
    for (const id of pages) {
      await page.goto(`${base}${id}/`, {waitUntil: 'load'});
      await page.locator('.search-trigger:not([disabled])').waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.katex-error').count(), 0, `${id}: invalid formula`);
      const size = await page.evaluate(() => ({width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth}));
      assert(size.scroll <= size.width + 1, `${id} at ${width}: horizontal overflow`);
      const content = await page.locator('article > section > details > .tree-content').innerText();
      assert(content.length > 100, `${id}: empty or untransformed body`);
      assert.equal(await page.evaluate(() => typeof XSLTProcessor), 'undefined');
      assert(!(await page.locator('body').innerText()).includes('This site uses XSLT'));
      if (id === '0063') {
        for (const paper of manifest.papers) {
          assert.equal(await page.locator(`article > section > details > .tree-content > ul > li a[href="/${paper.outline}/"]`).count(), 1,
            `Missing or duplicate report ${paper.outline}`);
        }
      }
      const formulas = await page.locator('article .katex').count();
      if (id !== '0063') assert(formulas > 0, `${id}: formulas not rendered`);
      checks.push({id, width, formulas, bodyCharacters: content.length, horizontalOverflow: size.scroll - size.width});
      if (['0063', '0G40', '0H40', '0H0J', '0I84', '0I8E', '0H84', '0HC4', '0I42'].includes(id)) {
        await page.screenshot({path: path.join(directory, `${id}-${width}.png`), fullPage: false});
      }
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({result: 'pass', checks, screenshots: directory,
    scope: 'Rendered desktop/mobile smoke checks; source checks separately cover all formulas and links.'}, null, 2));
} finally {
  await browser.close();
}
