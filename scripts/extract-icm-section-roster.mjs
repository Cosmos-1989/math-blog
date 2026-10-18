import fs from 'node:fs';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

export function extractSectionSpeakers(html, checkedOn, section) {
  if (!Number.isInteger(section) || section < 1 || section > 20)
    throw new Error('Expected a section number from 1 to 20');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedOn)) throw new Error('Expected YYYY-MM-DD');
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
      // React's text record length is a UTF-8 byte count, not a JS string length.
      biography = Buffer.from(payload.slice(header.index + header[0].length))
        .subarray(0, parseInt(header[1], 16)).toString('utf8');
    }
    const cross = biography.trimStart().startsWith('†') ? biography.trimStart().split(/\r?\n/)[0] : '';
    const primary = Number((speaker.designation ?? '').trim().match(/^(\d+)\s*-/)?.[1]);
    const additional = [...cross.matchAll(/\b(\d+)\s*-/g)].map(item => Number(item[1]));
    if (primary !== section && !additional.includes(section)) continue;
    if (!primary) throw new Error(`Section missing for ${speaker.lastName}`);
    speakers.push({name: `${speaker.firstName} ${speaker.lastName}`,
      speaker_id: speaker.id, primary_section: primary, additional_sections: additional,
      joint_presentation: biography.match(/Presenting jointly[^.]+\./)?.[0] ?? null});
  }
  if (!speakers.length) throw new Error(`No Section ${section} speakers found`);
  return {checked_on: checkedOn,
    url: 'https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers',
    source_sha256: crypto.createHash('sha256').update(html).digest('hex'),
    public_speaker_records: records.size,
    scope: `Section ${section} primary designation or explicit dagger-marked additional section; joint reports counted separately from people.`,
    speakers};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , input, date, section, output] = process.argv;
  if (!input || !date || !section) throw new Error('Usage: node scripts/extract-icm-section-roster.mjs speakers.html YYYY-MM-DD SECTION [output.json]');
  const json = JSON.stringify(extractSectionSpeakers(fs.readFileSync(input, 'utf8'), date, Number(section)), null, 2) + '\n';
  if (output) fs.writeFileSync(output, json); else process.stdout.write(json);
}
