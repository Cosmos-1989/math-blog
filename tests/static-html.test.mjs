import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { legacyPage, renderHtml } from '../scripts/build-static-html.mjs';
import { root } from '../scripts/site-config.mjs';

const legacy = legacyPage('/003B/', '<群> & "范畴"', true);
assert(legacy.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
assert(legacy.includes('&lt;群&gt; &amp; &quot;范畴&quot;'));
assert(!legacy.includes('xml-stylesheet'));
const script = fs.readFileSync(`${root}/theme-overrides/legacy-url.js`, 'utf8');
for (const pathname of ['/003B/index.xml', '/math-blog/003B/index.xml', '/math-blog/003B/']) {
  let result;
  const location = new URL(`https://opetope.cc${pathname}?q=%E7%BE%A4#id10`);
  location.replace = href => { result = href; };
  vm.runInNewContext(script, { URL, window: { location }, document: { documentElement: { getAttribute: () => '/003B/' } } });
  assert.equal(result, 'https://opetope.cc/003B/?q=%E7%BE%A4#id10');
}
let redirected = false;
const location = new URL('https://opetope.cc/003B/index.xml');
location.replace = () => { redirected = true; };
vm.runInNewContext(script, { URL, window: { location }, document: { documentElement: { getAttribute: () => 'https://example.com/' } } });
assert.equal(redirected, false, 'Never redirect to another origin');
const fixture = renderHtml(`${root}/scripts/fixtures/reading.xml`);
assert.equal(fixture, renderHtml(`${root}/scripts/fixtures/reading.xml`), 'Builds must have deterministic anchors');
assert(fixture.includes('<!DOCTYPE html'));
assert(fixture.includes('<ninja-keys') && fixture.includes('</ninja-keys>'));
assert(fixture.includes('</script>') && !/<script[^>]+\/>/.test(fixture));
assert(!/<(?:html:|fr:)/.test(fixture));
assert(fixture.includes('证明样本') && fixture.includes('\\sum'));
assert(fixture.includes('id="id1"') && fixture.includes('href="#id4"'));
console.log('Static HTML serialization, XML escaping, legacy query/fragment preservation and redirect safety passed.');
