import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const recordFile = process.env.TOPOLOGY_RECORD ?? 'research/icm2026-topology-oct14.json';
const record = read(recordFile);
const snapshots = read(recordFile.replace(/\.json$/, '-snapshots.json'));
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE);
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8083/';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'topology-render-'));
const browser = await chromium.launch({headless: true, args: ['--disable-blink-features=XSLT'],
  ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
const checks = [], errors = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({viewport: {width, height: 1000}, reducedMotion: 'reduce'});
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    for (const id of new Set([record.subject, ...(record.cross_subject_landings ?? []).map(row => row.subject),
      ...snapshots.notes.map(note => note.id)])) {
      await page.goto(`${base}${id}/`, {waitUntil: 'load'});
      await page.locator('.search-trigger:not([disabled])').waitFor();
      await page.evaluate(() => document.fonts.ready);
      const body = page.locator('article > section > details > .tree-content');
      assert((await body.innerText()).length > 50, `${id}: missing body`);
      assert.equal(await page.locator('.katex-error').count(), 0, `${id}: invalid formula`);
      assert.equal(await page.evaluate(() => typeof XSLTProcessor), 'undefined');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 1, `${id}/${width}: page overflow`);
      const displayScrolls = await body.locator('.katex-display').evaluateAll(displays => displays
        .filter(display => display.scrollWidth - display.clientWidth > 1)
        .map(display => {
          const maximum = display.scrollWidth - display.clientWidth;
          display.scrollLeft = maximum;
          const reachable = display.scrollLeft >= maximum - 1;
          display.scrollLeft = 0;
          return {reachable, overflowX: getComputedStyle(display).overflowX};
        }));
      assert(displayScrolls.every(display => display.reachable && ['auto', 'scroll'].includes(display.overflowX)),
        `${id}/${width}: a long formula is clipped instead of scrollable`);
      if (id === record.subject || (record.cross_subject_landings ?? []).some(row => row.subject === id) || record.reports.some(report => report.outline === id) || ['0066', '140B', '150J', '160P', '0BLQ', '1701', '170Z', '180A', '180P', '1903', '190J', '200D', '2108', '220N', '2210', '0BLY', '0F55'].includes(id)) {
        await page.screenshot({path: path.join(screenshots, `${id}-${width}.png`)});
      }
      checks.push({id, width, overflow, scrollableDisplays: displayScrolls.length,
        formulas: await body.locator('.katex').count()});
    }
    for (const id of [...record.reports.map(report => report.outline), ...(record.navigation_checks ?? ['0BL0'])]) {
      await page.goto(`${base}${record.subject}/`);
      await page.locator(`article > section > details > .tree-content a[href="/${id}/"]`).click();
      await page.waitForURL(`${base}${id}/`);
      await page.goto(`${base}${id}/index.xml?reading=topology#top`);
      await page.waitForURL(`${base}${id}/?reading=topology#top`);
    }
    for (const report of record.reports) {
      const title = snapshots.notes.find(note => note.id === report.outline).title;
      await page.locator('.search-trigger:not([disabled])').click();
      await page.keyboard.type(title);
      // A bibliography entry can contain the complete topic title too.
      const result = page.locator('ninja-action').filter({hasText: title})
        .filter({hasText: `[${report.outline}]`});
      await result.waitFor({state: 'visible'});
      await result.click();
      await page.waitForURL(`${base}${report.outline}/`);
    }
    for (const {subject, outline} of record.cross_subject_landings ?? []) {
      await page.goto(`${base}${subject}/`);
      const link = page.locator(`article > section > details > .tree-content a[href="/${outline}/"]`);
      assert.equal(await link.count(), 1, `${subject}: duplicate or absent cross-listed topic ${outline}`);
      await link.click();
      await page.waitForURL(`${base}${outline}/`);
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({result: 'pass', checks, screenshots}, null, 2));
} finally {
  await browser.close();
}
