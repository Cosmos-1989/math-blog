import assert from 'node:assert/strict';
import test from 'node:test';
import {findSectionReport} from '../scripts/sync-lie-reports.mjs';

test('DOI lookup remains unique across primary and cross-listed reports', () => {
  const primary = {doi: 'chapter-a'}, cross = {doi: 'chapter-b'};
  const coverage = {reports: [primary], cross_listed_reports: [cross]};
  assert.equal(findSectionReport(coverage, 'chapter-a'), primary);
  assert.equal(findSectionReport(coverage, {doi: 'chapter-b'}), cross);
  assert.throws(() => findSectionReport(coverage, 'missing'), /found 0/);
  assert.throws(() => findSectionReport({reports: [primary, primary]}, 'chapter-a'), /found 2/);
  assert.throws(() => findSectionReport(coverage, {doi: 42, official_speaker_ids: ['a']}), /DOI/);
});

test('a talk without an identified chapter is matched by the complete official speaker set', () => {
  const a = {doi: null, speaker_ids: ['a']};
  const b = {doi: null, speaker_ids: ['b', 'c']};
  const coverage = {reports: [a], cross_listed_reports: [b]};
  assert.equal(findSectionReport(coverage, {doi: null, official_speaker_ids: ['a']}), a);
  assert.equal(findSectionReport(coverage, {official_speaker_ids: ['c', 'b']}), b);
  assert.throws(() => findSectionReport(coverage, {official_speaker_ids: ['b']}), /found 0/);
  for (const identity of [null, {}, {doi: null}, {official_speaker_ids: []},
    {official_speaker_ids: ['']}, {official_speaker_ids: ['a', 'a']}])
    assert.throws(() => findSectionReport(coverage, identity), /official_speaker_ids/);
  assert.throws(() => findSectionReport({reports: [a, a]}, {official_speaker_ids: ['a']}), /found 2/);
  assert.throws(() => findSectionReport({reports: [{...a, doi: 'new-chapter'}]},
    {official_speaker_ids: ['a']}), /found 0/);
});
