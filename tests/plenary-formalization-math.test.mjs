import assert from 'node:assert/strict';
import test from 'node:test';

const close=(a,b,tolerance=1e-10)=>assert(Math.abs(a-b)<=tolerance,`${a} != ${b}`);

test('equal marginal success probabilities allow radically different joint success',()=>{
  const omega=Array.from({length:100},(_,i)=>i);
  const common=()=>omega.filter(i=>i<99);
  const separated=j=>omega.filter(i=>i!==j);
  for(let j=0;j<100;j++) {
    close(common(j).length/100,0.99);
    close(separated(j).length/100,0.99);
  }
  assert.equal(omega.filter(i=>Array.from({length:100},(_,j)=>common(j).includes(i)).every(Boolean)).length,99);
  assert.equal(omega.filter(i=>Array.from({length:100},(_,j)=>separated(j).includes(i)).every(Boolean)).length,0);
  close(0.99**1000*100,0.004317124741065786,1e-12);
});

test('conditional probabilities telescope without an independence hypothesis',()=>{
  const weights=[1,2,3,4,5,6,7,8],total=36;
  const events=[i=>i%2===0,i=>i<5,i=>i!==2];
  let remaining=weights.map((_,i)=>i),product=1;
  for(const event of events) {
    const previous=remaining.reduce((sum,i)=>sum+weights[i],0);
    remaining=remaining.filter(event);
    const current=remaining.reduce((sum,i)=>sum+weights[i],0);
    product*=current/previous;
  }
  close(product,remaining.reduce((sum,i)=>sum+weights[i],0)/total);
});

test('zero-totalized division preserves distributivity and has the exact cancellation condition',()=>{
  const divide=(a,b)=>b===0?0:a/b;
  for(let a=-5;a<=5;a++) for(let b=-5;b<=5;b++) for(let c=-5;c<=5;c++)
    close(divide(a+b,c),divide(a,c)+divide(b,c));
  for(let a=-5;a<=5;a++) for(let b=-5;b<=5;b++)
    assert.equal(Math.abs(divide(a,b)*b-a)<1e-12,b!==0||a===0);
  assert(divide(1,0)<0.01);
  assert(!(divide(1,1)<=divide(1,0)));
});

test('positive reciprocal thresholds and common small parameters meet strict inequalities',()=>{
  for(const epsilon of [1e-6,0.01,0.5,1,2,100]) {
    const N=Math.floor(Math.max(1,1/epsilon))+1;
    assert(N>0&&1/N<epsilon);
    for(const n of [N,N+1,2*N,10*N]) assert(1/n<=1/N&&1/n<epsilon);
  }
  for(const eta of [1e-8,0.1,0.5,1,100]) {
    const epsilon=Math.min(1/4,eta/2);
    assert(0<epsilon&&epsilon<0.5&&epsilon<eta);
  }
});

test('amortization crosses one exactly at the stated strict threshold',()=>{
  for(const A of [0,1,100]) for(const a of [0,1,3,10]) for(const b of [1,3,10])
    for(let n=1;n<=100;n++) {
      const F=(A+n*a)/(n*b);
      if(a<b) assert.equal(F<1,n>A/(b-a));
      else assert(F>=1);
    }
});
