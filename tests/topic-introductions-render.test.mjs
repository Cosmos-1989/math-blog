import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const review = JSON.parse(fs.readFileSync(path.join(root, 'research/narrative-review-2026-10-13.json'), 'utf8'));
if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE to an installed Playwright module');
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE);
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8083/';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'topic-introductions-'));
const browser = await chromium.launch({headless: true, args: ['--disable-blink-features=XSLT'],
  ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
const sample = new Set(['index', '0061', '0077', '0181', '0B40', '0GS0', '0200', '0N00']);
const errors = [], checks = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({viewport: {width, height: 1000}, reducedMotion: 'reduce'});
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    for (const note of review.pages) {
      await page.goto(`${base}${note.id}/`, {waitUntil: 'load'});
      await page.locator('.search-trigger:not([disabled])').waitFor();
      await page.evaluate(() => document.fonts.ready);
      const body = page.locator('article > section > details > .tree-content');
      const text = await body.innerText();
      assert(text.length > 80, `${note.id}: missing introduction`);
      assert.equal(await page.locator('.katex-error').count(), 0, `${note.id}: invalid formula`);
      assert.equal(await page.evaluate(() => typeof XSLTProcessor), 'undefined');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 1, `${note.id}/${width}: horizontal overflow ${overflow}`);
      if (note.id === 'index') {
        for (const phrase of ['ICM', 'Bourbaki', '渗透式', 'Deligne']) assert(text.includes(phrase));
        assert.equal(await body.locator(`a[href="${review.quote.url}"]`).count(), 1);
      }
      if (note.question) {
        assert(await body.locator(':scope > p').count() >= 5, `${note.id}: missing narrative paragraphs`);
        assert(await body.locator('.link.local > a').count() >= 4, `${note.id}: missing technical links`);
      }
      if (sample.has(note.id)) {
        await page.screenshot({path: path.join(screenshots, `${note.id}-${width}.png`)});
        if (note.id === '0077') {
          await page.evaluate(() => window.scrollTo(0, 900));
          await page.screenshot({path: path.join(screenshots, `${note.id}-${width}-middle.png`)});
        }
      }
      checks.push({id: note.id, width, overflow, characters: text.length});
    }
    await page.goto(`${base}0061/`);
    await page.locator('article > section > details > .tree-content a[href="/0077/"]').click();
    await page.waitForURL(`${base}0077/`);
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({result: 'pass', pages: review.pages.length, viewportChecks: checks.length,
    screenshots, checks, scope: 'Rendered prose, formulas, links and desktop/mobile overflow; mathematical narrative quality requires reading.'}, null, 2));
} finally {
  await browser.close();
}
