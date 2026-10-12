import {groupEnd, prose} from './note-editorial-lib.mjs';

// Preserve offsets so a finding points to the source, not to a rewritten copy.
export function noteBody(text) {
  let start = 0;
  while (start < text.length) {
    const whitespace = text.slice(start).match(/^\s+/);
    if (whitespace) start += whitespace[0].length;
    const command = text.slice(start).match(/^\\(title|date|taxon|author|meta)\{/);
    if (!command) break;
    start = groupEnd(text, start + command[0].length - 1);
    if (command[1] === 'meta') {
      while (/\s/.test(text[start] ?? '') && start < text.length) start++;
      if (text[start] === '{') start = groupEnd(text, start);
    }
  }
  return text.slice(0, start).replace(/[^\n]/g, ' ') + text.slice(start);
}

export function bodyLinks(text) {
  const body = noteBody(text);
  const local = body.replace(/\[[^\]\n]+\]\((?:https?:|mailto:)[^)]+\)/g,
    value => value.replace(/[^\n]/g, ' '));
  return [...prose(local).matchAll(/\[([^\]\n]+)\]\(([^)\s]+)\)/g)]
    .map(match => ({label: body.slice(match.index + 1, match.index + 1 + match[1].length),
      target: match[2], index: match.index}));
}

export function linksInsideMath(text) {
  const findings = [];
  for (let i = 0; i < text.length;) {
    const math = text.slice(i).match(/^##?\{/);
    if (!math) { i++; continue; }
    const end = groupEnd(text, i + math[0].length - 1);
    for (const match of text.slice(i, end).matchAll(/\[([^\]\n]+)\]\(([^)\s]+)\)/g)) {
      findings.push({label: match[1], target: match[2],
        line: text.slice(0, i + match.index).split('\n').length});
    }
    i = end;
  }
  return findings;
}

export function unlinkedProse(text) {
  return prose(noteBody(text))
    .replace(/\[[^\]\n]+\]\([^)]+\)/g, value => value.replace(/[^\n]/g, ' '))
    .replace(/https?:\/\/[^\s}]+/g, value => ' '.repeat(value.length));
}

export function findTerms(note, rules) {
  const body = unlinkedProse(note.text);
  const linked = new Set(bodyLinks(note.text).map(link => link.target));
  const results = [];
  for (const rule of rules) {
    if (rule.target === note.id || rule.defined_in?.includes(note.id)) continue;
    if (rule.scope?.length && !rule.scope.some(prefix => note.path.startsWith(prefix))) continue;
    if ([rule.target, ...(rule.accepted_targets ?? [])].some(target => linked.has(target))) continue;
    for (const term of [rule.term, ...(rule.aliases ?? [])]) {
      let offset = 0, index;
      while ((index = body.indexOf(term, offset)) >= 0) {
        offset = index + term.length;
        if (/[A-Za-z0-9]/.test(term[0]) && /[A-Za-z0-9_]/.test(body[index - 1] ?? '')) continue;
        if (/[A-Za-z0-9]/.test(term.at(-1)) && /[A-Za-z0-9_]/.test(body[offset] ?? '')) continue;
        const before = body.slice(Math.max(0, index - 30), index);
        const after = body.slice(offset, offset + 30);
        if (rule.exclude_before && new RegExp(`${rule.exclude_before}$`, 'u').test(before)) continue;
        if (rule.exclude_after && new RegExp(`^(?:${rule.exclude_after})`, 'u').test(after)) continue;
        results.push({id: note.id, path: note.path, term, target: rule.target,
          line: note.text.slice(0, index).split('\n').length,
          context: note.text.slice(Math.max(0, index - 35), Math.min(note.text.length, offset + 65))});
        break;
      }
    }
  }
  return results;
}

export function shortDefinitionRules(notes) {
  return notes.filter(note => note.taxon === 'Definition' && note.title.length >= 3
    && note.title.length <= 16 && !/[与、：的或]|定义|条件|公理/.test(note.title))
    .map(note => ({term: note.title, target: note.id, origin: 'definition-title'}));
}
