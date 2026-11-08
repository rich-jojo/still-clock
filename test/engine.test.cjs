const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('configured second stays still until Start, then advances across midnight',()=>{
 const file=path.join(__dirname,'../src/engine.js');
 assert.ok(fs.existsSync(file),'clock engine must exist');
 const {Clock,parseDateTime,parts}=require(file);
 let now=0; const c=new Clock(()=>now);
 c.set(parseDateTime('2026-12-31','23:59:58'));
 now=4000; assert.equal(parts(c.value()).time,'23:59:58');
 c.start(); now=7000;
 assert.equal(parts(c.value()).time,'00:00:01');
 assert.equal(parts(c.value()).date,'2027.01.01');
});
test('pause holds subsecond precision, resume continues, reset returns configured second',()=>{
 const {Clock,parseDateTime,parts}=require('../src/engine.js');
 let now=0;const c=new Clock(()=>now);c.set(parseDateTime('2026-01-01','12:34:56'));
 c.start();now=1750;c.pause();const held=c.value();now=10000;assert.equal(c.value(),held);
 c.start();now=10250;assert.equal(parts(c.value()).time,'12:34:58');
 c.reset();assert.equal(parts(c.value()).time,'12:34:56');assert.equal(c.running,false);
});
test('reject invalid dates and seconds without silently rolling over',()=>{
 const {parseDateTime}=require('../src/engine.js');
 for(const [d,t] of [['2026-02-30','10:00:00'],['2026-01-01','24:00:00'],['2026-01-01','12:00:60'],['','12:00:00'],['2026-01-01','12:00']]) assert.throws(()=>parseDateTime(d,t));
 assert.ok(Number.isFinite(parseDateTime('2028-02-29','00:00:00')));
});
