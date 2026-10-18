import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
const packets = ['geometry-daskalopoulos-mese-packet', 'geometry-etnyre-packet'].map(name => read(`research/${name}.json`));
const manifest = 'research/icm2026-geometry-harmonic-contact.json';
const files = new Map(fs.readdirSync(path.join(root, 'trees'), {recursive: true})
  .filter(file => file.endsWith('.tree')).map(file => [path.basename(file, '.tree'), 'trees/' + file]));
const prerequisites = Object.assign({}, ...packets.map(packet => packet.prerequisites));
const audit = read('research/site-evergreen-audit.json');
const required = read('research/prerequisite-required-links.json');
const narratives = read('research/topic-narratives.json');
const coverage = read('research/icm2026-geometry-section-coverage.json');
const notes = [];
for (const packet of packets) {
  const report = packet.report;
  const ids = [...files.keys()].filter(id => id.startsWith(report.prefix) || id === report.reference).sort();
  for (const id of ids) {
    const file = files.get(id), text = fs.readFileSync(path.join(root, file), 'utf8');
    const title = text.match(/\\title\{([^\n]+)\}/)?.[1];
    const taxon = text.match(/\\taxon\{([^}]+)\}/)?.[1];
    if (!['Outline', 'Reference'].includes(taxon) && !Object.hasOwn(prerequisites, id))
      throw new Error(`Missing reviewed prerequisites: ${id}`);
    prerequisites[id] ??= [];
    const sha256 = crypto.createHash('sha256').update(text).digest('hex');
    notes.push({id, path: file, title, taxon, sha256});
    audit.reviews[id] = {title, action: '几何学报告增补', reason: `${title}。核对独立主题、显式前置及证明范围，详见 icm2026-geometry-harmonic-contact.json。`};
    if (!audit.original_ids.includes(id)) audit.original_ids.push(id);
    if (['Outline', 'Reference'].includes(taxon)) delete audit.prerequisites[id];
    else audit.prerequisites[id] = prerequisites[id];
    required.pages[id] = {targets: prerequisites[id], sha256};
  }
  const page = {id: report.outline, path: files.get(report.outline), question: report.question, previous_targets: ids.filter(id => id !== report.outline)};
  const position = narratives.pages.findIndex(row => row.id === report.outline);
  if (position < 0) narratives.pages.push(page); else narratives.pages[position] = page;
  const entry = coverage.reports.find(row => row.doi === report.doi);
  if (!entry) throw new Error(`Report absent from geometry directory: ${report.doi}`);
  Object.assign(entry, {status: 'selected-branches-integrated', outline: report.outline,
    reference: report.reference, existing_record: manifest, on_subject_landing: true});
}
coverage.counts.primary_reports_with_existing_topic = coverage.reports.filter(row => row.outline).length;
coverage.counts.reports_without_dedicated_topic = coverage.reports.filter(row => !row.outline).length;
coverage.review_boundary = 'Dedicated narratives and selected atomic branches are integrated. Research-proof scope and remaining branches are recorded in the three geometry import manifests, including icm2026-geometry-harmonic-contact.json. Coverage is not a claim of complete internal proofs.';
// The subject page keeps its reviewed dependencies; only its topic links changed.
required.pages['0065'].sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, files.get('0065')))).digest('hex');
write(manifest, {date: '2026-10-16', subject: '0065', scope: 'Two reports, including the joint Daskalopoulos-Mese report counted once.',
  source_method: 'Versioned report full texts and selected original theorem statements; see individual packets for reading and proof boundaries.',
  reports: packets.map(packet => packet.report), prerequisites,
  source_errata: packets.flatMap(packet => packet.source_errata ?? []),
  review: {packet_files: ['research/geometry-daskalopoulos-mese-packet.json', 'research/geometry-etnyre-packet.json'], mathematical_scope: 'Explicit elementary proofs, precise cited analytic/theorem inputs, and dependency reuse; not complete proofs of all research results.'}});
write('research/icm2026-geometry-harmonic-contact-snapshots.json', {date: '2026-10-16', notes});
write('research/site-evergreen-audit.json', audit);
write('research/prerequisite-required-links.json', required);
write('research/topic-narratives.json', narratives);
write('research/icm2026-geometry-section-coverage.json', coverage);
console.log(JSON.stringify({notes: notes.length, reports: packets.length, coverage: coverage.counts}, null, 2));
