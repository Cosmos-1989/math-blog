import {groupEnd} from './note-editorial-lib.mjs';

export function listedTopics(text) {
  const targets = [];
  for (const item of text.matchAll(/\\li\{/g)) {
    const open = item.index + 3;
    const body = text.slice(open + 1, groupEnd(text, open) - 1);
    // The first link names the topic; later links explain terms in its description.
    const first = body.match(/\[[^\]\n]+\]\(([^)\s]+)\)/);
    if (first) targets.push(first[1]);
  }
  return targets;
}
