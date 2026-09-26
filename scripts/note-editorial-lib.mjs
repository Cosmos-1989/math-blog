// Forester groups may contain nested TeX braces; preserve them when masking math.
export function groupEnd(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '\\' && /[{}]/.test(text[i + 1] ?? '')) { i++; continue; }
    if (text[i] === '{') depth++;
    if (text[i] === '}' && --depth === 0) return i + 1;
  }
  return text.length;
}

export function prose(text) {
  let out = '';
  const mask = (start, end) => text.slice(start, end).replace(/[^\n]/g, ' ');
  for (let i = 0; i < text.length;) {
    const math = text.slice(i).match(/^##?\{/);
    if (math) { const end = groupEnd(text, i + math[0].length - 1); out += mask(i, end); i = end; continue; }
    if (text.startsWith('\\tex{', i)) {
      let end = groupEnd(text, i + 4);
      while (/\s/.test(text[end] ?? '') && end < text.length) end++;
      if (text[end] === '{') end = groupEnd(text, end);
      out += mask(i, end); i = end; continue;
    }
    out += text[i++];
  }
  return out.replace(/\]\((?:https?:|mailto:)[^)]+\)/g, m => ' '.repeat(m.length));
}

export const styleRules = [
  ['contrast-template', /(?:不是|并非)[^。\n]{0,200}而是/g],
  ['defensive-writing', /不(?:宣称|声称|冒充)|不能冒充|本(?:页|文|站)(?:不证明|不提供|不补写|不把)|未宣称|没有声称/g],
  ['editing-process', /本次(?:核读|读取|实际阅读)|本轮(?:下载|实际阅读|重读|只完整重建)|原专题入口保留|本页保留原入口|规范页|依赖链|多维框架|闭环|链条(?!件)/g],
  ['engineering-vocabulary', /\b(?:audit|benchmark|certified|profile)\b/gi]
];

export function normalizeFormat(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let n = 0;
  while (n < lines.length && (!lines[n].trim() || /^\\(?:title|date|taxon|author|meta)\{/.test(lines[n]))) n++;
  const header = lines.slice(0, n).filter(l => l.trim());
  const rank = l => ['title', 'date', 'taxon', 'author', 'meta'].indexOf(l.match(/^\\(\w+)/)?.[1]);
  header.sort((a, b) => rank(a) - rank(b));
  let body = lines.slice(n).join('\n').trim();
  body = body.replace(/\\p\{(?:完整)?证明[：:]\s*/g, '\\p{\\strong{证明。}');
  body = body.replace(/\\p\{(证明概要|证明纲要|证明思路)[：:]\s*/g, '\\p{\\strong{$1。}');
  body = body.replace(/\\p\{(证明|注记|证明概要)[。．]\s*/g, '\\p{\\strong{$1。}');
  body = body.replace(/\\p\{\\strong\{(证明|注记|证明概要)[。．]?\}\}\s*\\p\{/g, '\\p{\\strong{$1。}');
  return normalizeMathPaths(header.join('\n') + '\n\n' + body + '\n');
}

// In Forester math, an adjacent slash can turn a TeX command into a path.
export function normalizeMathPaths(text) {
  let result = '';
  for (let i = 0; i < text.length;) {
    const match = text.slice(i).match(/^##?\{/);
    if (!match) { result += text[i++]; continue; }
    const end = groupEnd(text, i + match[0].length - 1);
    result += text.slice(i, end)
      .replace(/(\\[A-Za-z][A-Za-z0-9_-]*)\//g, '$1 /')
      .replace(/\\([A-Za-z]+)(?=[0-9-])/g, '\\$1 ');
    i = end;
  }
  return result;
}
