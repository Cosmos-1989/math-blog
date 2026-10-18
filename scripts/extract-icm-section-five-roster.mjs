import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {extractSectionSpeakers} from './extract-icm-section-roster.mjs';

export function extractGeometrySpeakers(html, checkedOn) {
  return extractSectionSpeakers(html, checkedOn, 5);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2] || !/^\d{4}-\d{2}-\d{2}$/.test(process.argv[3] ?? ''))
    throw new Error('Usage: node scripts/extract-icm-section-five-roster.mjs speakers.html YYYY-MM-DD');
  console.log(JSON.stringify(extractGeometrySpeakers(fs.readFileSync(process.argv[2], 'utf8'), process.argv[3]), null, 2));
}
