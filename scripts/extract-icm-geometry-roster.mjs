import fs from 'node:fs';
import crypto from 'node:crypto';

const html = fs.readFileSync(process.argv[2], 'utf8');
const payload = [...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
  .map(m => JSON.parse(m[1])).filter(c => c[0] === 1 && typeof c[1] === 'string')
  .map(c => c[1]).join('');
const speakers = [];
let records = 0;
for (const m of payload.matchAll(/\{"id":"[^{}]+?"firstName":.*?"viewBioAriaLabel":"[^"\n]*"\}/gs)) {
  const s = JSON.parse(m[0]);
  records++;
  let bio = s.biography;
  if (/^\$[0-9a-f]+$/.test(bio)) {
    const header = payload.match(new RegExp(`${bio.slice(1)}:T([0-9a-f]+),`));
    if (!header) throw new Error(`Unresolved biography: ${s.lastName}`);
    bio = Buffer.from(payload.slice(header.index + header[0].length))
      .subarray(0, parseInt(header[1], 16)).toString('utf8');
  }
  const cross = bio.startsWith('†') ? bio.split(/\r?\n/)[0] : '';
  if (!/\b4 - (Alg\.|Algebraic)/.test(`${s.designation} ${cross}`)) continue;
  speakers.push({ name: `${s.firstName} ${s.lastName}`, speaker_id: s.id,
    primary_section: s.designation, additional_sections: cross,
    biography: bio });
}
if (!speakers.length) throw new Error('No Section 4 speakers found');
console.log(JSON.stringify({ checked_on: '2026-09-28',
  url: 'https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers',
  source_sha256: crypto.createHash('sha256').update(html).digest('hex'),
  public_speaker_records: records, speakers }, null, 2));
