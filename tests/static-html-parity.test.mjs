import assert from 'node:assert/strict';

// Optional migration check against a server still serving Forester's raw XML.
if (!process.env.PLAYWRIGHT_MODULE || !process.env.BASELINE_URL || !process.env.PREVIEW_URL) {
  throw new Error('Set PLAYWRIGHT_MODULE, BASELINE_URL (XML output) and PREVIEW_URL (static HTML)');
}
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch({ headless: true,
  ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const ids = ['index', '0063', '003B', '003J', '004M', '004R', '007A', '009E', '013Z', '05K0', '0B80', '0BJB',
  '0G00', '0G40', '0G80', '0GC0', '0GG0', '0GK0', '0GO0', '0GS0', '0H00', '0H40', '0I8G'];
async function contents(page, url) {
  await page.goto(url, { waitUntil: 'load' });
  await page.locator('article .tree-content').first().waitFor();
  return page.locator('article').evaluate(article => ({
    text: article.textContent.replace(/\s+/g, ''),
    headings: [...article.querySelectorAll('h1')].map(element => element.textContent.replace(/\s+/g, '')),
    anchors: [...article.querySelectorAll('details[id]')].map(element => element.id),
    links: [...article.querySelectorAll('a[href]')].map(element => element.getAttribute('href')),
    images: [...article.querySelectorAll('img')].map(element => element.getAttribute('src')),
    formulas: [...article.querySelectorAll('annotation[encoding="application/x-tex"]')].map(element => element.textContent),
  }));
}
try {
  const before = await browser.newPage();
  const after = await browser.newPage();
  for (const id of ids) {
    const source = await contents(before, `${process.env.BASELINE_URL}${id}/index.xml`);
    const html = await contents(after, `${process.env.PREVIEW_URL}${id}/`);
    assert.deepEqual(html, source, `${id}: changed content, formulas, headings, links, images or bookmark IDs`);
  }
  console.log(`XML/HTML browser parity passed for ${ids.length} representative pages, including all ten number-theory reports.`);
} finally {
  await browser.close();
}
