import fs from "node:fs";
import crypto from "node:crypto";

// The public speaker page renders only its first cards, but embeds all records.
const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/extract-icm-algebra-roster.mjs downloaded-speakers.html");
const html = fs.readFileSync(file, "utf8");
const payload = [...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
  .map(match => JSON.parse(match[1]))
  .filter(chunk => chunk[0] === 1 && typeof chunk[1] === "string")
  .map(chunk => chunk[1]).join("");
const speakers = [];
let records = 0;
for (const match of payload.matchAll(/\{"id":"[^{}]+?"firstName":.*?"viewBioAriaLabel":"[^"\n]*"\}/gs)) {
  const speaker = JSON.parse(match[0]);
  records++;
  let biography = speaker.biography;
  if (/^\$[0-9a-f]+$/.test(biography)) {
    const header = payload.match(new RegExp(`${biography.slice(1)}:T([0-9a-f]+),`));
    if (!header) throw new Error(`Unresolved biography: ${speaker.firstName} ${speaker.lastName}`);
    biography = Buffer.from(payload.slice(header.index + header[0].length))
      .subarray(0, parseInt(header[1], 16)).toString("utf8");
  }
  const crossSections = biography.startsWith("†") ? biography.split(/\r?\n/)[0] : "";
  if (!/\b2 - Algebra/.test(`${speaker.designation} ${crossSections}`)) continue;
  speakers.push({
    name: `${speaker.firstName} ${speaker.lastName}`,
    speaker_id: speaker.id,
    primary_section: speaker.designation.replace(/,?\s*†/g, ""),
    additional_sections: crossSections.replace(/^†\s*/, ""),
    joint_presentation: biography.match(/Presenting jointly[^.]+\./)?.[0] ?? null,
  });
}
if (!records || !speakers.length) throw new Error("No roster found; the source format may have changed");
console.log(JSON.stringify({
  checked_on: "2026-09-23",
  url: "https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers",
  source_sha256: crypto.createHash("sha256").update(html).digest("hex"),
  public_speaker_records: records,
  scope: "Section 2 in primary designation or explicit cross-section biography; joint reports counted once",
  speakers,
}, null, 2));
