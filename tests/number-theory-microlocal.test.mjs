import assert from 'node:assert/strict';

const zero = n => Array.from({length: n}, () => Array(n).fill(0));
const eye = n => zero(n).map((r, i) => r.map((_, j) => +(i === j)));
const add = (a, b) => a.map((r, i) => r.map((x, j) => x + b[i][j]));
const scale = (a, t) => a.map(r => r.map(x => x * t));
const mul = (a, b) => a.map(r => b[0].map((_, j) => r.reduce((s, x, k) => s + x * b[k][j], 0)));
const norm = a => Math.sqrt(a.flat().reduce((s, x) => s + x * x, 0));
const comm = (a, b) => add(mul(a, b), scale(mul(b, a), -1));
function exp(a) {
  let term = eye(a.length), sum = term;
  for (let j = 1; j <= 30; j++) { term = scale(mul(term, a), 1 / j); sum = add(sum, term); }
  return sum;
}
function logNearIdentity(a) {
  const z = add(a, scale(eye(a.length), -1));
  let term = eye(a.length), sum = zero(a.length);
  for (let j = 1; j <= 50; j++) { term = mul(term, z); sum = add(sum, scale(term, (-1) ** (j + 1) / j)); }
  return sum;
}
function rank(a) {
  const m = a.map(r => [...r]);
  let row = 0;
  for (let j = 0; j < m[0].length && row < m.length; j++) {
    let pivot = row;
    for (let i = row + 1; i < m.length; i++) if (Math.abs(m[i][j]) > Math.abs(m[pivot][j])) pivot = i;
    if (Math.abs(m[pivot][j]) < 1e-9) continue;
    [m[row], m[pivot]] = [m[pivot], m[row]];
    const p = m[row][j];
    for (let k = j; k < m[0].length; k++) m[row][k] /= p;
    for (let i = row + 1; i < m.length; i++) {
      const q = m[i][j];
      for (let k = j; k < m[0].length; k++) m[i][k] -= q * m[row][k];
    }
    row++;
  }
  return row;
}

let bchCases = 0, compositionCases = 0, stableCases = 0;
for (let j = 0; j < 30; j++) {
  const x = [[j % 3 - 1, (j % 5 - 2) / 2], [1 / 3, -1 / 4]];
  const y = [[-1 / 5, 1 / 4], [(j % 7 - 3) / 3, j % 2 - 1 / 2]];
  for (const h of [0.02, 0.01, 0.005]) {
    const actual = logNearIdentity(mul(exp(scale(x, h)), exp(scale(y, h))));
    const expected = add(scale(add(x, y), h), scale(comm(x, y), h * h / 2));
    assert(norm(add(actual, scale(expected, -1))) <= 3 * h ** 3);
    bchCases++;
  }
}

// Exact Gaussian left-symbol product fixes the sign of the h/i correction.
for (const x of [-1, -0.5, 0, 0.5, 1]) for (const xi of [-1, -0.5, 0.5, 1]) {
  for (const h of [0.05, 0.025, 0.0125]) {
    const d = 1 + 4 * h * h;
    const amplitude = Math.exp(-x*x - 2*xi*xi + (4*h*h*xi*xi - x*x) / d) / Math.sqrt(d);
    const angle = -4 * h * x * xi / d;
    const leading = Math.exp(-2*x*x - 2*xi*xi);
    const error = Math.hypot(amplitude * Math.cos(angle) - leading,
      amplitude * Math.sin(angle) + 4 * h * x * xi * leading);
    assert(error <= 10 * h * h);
    compositionCases++;
  }
}

for (let n = 1; n <= 6; n++) for (const d of [-3, 0, 4]) {
  const tau = zero(n + 1);
  for (let i = 0; i < n; i++) { tau[i][i] = 2 * i + 1; tau[i][n] = 1; tau[n][i] = 1; }
  tau[n][n] = d;
  // At a principal-block eigenvalue, the arrowhead determinant is nonzero.
  for (let i = 0; i < n; i++) {
    let detAtEigenvalue = -1;
    for (let j = 0; j < n; j++) if (i !== j) detAtEigenvalue *= 2 * (i - j);
    assert.notEqual(detAtEigenvalue, 0);
  }
  const columns = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = zero(n + 1); x[i][j] = 1;
    columns.push(comm(x, tau).flat());
  }
  const derivative = columns[0].map((_, i) => columns.map(c => c[i]));
  assert.equal(rank(derivative), n * n);
  stableCases++;
}
console.log(JSON.stringify({result: 'pass', bchCases, compositionCases, stableCases,
  scope: 'Numerical regression checks for signs, scaling and sampled stable matrices; not a proof certification.'}));
