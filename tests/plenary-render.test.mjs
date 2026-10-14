import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const record = read('research/icm2026-plenary.json');
const snapshots = read('research/icm2026-plenary-snapshots.json');
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE);
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8083/';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'plenary-render-'));
const browser = await chromium.launch({headless: true, args: ['--disable-blink-features=XSLT'],
  ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
const checks = [], errors = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({viewport: {width, height: 1000}, reducedMotion: 'reduce'});
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);});
    for (const id of [...Object.keys(record.subjects), ...snapshots.notes.map(note => note.id)]) {
      await page.goto(`${base}${id}/`, {waitUntil: 'load'});
      await page.locator('.search-trigger:not([disabled])').waitFor();
      await page.evaluate(() => document.fonts.ready);
      const body = page.locator('article > section > details > .tree-content');
      assert((await body.innerText()).length > 50, `${id}: empty content`);
      assert.equal(await page.locator('.katex-error').count(), 0, `${id}: formula error`);
      assert.equal(await page.evaluate(() => typeof XSLTProcessor), 'undefined');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 1, `${id}/${width}: horizontal page overflow`);
      const longDisplays = await body.locator('.katex-display').evaluateAll(displays => displays
        .filter(display => display.scrollWidth - display.clientWidth > 1)
        .map(display => {
          const maximum = display.scrollWidth - display.clientWidth;
          display.scrollLeft = maximum;
          const reachable = display.scrollLeft >= maximum - 1;
          display.scrollLeft = 0;
          return reachable && ['auto', 'scroll'].includes(getComputedStyle(display).overflowX);
        }));
      assert(longDisplays.every(Boolean), `${id}: clipped formula`);
      if (record.subjects[id]) {
        const listed = await body.locator('ul').first().locator('li').evaluateAll(items =>
          items.map(li => li.querySelector('a')?.getAttribute('href')));
        assert.deepEqual(listed.slice(0, record.subjects[id].length), record.subjects[id].map(target => `/${target}/`));
      }
      if (record.subjects[id] || record.reports.some(report => report.outline === id) || ['2305', '2402', '2505', '270D', '2804', '2B03'].includes(id)) {
        await page.screenshot({path: path.join(screenshots, `${id}-${width}.png`)});
      }
      checks.push({id, width, overflow, scrollableDisplays: longDisplays.length, formulas: await body.locator('.katex').count()});
    }
    for (const [subject, leading] of Object.entries(record.subjects)) {
      await page.goto(`${base}${subject}/`);
      await page.locator(`article > section > details > .tree-content a[href="/${leading[0]}/"]`).click();
      await page.waitForURL(`${base}${leading[0]}/`);
    }
    for (const report of record.reports) {
      await page.goto(`${base}${report.outline}/index.xml?reading=plenary#top`);
      await page.waitForURL(`${base}${report.outline}/?reading=plenary#top`);
      const title = snapshots.notes.find(note => note.id === report.outline).title;
      await page.locator('.search-trigger:not([disabled])').click();
      await page.keyboard.type(title);
      const result = page.locator('ninja-action').filter({hasText: title}).first();
      await result.waitFor({state: 'visible'});
      await result.click();
      await page.waitForURL(`${base}${report.outline}/`);
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({result: 'pass', pages: snapshots.notes.length, subjects: Object.keys(record.subjects).length,
    widths: [1440, 390], xsltDisabled: true, searchTopics: record.reports.length, legacyTopics: record.reports.length,
    checks, screenshots}, null, 2));
} finally {
  await browser.close();
}
