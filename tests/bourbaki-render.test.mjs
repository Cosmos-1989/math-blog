import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE to an installed Playwright module');
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE);
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const manifest = read('research/bourbaki-2026-06.json');
const samples = manifest.reports.flatMap(report => {
  const record = read(report.record);
  return [report.outline, report.reference, ...(record.proofs_written ?? []).slice(0, 2),
    ...(record.research_statements_without_local_proof ?? []).slice(0, 1)];
});
const pages = [...new Set(['0065', '0069', '006B', ...samples,
  '0N0Y', '0N11', '0O0L', '0P0E', '0P0T', '0Q0Q', '0Q0R', '0Q0Z'])];
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8083/';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'bourbaki-render-'));
const browser = await chromium.launch({headless: true, args: ['--disable-blink-features=XSLT'],
  ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
const checks = [], errors = [];
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
      const body = page.locator('article > section > details > .tree-content');
      assert((await body.innerText()).length > 50, `${id}: missing body`);
      assert.equal(await page.locator('.katex-error').count(), 0, `${id}: invalid formula`);
      assert.equal(await page.evaluate(() => typeof XSLTProcessor), 'undefined');
      const geometry = await page.evaluate(() => ({width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth}));
      assert(geometry.scroll <= geometry.width + 1, `${id}/${width}: horizontal overflow`);
      const report = manifest.reports.find(report => report.outline === id);
      if (report) {
        assert(await body.locator(`a[href="/${report.reference}/"]`).count(), `${id}: missing source link`);
        await page.screenshot({path: path.join(screenshots, `${id}-${width}.png`), fullPage: false});
      }
      checks.push({id, width, formulas: await body.locator('.katex').count(),
        overflow: geometry.scroll - geometry.width});
    }
    for (const [subject, outline] of [['0065', '0N00'], ['0065', '0GS0'], ['0069', '0P00'], ['006B', '0Q00']]) {
      await page.goto(`${base}${subject}/`);
      await page.locator(`article > section > details > .tree-content a[href="/${outline}/"]`).click();
      await page.waitForURL(`${base}${outline}/`);
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({result: 'pass', checks, screenshots,
    scope: 'Desktop/mobile rendering and subject navigation; source checks cover all new notes.'}, null, 2));
} finally {
  await browser.close();
}
