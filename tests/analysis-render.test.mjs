import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE to an installed Playwright module');
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE);
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const manifest = read('research/icm2026-analysis.json');
const samples = manifest.reports.flatMap(report => {
  const record = read(report.record);
  return [report.outline, report.reference, ...(record.proofs_written ?? []).slice(0, 3),
    ...(record.research_statements_without_local_proof ?? []).slice(0, 2)];
});
const calculationPages = ['0R0N', '0R0W', '0R17', '0S0I', '0S0R', '0S0Y', '0T0X', '0T12', '0T16',
  '0U06', '0U0D', '0U10', '0U19', '0V03', '0V08', '0V0B', '0V0H', '0V0T', '0V17',
  '0W01', '0W07', '0W09', '0W0C', '0W0Q', '0W0S', '0W0T', '0W11', '0A6O',
  '0Y02', '0Y04', '0Y05', '0Y06', '0Y07', '0Y08',
  '0X08', '0X0C', '0X0G', '0X0H', '0X0N', '0X0Q', '0X0W', '0X12', '0X17',
  '0Z0F', '0Z0O', '0Z0U', '0Z12', '0Z13', '0Z16', '0Z17', '0Z18', '0Z1D', '0Z1E'];
const pages = [...new Set([manifest.subject, ...samples, ...calculationPages])];
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8083/';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-render-'));
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
        assert(await page.locator(`article a[href="/${report.reference}/"]`).count(), `${id}: missing source link`);
        assert(await body.locator('p').count() >= 5, `${id}: incomplete narrative`);
        await page.screenshot({path: path.join(screenshots, `${id}-${width}.png`), fullPage: false});
      }
      if (['0X0C', '0Y07', '0Z17'].includes(id)) {
        await page.screenshot({path: path.join(screenshots, `${id}-${width}.png`), fullPage: false});
      }
      checks.push({id, width, formulas: await body.locator('.katex').count(),
        overflow: geometry.scroll - geometry.width});
    }
    for (const report of manifest.reports) {
      await page.goto(`${base}${manifest.subject}/`);
      await page.locator(`article > section > details > .tree-content a[href="/${report.outline}/"]`).click();
      await page.waitForURL(`${base}${report.outline}/`);
      await page.goto(`${base}${report.outline}/index.xml?reading=analysis#top`);
      await page.waitForURL(`${base}${report.outline}/?reading=analysis#top`);
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({result: 'pass', checks, screenshots,
    scope: 'Desktop/mobile rendering, subject navigation and legacy URLs; source checks cover all new notes.'}, null, 2));
} finally {
  await browser.close();
}
