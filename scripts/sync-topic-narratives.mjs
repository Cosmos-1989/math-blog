import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, data) => fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
const record = read('research/topic-narratives.json');
const register = read('research/site-evergreen-audit.json');
const geometry = read('research/icm2026-geometry.json');
const algebraFiles = ['tensor', 'groups', 'representations', 'homological', 'combinatorial', 'torsors']
  .map(group => `research/algebra-${group}.json`);
const algebra = algebraFiles.map(file => ({file, data: read(file)}));
for (const page of record.pages) {
  const review = {date: record.date, question: page.question,
    scope: 'Report-level mathematical narrative, with inline atomic-note links; no new proof-completeness claim.'};
  if (!register.reviews[page.id]) throw new Error(`Missing existing review ${page.id}`);
  register.reviews[page.id].narrative_review = review;
  for (const {data} of algebra) {
    if (data.reviews[page.id]) data.reviews[page.id].narrative_review = review;
  }
  const snapshot = geometry.notes.find(note => note.id === page.id);
  if (snapshot) snapshot.sha256 = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(root, page.path))).digest('hex');
}
register.topic_narrative_record = 'research/topic-narratives.json';
write('research/site-evergreen-audit.json', register);
write('research/icm2026-geometry.json', geometry);
for (const {file, data} of algebra) write(file, data);
console.log(JSON.stringify({updatedSurveyReviews: record.pages.length}));
