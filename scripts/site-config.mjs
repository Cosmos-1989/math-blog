import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = fs.readFileSync(path.join(root, 'forest.toml'), 'utf8');
const configuredUrl = config.match(/^url\s*=\s*"([^"]+)"/m)?.[1];
if (!configuredUrl) throw new Error('forest.toml must declare the public site URL');
export const siteUrl = new URL(configuredUrl);
if (siteUrl.protocol !== 'https:' || !siteUrl.pathname.endsWith('/') || siteUrl.search || siteUrl.hash) {
  throw new Error('The public site URL must be HTTPS and end in a slash, without a query or fragment');
}
export const basePath = siteUrl.pathname;
export const output = path.join(root, 'output', basePath);
