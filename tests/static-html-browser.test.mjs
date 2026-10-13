import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { staticOutput, basePath } from '../scripts/site-config.mjs';

if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE to an installed Playwright module');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const base = process.env.PREVIEW_URL || `http://127.0.0.1:8083${basePath}`;
const browser = await chromium.launch({ headless: true, args: ['--disable-blink-features=XSLT'],
  ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const errors = [], checks = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => assert(!new URL(request.url()).pathname.endsWith('.xsl'), 'No browser XSLT requests'));
  for (const route of ['', '0063/', '003B/index.html', '0BJB/', '0I8G/']) {
    const response = await page.goto(`${base}${route}`);
    assert.equal(response.status(), 200);
    assert(response.headers()['content-type'].includes('text/html'));
    assert.equal(await page.evaluate(() => typeof XSLTProcessor), 'undefined');
    await page.locator('.search-trigger:not([disabled])').waitFor();
    assert((await page.locator('article').innerText()).length > 100);
    assert.equal(await page.locator('.katex-error').count(), 0);
    checks.push(route || '/');
  }
  // Tests real XML responses as well as historical repository-prefixed routes.
  for (const route of ['003B/index.xml', 'math-blog/003B/index.xml', 'math-blog/003B/', 'math-blog/003B/index.html']) {
    await page.goto(`${base}${route}?from=bookmark#id10`, { waitUntil: 'commit' });
    await page.waitForURL(`${base}003B/?from=bookmark#id10`);
    await page.waitForLoadState('load');
    assert(await page.locator('#id10').evaluate(element => element.open));
    assert((await page.locator('article').innerText()).includes('代数理论'));
    checks.push(route);
  }
  // A host may serve .xml as any of these XML MIME types. All must work.
  for (const type of ['application/xml', 'text/xml', 'application/xhtml+xml']) {
    await page.route('**/__legacy_fixture__.xml*', route => route.fulfill({ contentType: type,
      body: fs.readFileSync(path.join(staticOutput, '003B/index.xml'), 'utf8') }));
    await page.goto(`${base}__legacy_fixture__.xml?q=1#id10`, { waitUntil: 'commit' });
    await page.waitForURL(`${base}003B/?q=1#id10`);
    await page.waitForLoadState('load');
    assert(await page.locator('#id10').evaluate(element => element.open));
    await page.unroute('**/__legacy_fixture__.xml*');
    checks.push(type);
  }
  await page.goto(`${base}009E/`);
  await page.locator('.search-trigger:not([disabled])').click();
  await page.keyboard.type('Bessel');
  const result = page.locator('ninja-action').filter({ hasText: 'Bessel' }).first();
  await result.waitFor({ state: 'visible' });
  await result.click();
  await page.waitForURL(url => !url.pathname.includes('009E'));
  await page.waitForLoadState('load');
  assert(!page.url().includes('.xml'), 'Search must navigate straight to HTML');
  assert((await page.locator('article').innerText()).includes('Bessel'));
  checks.push('search result navigation');

  const noJS = await browser.newPage({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  await noJS.goto(`${base}003J/`);
  assert((await noJS.locator('article').innerText()).includes('群'));
  assert(await noJS.locator('article figure img').evaluateAll(images => images.length > 0 && images.every(img => img.complete && img.naturalWidth > 0)));
  await noJS.locator('article > section > details > summary').press('Enter');
  assert.equal(await noJS.locator('article > section > details').getAttribute('open'), null);
  for (const route of ['003B/index.xml', 'math-blog/003B/']) {
    await noJS.goto(`${base}${route}`);
    // Meta-refresh in XHTML is supported by modern browsers; the visible link
    // remains usable even in readers that do not process refresh directives.
    await noJS.waitForURL(`${base}003B/`);
    assert((await noJS.locator('article').innerText()).includes('代数理论'));
  }
  checks.push('JavaScript disabled: content, diagrams, disclosure and old links');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'pass', xslt: 'disabled', checks }, null, 2));
} finally {
  await browser.close();
}
