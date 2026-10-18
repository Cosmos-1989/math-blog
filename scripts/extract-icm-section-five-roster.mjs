import fs from 'node:fs';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

export function extractGeometrySpeakers(html, checkedOn) {
  const payload = [...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
    .map(match => JSON.parse(match[1]))
    .filter(chunk => chunk[0] === 1 && typeof chunk[1] === 'string')
    .map(chunk => chunk[1]).join('');
  const records = new Map(), speakers = [];
  for (const match of payload.matchAll(/\{"id":"[^{}]+?"firstName":.*?"viewBioAriaLabel":"[^"\n]*"\}/gs)) {
    const speaker = JSON.parse(match[0]);
    if (records.has(speaker.id)) throw new Error(`Duplicate speaker: ${speaker.id}`);
    records.set(speaker.id, speaker);
    let biography = speaker.biography ?? '';
    if (/^\$[0-9a-f]+$/.test(biography)) {
      const header = payload.match(new RegExp(`${biography.slice(1)}:T([0-9a-f]+),`));
      if (!header) throw new Error(`Unresolved biography: ${speaker.lastName}`);
      biography = Buffer.from(payload.slice(header.index + header[0].length))
        .subarray(0, parseInt(header[1], 16)).toString('utf8');
    }
    const cross = biography.trimStart().startsWith('†') ? biography.trimStart().split(/\r?\n/)[0] : '';
    if (!/\b5\s*-\s*Geometry\b/.test(`${speaker.designation} ${cross}`)) continue;
    const primary = Number(speaker.designation.trim().match(/^(\d+)\s*-/)?.[1]);
    if (!primary) throw new Error(`Section missing for ${speaker.lastName}`);
    speakers.push({name: `${speaker.firstName} ${speaker.lastName}`,
      speaker_id: speaker.id, primary_section: primary,
      additional_sections: [...cross.matchAll(/\b(\d+)\s*-/g)].map(item => Number(item[1])),
      joint_presentation: biography.match(/Presenting jointly[^.]+\./)?.[0] ?? null});
  }
  if (!speakers.length) throw new Error('No Section 5 speakers found');
  return {checked_on: checkedOn,
    url: 'https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers',
    source_sha256: crypto.createHash('sha256').update(html).digest('hex'),
    public_speaker_records: records.size,
    scope: 'Section 5 primary designation or explicit dagger-marked additional section; joint reports counted separately from people.',
    speakers};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2] || !/^\d{4}-\d{2}-\d{2}$/.test(process.argv[3] ?? ''))
    throw new Error('Usage: node scripts/extract-icm-section-five-roster.mjs speakers.html YYYY-MM-DD');
  console.log(JSON.stringify(extractGeometrySpeakers(fs.readFileSync(process.argv[2], 'utf8'), process.argv[3]), null, 2));
}
