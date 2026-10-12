import assert from 'node:assert/strict';
import {bodyLinks, findTerms, linksInsideMath, noteBody} from './note-prerequisite-lib.mjs';

const rule = {term: '代数闭域', target: '00SO'};
const scan = (text, rules = [rule], id = 'sample') => findTerms({id, path: 'trees/math/sample.tree', text}, rules);
assert.equal(scan('\\p{设 K 是代数闭域。}').length, 1);
assert.equal(scan('\\title{代数闭域}\n\\meta{source}{[代数闭域](source)}\n\n\\p{已说明。}').length, 0);
assert.equal(scan('\\p{[代数闭域](00SO)上的代数闭域扩张。}').length, 0);
assert.equal(scan('\\p{#{\\text{代数闭域}}}').length, 0);
assert.equal(scan('\\tex{\\usepackage{tikz-cd}}{代数闭域}').length, 0);
assert.equal(scan('\\p{[书](https://example.com/代数闭域)}').length, 0);
assert.equal(scan('\\p{代数闭域。}', [rule], '00SO').length, 0);
assert.equal(scan('\\p{代数闭域。}', [{...rule, defined_in: ['sample']}]).length, 0);
assert.equal(scan('\\p{[另一种写法](alternative)代数闭域。}', [{...rule, accepted_targets: ['alternative']}]).length, 0);
assert.equal(scan('\\p{线性约化群。}', [{term: '约化群', target: '012M', exclude_before: '线性'}]).length, 0);
assert.equal(scan('\\p{代数闭域。}', [{...rule, scope: ['trees/physics/']}]).length, 0);
const fixture = '\\title{元数据}\n\\meta{source}{包含{嵌套}的来源}\n\n\\p{代数闭域。}';
assert.equal(noteBody(fixture).length, fixture.length);
assert.equal(scan(fixture)[0].line, 4);
assert.deepEqual(bodyLinks('\\meta{source}{[来源](source)}\n\n\\p{[定义](target)}').map(link => link.target), ['target']);
assert.deepEqual(bodyLinks('##{\\text{[定义](target)}}'), []);
assert.deepEqual(bodyLinks('\\tex{}{[图内文字](target)}'), []);
assert.equal(bodyLinks('[#{G} 的表示](target)')[0].label, '#{G} 的表示');
assert.equal(linksInsideMath('\\p{[#{G} 的表示](target)}').length, 0);
assert.deepEqual(linksInsideMath('\\p{正文。}\n##{\\text{[定义](target)}}'),
  [{label: '定义', target: 'target', line: 2}]);
assert.equal(linksInsideMath('#{[定义](target)}').length, 1);
assert.equal(bodyLinks('[来源](https://example.com)及[定义](target)')[0].label, '定义');
console.log('Prerequisite prose scanner: 21 regression cases passed.');
