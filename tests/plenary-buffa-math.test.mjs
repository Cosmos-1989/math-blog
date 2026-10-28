import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

// Finite arithmetic and source regressions, not PDE solver or deep-theorem tests.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = path.join(root, 'trees/math/numerical-analysis/pde-approximation-buffa');
const packet = JSON.parse(fs.readFileSync(path.join(root, 'research/plenary-buffa-packet.json'), 'utf8'));
const owned = new Map(fs.readdirSync(folder).filter(f => f.endsWith('.tree'))
  .map(f => [path.basename(f, '.tree'), fs.readFileSync(path.join(folder, f), 'utf8')]));
owned.set('icm2026-buffa', fs.readFileSync(path.join(root, 'trees/references/icm2026-buffa.tree'), 'utf8'));
const close = (a, b, label = '') => assert(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${label}: ${a} != ${b}`);
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const det = ([a, b, c, d]) => a * d - b * c;
const transpose = ([a, b, c, d]) => [a, c, b, d];
const mul = (a, b) => [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]];
const mv = (a, v) => [a[0] * v[0] + a[1] * v[1], a[2] * v[0] + a[3] * v[1]];
const inverse = a => [a[3], -a[1], -a[2], a[0]].map(x => x / det(a));
const cofactor = ([a, b, c, d]) => [d, -c, -b, a];
const trace = a => a[0] + a[3];
const identity = [1, 0, 0, 1];
const matrices = function* (bound) {
  for (let a = -bound; a <= bound; a++) for (let b = -bound; b <= bound; b++)
    for (let c = -bound; c <= bound; c++) for (let d = -bound; d <= bound; d++) yield [a, b, c, d];
};

test('4Y01/03/04/08: 6016 invertible integer Jacobians satisfy the metric identities', () => {
  let count = 0;
  for (const j of matrices(4)) if (det(j) !== 0) {
    count++;
    const g = mul(transpose(j), j), a = cofactor(g);
    assert.equal(det(g), det(j) ** 2);
    assert.equal(det(a), det(g));
    assert.equal(a[1], a[2]);
    assert(a[0] > 0 && det(a) > 0);
    const product = mul(a, g);
    product.forEach((value, i) => close(value, det(g) * identity[i]));
    const gamma = trace(a) / dot(a, a);
    close(dot(a.map((x, i) => gamma * x - identity[i]), a.map((x, i) => gamma * x - identity[i])), 2 - trace(a) ** 2 / dot(a, a));
  }
  assert.equal(count, 6016);
});

test('4Y03: inverse second-derivative contraction has the stated sign and matrix order', () => {
  const hessians = [[2, 3, 3, -1], [-4, 1, 1, 5]];
  for (const j of matrices(2)) if (det(j) !== 0) {
    const k = inverse(j), gInv = inverse(mul(transpose(j), j));
    const h = hessians.map(hessian => dot(gInv, hessian));
    const laplaceInverse = [0, 0];
    // Differentiate the inverse identity twice, before contracting in z.
    for (let component = 0; component < 2; component++) for (let ell = 0; ell < 2; ell++)
      for (let i = 0; i < 2; i++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++)
        laplaceInverse[component] -= k[2 * component + i] * hessians[i][2 * a + b] * k[2 * a + ell] * k[2 * b + ell];
    mv(j, laplaceInverse).forEach((value, i) => close(value, -h[i]));
  }
});

test('4Y07: 338350 eigenvalue cases obey the two-dimensional Cordes parameter', () => {
  let count = 0;
  for (let k = 1; k <= 100; k++) for (let a = 1; a <= k; a++) for (let b = 1; b <= k; b++) {
    count++;
    const epsilon = 2 * k / (1 + k * k);
    assert(2 * a * b / (a * a + b * b) >= epsilon - 1e-14);
    assert((a * a + b * b) / (a + b) ** 2 <= 1 / (1 + epsilon) + 1e-14);
  }
  assert.equal(count, 338350);
  assert(102 / 144 > 1 / 2);
});

test('4Y04: unit determinant alone permits arbitrarily bad cofactor ellipticity', () => {
  for (const t of [1, 2, 10, 1000]) {
    const j = [t, 0, 0, 1 / t], a = cofactor(mul(transpose(j), j));
    close(det(j), 1);
    close(a[0], 1 / (t * t));
    close(a[3], t * t);
  }
});

test('4Y05: a variable diagonal coefficient distinguishes divergence and nondivergence form', () => {
  for (const x of [0, 0.25, 0.5, 1]) {
    const a = [1 + x, 0, 0, 1], hessian = [0, 0, 0, 0], gradient = [1, 0];
    const nondivergence = dot(a, hessian);
    const coefficientDerivative = dot([1, 0], gradient);
    assert.equal(nondivergence, 0);
    assert.equal(nondivergence + coefficientDerivative, 1);
  }
});

const multiplyPolynomials = (a, b) => {
  const c = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { c[i + j] += x * y; }));
  return c;
};
test('4Y09: radial polynomial disk examples check the curvature sign and Hessian multiplicity', () => {
  let coefficients = [1];
  for (let k = 1; k <= 7; k++) {
    coefficients = multiplyPolynomials(coefficients, [1, -1]);
    const radial = coefficients.slice(1).map((c, i) => 2 * (i + 1) * (2 * i + 1) * c);
    const tangential = coefficients.slice(1).map((c, i) => 2 * (i + 1) * c);
    const laplace = radial.map((c, i) => c + tangential[i]);
    const integralDisk = p => Math.PI * p.reduce((sum, c, i) => sum + c / (i + 1), 0);
    const lhs = integralDisk(multiplyPolynomials(laplace, laplace)) - integralDisk(multiplyPolynomials(radial, radial)) - integralDisk(multiplyPolynomials(tangential, tangential));
    const normalDerivative = tangential.reduce((a, b) => a + b, 0);
    close(lhs, 2 * Math.PI * normalDerivative ** 2, `power ${k}`);
  }
});

test('4Y0E/0F: one-dimensional mass recovery retains the interface delta and smooth consistency', () => {
  const mass = [[2, 1, 0], [1, 4, 1], [0, 1, 2]].map(row => row.map(x => x / 6));
  const derivativeOfHat = [[-1, 0], [1, -1], [0, 1]];
  const endpointValues = [[1, 0], [0, 0], [0, 1]];
  // For |s|, piecewise derivative is -1,+1 and boundary flux is +1 at both ends.
  const rhsKink = derivativeOfHat.map((slope, i) => slope[0] - slope[1] + endpointValues[i][0] + endpointValues[i][1]);
  assert.deepEqual(rhsKink, [0, 2, 0]);
  const recovered = [-2, 4, -2];
  mass.forEach((row, i) => close(dot(row, recovered), rhsKink[i]));
  close(dot([0.5, 1, 0.5], recovered), 2);
  // For s^2, the derivative integrals on the two elements are -1,+1; boundary flux is 2.
  const rhsQuadratic = derivativeOfHat.map((slope, i) => slope[0] - slope[1] + 2 * (endpointValues[i][0] + endpointValues[i][1]));
  mass.forEach((row, i) => close(dot(row, [2, 2, 2]), rhsQuadratic[i]));
});

test('4Y0G: fixed-point compensation cancels the shift; a shifted residual does not', () => {
  const hessians = [[2, 1, 1, 3], [-1, 2, 2, 1], [0, 0, 0, 0]];
  for (const j of matrices(2)) for (const h of hessians) for (const mu of [0.0001, 0.5, 2]) {
    const a = cofactor(mul(transpose(j), j));
    const shifted = a.map((x, i) => x + mu * identity[i]);
    close(dot(shifted, h) - mu * trace(h), dot(a, h));
    close(dot(shifted, h) - dot(a, h), mu * trace(h));
  }
});

test('4Y0H: small derivative perturbations preserve determinant sign, not global injectivity', () => {
  for (const j of matrices(2)) if (det(j) > 0) {
    const g = mul(transpose(j), j);
    const smallest = (trace(g) - Math.sqrt(trace(g) ** 2 - 4 * det(g))) / 2;
    const m = Math.sqrt(smallest), e = [m / 4, -m / 4, m / 4, m / 4];
    for (const t of [0, 0.25, 0.5, 0.75, 1]) assert(det(j.map((x, i) => x + t * e[i])) > 0);
  }
  const polar = (s, t) => [Math.exp(s) * Math.cos(t), Math.exp(s) * Math.sin(t)];
  polar(0.3, 0.5).forEach((v, i) => close(v, polar(0.3, 0.5 + 2 * Math.PI)[i]));
});

test('4Y0B/0D/0I: nonsymmetric finite-dimensional perturbation model checks both constants', () => {
  for (const q of [0, 0.2, 0.8, 0.99]) for (const u of [[1, 2], [0, 1], [3, 0], [-2, 3]]) {
    const t = [1, q, -q, 1], f = mv(t, u);
    const uh = [f[0], 0], e = [u[0] - uh[0], u[1]], norm = Math.hypot(...e);
    close(mv(t, e)[0], 0, 'Galerkin orthogonality');
    assert(norm <= (1 + q) / (1 - q) * Math.abs(u[1]) + 1e-12);
    const residual = Math.hypot(...mv(t, e));
    assert(residual >= (1 - q) * norm - 1e-12);
    assert(residual <= (1 + q) * norm + 1e-12);
  }
});

const links = text => [...text.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)].map(m => m[1]).filter(target => !/^(https?:|mailto:|#)/.test(target));
const index = new Map();
function indexFiles(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) indexFiles(file);
    else if (entry.name.endsWith('.tree')) {
      const id = path.basename(file, '.tree');
      if (!index.has(id)) index.set(id, []);
      index.get(id).push(file);
    }
  }
}
indexFiles(path.join(root, 'trees'));

test('packet: owned keys, claim provenance and preliminary report boundary are explicit', () => {
  assert.equal(owned.size, 20);
  for (const map of [packet.prerequisites, packet.report.proof_scope, packet.report.claim_sources])
    assert.deepEqual(Object.keys(map).sort(), [...owned.keys()].sort());
  assert.equal(packet.report.integration_status, 'preliminary-selected-branches');
  for (const licenseTerm of ['官方视频', 'arXiv perpetual non-exclusive', 'CC BY 4.0', 'SIAM'])
    assert(packet.report.license.includes(licenseTerm));
  assert.equal(packet.report.source_url, 'https://www.youtube.com/watch?v=D2_RHzeWcgk');
  assert.deepEqual(packet.report.subject_ids, ['006F', '006A']);
  assert(packet.source_readings.every(source => source.full_mathematical_body === false));
  assert(packet.source_readings.some(source => source.role === 'background-paper' && source.scope.includes('2089')));
  assert(packet.report.unexpanded_deep_proofs.some(item => item.includes('4Y0A')));
  assert(!packet.report.doi && !packet.report.pages);
});

test('Buffa reference: Oxford URL cannot start a Forester comment and plenary terminology is consistent', () => {
  const reference = owned.get('icm2026-buffa');
  assert(reference.includes('https://ora.ox.ac.uk/objects/uuid:2a5d4bbb-4d35-43eb-85f9-83be2d3b8324'));
  assert(!reference.includes('%'), 'raw percent would start a Forester line comment');
  assert(reference.includes('ICM 2026 全会报告'));
  assert(!reference.includes('全体报告'));
  const checkUrls = value => {
    if (typeof value === 'string' && value.startsWith('https://ora.ox.ac.uk/')) {
      assert(value.includes('/objects/uuid:'));
      assert(!value.includes('%'));
    } else if (value && typeof value === 'object') Object.values(value).forEach(checkUrls);
  };
  checkUrls(packet);
});

test('Buffa handoff: owned source and test SHA-256 values match the current bytes', () => {
  const digest = bytes => createHash('sha256').update(bytes).digest('hex');
  const expectedIds = [...owned.keys()].sort();
  assert.deepEqual(Object.keys(packet.validation.source_sha256).sort(), expectedIds);
  for (const id of expectedIds) {
    const file = id === 'icm2026-buffa' ? 'trees/references/icm2026-buffa.tree'
      : `trees/math/numerical-analysis/pde-approximation-buffa/${id}.tree`;
    assert.equal(packet.validation.source_sha256[id], digest(fs.readFileSync(path.join(root, file))), file);
  }
  assert.equal(packet.validation.test_sha256, digest(fs.readFileSync(fileURLToPath(import.meta.url))));
});

test('owned sources: canonical links resolve, prerequisite targets are mathematical and locally linked', () => {
  for (const [id, text] of owned) {
    assert.equal(index.get(id)?.length, 1, `${id}: duplicate or absent ID`);
    const actual = new Set(links(text));
    for (const target of actual) assert.equal(index.get(target)?.length, 1, `${id}: missing or duplicate ${target}`);
    const body = text.slice(text.indexOf('\n\n') + 2);
    for (const target of packet.prerequisites[id]) {
      assert(links(body).includes(target), `${id}: prerequisite absent from body: ${target}`);
      const targetText = fs.readFileSync(index.get(target)[0], 'utf8');
      assert.match(targetText, /\\taxon\{(?:Definition|Theorem|Construction)\}/, `${id}: non-mathematical prerequisite ${target}`);
    }
  }
  const reused = [...new Set(Object.values(packet.prerequisites).flat().filter(id => !owned.has(id)))].sort();
  assert.deepEqual(packet.reviewed_reused_ids, reused);
});

test('owned prerequisite closures are acyclic; outline reaches all new mathematical atoms', () => {
  const shared = JSON.parse(fs.readFileSync(path.join(root, 'research/site-evergreen-audit.json'), 'utf8'));
  const graph = {...shared.prerequisites, ...packet.prerequisites};
  const active = new Set(), done = new Set();
  function visit(id) {
    assert(!active.has(id), `cycle at ${id}`);
    if (done.has(id)) return;
    active.add(id);
    for (const target of graph[id] ?? []) visit(target);
    active.delete(id);
    done.add(id);
  }
  for (const id of owned.keys()) visit(id);
  const reached = new Set(), queue = ['4Y00'];
  while (queue.length) {
    const id = queue.pop();
    if (reached.has(id) || !owned.has(id)) continue;
    reached.add(id);
    queue.push(...links(owned.get(id)));
  }
  assert.deepEqual([...reached].sort(), [...owned.keys()].sort());
});

function formulas(text) {
  const result = [];
  for (let i = 0; i < text.length; i++) if (text[i] === '#' && text[i + 1] === '{') {
    const start = i + 2;
    let depth = 1, j = start;
    for (; j < text.length && depth; j++) {
      if (text[j] === '{') depth++;
      if (text[j] === '}') depth--;
    }
    assert.equal(depth, 0, 'unbalanced math group');
    result.push(text.slice(start, j - 1));
    i = j - 1;
  }
  return result;
}
test('owned formulas and source conventions: KaTeX parses every formula without a global build', t => {
  const require = createRequire(import.meta.url);
  assert(process.env.KATEX_PATH, 'Set KATEX_PATH to the pinned KaTeX CommonJS bundle.');
  const katex = require(path.resolve(process.env.KATEX_PATH));
  let count = 0;
  for (const [id, text] of owned) {
    assert.match(text, /^\\title\{[^\n]+\}\n\\date\{2026-10-28\}\n\\taxon\{[^\n]+\}\n\\author\{author\}\n\\meta\{source\}/);
    assert(!text.includes('[['), `${id}: literal double bracket is a Forester link risk`);
    assert(!/\\[A-Za-z][A-Za-z0-9_-]*\/[A-Za-z0-9\\([]/.test(text), `${id}: command adjacent to slash`);
    assert(!/\\(?:leq|geq|neq|times|longrightarrow)\d/.test(text), `${id}: command adjacent to numeral`);
    assert(!/此处采用其结论|不展开.*证明|自己的解与稳定性框架/.test(text), `${id}: process prose`);
    for (const tex of formulas(text)) {
      count++;
      assert.doesNotThrow(() => katex.renderToString(tex, {throwOnError: true, strict: 'error'}), `${id}: ${tex}`);
      const stack = [];
      for (const character of tex) {
        if (character === '(' || character === '[') stack.push(character);
        if (character === ')' || character === ']') assert.equal(stack.pop(), character === ')' ? '(' : '[', `${id}: unmatched literal interval delimiter`);
      }
      assert.equal(stack.length, 0, `${id}: unmatched literal interval delimiter`);
    }
  }
  assert(count >= 250, `unexpectedly few formulas: ${count}`);
  t.diagnostic(`${count} formulas checked in ${owned.size} owned pages; no Forester build or rendered-page check`);
});
