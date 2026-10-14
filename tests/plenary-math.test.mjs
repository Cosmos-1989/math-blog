import assert from 'node:assert/strict';
import test from 'node:test';

const add = ([a, b], [c, d]) => [a + c, b + d];
const mul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
const div = ([a, b], [c, d]) => [(a * c + b * d) / (c * c + d * d), (b * c - a * d) / (c * c + d * d)];
const abs2 = ([a, b]) => a * a + b * b;
const close = (actual, expected, message) => assert(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} != ${expected}`);

test('three-term Fourier counting formula agrees with enumeration', () => {
  for (const n of [3, 5, 7, 9]) {
    for (let bits = 0; bits < 1 << n; bits++) {
      const f = Array.from({length: n}, (_, i) => (bits >> i) & 1);
      const hat = Array.from({length: n}, (_, r) => f.reduce((sum, value, x) =>
        add(sum, [value * Math.cos(-2 * Math.PI * r * x / n) / n,
          value * Math.sin(-2 * Math.PI * r * x / n) / n]), [0, 0]));
      const fourier = hat.reduce((sum, value, r) => add(sum, mul(mul(value, value), hat[(n - 2 * r % n) % n])), [0, 0]);
      let count = 0;
      for (let x = 0; x < n; x++) for (let d = 0; d < n; d++) count += f[x] * f[(x + d) % n] * f[(x + 2 * d) % n];
      close(fourier[0], count / n ** 2, `n=${n}, set=${bits}`);
      close(fourier[1], 0, 'imaginary part');
    }
  }
});

test('Ward identity uses the positive imaginary part for H minus zI', () => {
  for (const a of [-2, 0, 3]) for (const d of [-1, 2]) for (const b of [0, 1.5]) {
    for (const eta of [0.01, 0.3, 2]) {
      const left = [a - 0.7, -eta], right = [d - 0.7, -eta];
      const determinant = add(mul(left, right), [-b * b, 0]);
      const g00 = div(right, determinant), g11 = div(left, determinant), g01 = div([-b, 0], determinant);
      close(abs2(g00) + abs2(g01), g00[1] / eta, 'row zero');
      close(abs2(g11) + abs2(g01), g11[1] / eta, 'row one');
    }
  }
});

test('quadratic skew shift has vanishing third orbit difference', () => {
  const alpha = Math.sqrt(2), z = 0.21, w = -0.7;
  for (const n of [1, 2, 4, 8]) {
    const orbit = k => [z + k * alpha, w + 2 * k * z + k * k * alpha];
    for (const coordinate of [0, 1]) {
      close(orbit(0)[coordinate] - 3 * orbit(n)[coordinate] + 3 * orbit(2 * n)[coordinate] - orbit(3 * n)[coordinate], 0, 'third difference');
    }
  }
});

test('inverse participation ratio has the stated effective support values', () => {
  for (const n of [1, 3, 9]) for (let m = 1; m <= n; m++) {
    const vector = Array.from({length: n}, (_, i) => i < m ? 1 / Math.sqrt(m) : 0);
    const ipr = vector.reduce((sum, value) => sum + value ** 4, 0);
    close(ipr, 1 / m, 'equal modulus support');
    assert(ipr >= 1 / n - 1e-12 && ipr <= 1 + 1e-12);
  }
});
