import assert from 'node:assert/strict';

const near = (actual, expected, tolerance = 1e-10) =>
  assert(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
let latticeExamples = 0;
for (let m = -20; m <= 20; m++) for (let k = -20; k <= 20; k++) {
  if (!m && !k) continue;
  // 0N09: squared lengths in the triangular lattice are positive integers.
  const squared = m*m + m*k + k*k;
  assert(squared >= 1);
  near(squared, (m+k/2)**2 + 3*k*k/4);
  latticeExamples++;
}
near((Math.PI/4)/(Math.sqrt(3)/2), Math.PI/(2*Math.sqrt(3)));
for (const scale of [0.1, 0.5, 1, 2, 10]) {
  near(Math.PI*(scale/2)**2/(scale*scale*Math.sqrt(3)/2), Math.PI/(2*Math.sqrt(3)));
}

let spectralEstimates = 0;
for (const m of [1, 2, 5, 10, 20]) {
  // 0O0F: undoing normalized trace costs one power of genus.
  const c = 1/(2*m);
  near(c*m-1, -0.5);
  for (const genus of [10, 100, 1000, 10000]) {
    const epsilon = genus**(-c);
    near(genus*genus**(-2)*epsilon**(-m), genus**(-0.5));
    spectralEstimates++;
  }
}
for (const k of [2, 3, 5, 10, 30]) for (const x of [0, 0.01, 0.1, 1, 5, 10, 20]) {
  // 0O0B: the repeat-geodesic bound includes k=2, not only k>=3.
  assert(Math.sinh(x/(2*k))**2 <= Math.sinh(x/2)/k + 1e-10);
}

let shearExamples = 0;
const vertical = theta => Math.sin(2*Math.PI*theta);
const commutator = (theta, y, t) => {
  const a = theta+t*y;
  const b = y+t*vertical(a);
  const c = a-t*b;
  return [c, b-t*vertical(c)];
};
for (const theta of [0.12, 0.34, 0.61]) for (const y of [-0.83, 0.27, 1.2]) {
  let previous = Infinity;
  for (const t of [0.01, 0.005, 0.0025, 0.00125]) {
    const [a,b] = commutator(theta,y,t);
    const error = Math.hypot(a-theta+t*t*vertical(theta),
      b-y-t*t*y*2*Math.PI*Math.cos(2*Math.PI*theta));
    // 0P0E: V^-1 T^-1 V T has X_H=(-H_y,H_theta), H=y*sin(2*pi*theta).
    assert(error <= 200*t**3);
    assert(error < previous);
    previous = error;
    shearExamples++;
  }
}

let scatteringExamples = 0;
for (const radius of [0.1, 1, 3]) {
  let previous = 0;
  for (const z of [0.001, 0.01, 0.1, 1, 3, 10, 30]) {
    const kappa = z/radius;
    const v0 = 2*kappa*kappa;
    const a = radius-Math.tanh(z)/kappa;
    const coefficient = 1/(kappa*Math.cosh(z));
    // 0Q0F: interior u=C*sinh(kappa*r), exterior u=r-a.
    near(coefficient*Math.sinh(z), radius-a);
    near(coefficient*kappa*Math.cosh(z), 1);
    assert(a > previous && a < radius);
    assert(a < v0*radius**3/6);
    previous = a;
    scatteringExamples++;
  }
}
let annulusExamples = 0;
for (const theta of [0, 0.12, 0.34, 0.61, 1]) {
  const lower = 0.2*Math.sin(2*Math.PI*theta);
  const width = 2+0.4*Math.cos(2*Math.PI*theta);
  const first = theta+0.2*Math.sin(2*Math.PI*theta)/(2*Math.PI);
  const firstAfterPeriod = theta+1+0.2*Math.sin(2*Math.PI*(theta+1))/(2*Math.PI);
  // 0P0T: L'=w/2 and r_y=2/w make the Jacobian equal to one.
  near(firstAfterPeriod-first, 1);
  near((width/2)*(2/width), 1);
  for (const r of [-1, -0.5, 0, 0.5, 1]) {
    const y = lower+(r+1)*width/2;
    near(2*(y-lower)/width-1, r);
    annulusExamples++;
  }
}
let bogoliubovExamples = 0;
for (const A of [1, 2, 10]) for (const ratio of [-0.9, -0.3, 0, 0.4, 0.95]) {
  const B = ratio*A, D = Math.sqrt(A*A-B*B), alpha = B/(A+D);
  // 0Q0Q: verify both operator coefficients and the vacuum energy shift.
  near(D*(1+alpha*alpha)/(1-alpha*alpha), A);
  near(2*D*alpha/(1-alpha*alpha), B);
  near(2*D*alpha*alpha/(1-alpha*alpha), A-D);
  bogoliubovExamples++;
}
const primitive = r => (r*r+2)**2.5/5-2*(r*r+2)**1.5/3-r**5/5-r**3/3+r/2;
near(primitive(0), -8*Math.sqrt(2)/15);
for (const r of [0.1, 0.3, 1, 2]) {
  const h = 1e-5;
  near((primitive(r+h)-primitive(r-h))/(2*h),
    r**3*Math.sqrt(r*r+2)-r**4-r*r+0.5, 1e-8);
}
for (const a of [0.1, 1, 3]) for (const rho of [0.001, 0.1, 1]) {
  const s = 8*Math.PI*a*rho;
  const radial = 2*Math.sqrt(2)*s**2.5/(15*Math.PI**2);
  const lhy = 4*Math.PI*a*rho*rho*128/(15*Math.sqrt(Math.PI))*Math.sqrt(rho*a**3);
  near(radial/lhy, 1);
}
for (let n=0; n<=30; n++) near((n+1)*(n+2)-4*(n+1)+2, n*(n-1));
console.log(JSON.stringify({latticeExamples, spectralEstimates, shearExamples, scatteringExamples,
  annulusExamples, bogoliubovExamples,
  scope: 'Checks explicit coordinate calculations and normalization factors, not the cited research theorems.'}));
