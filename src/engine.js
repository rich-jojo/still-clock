(function(root){
'use strict';
const pad=n=>String(n).padStart(2,'0');
function parseDateTime(date,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}:\d{2}$/.test(time)) throw new Error('날짜와 시·분·초를 모두 입력해 주세요.');
 const [y,m,d]=date.split('-').map(Number),[h,i,s]=time.split(':').map(Number);
 const value=new Date(0); value.setFullYear(y,m-1,d); value.setHours(h,i,s,0);
 if(y<1900||y>9999||value.getFullYear()!==y||value.getMonth()!==m-1||value.getDate()!==d||h>23||i>59||s>59||value.getHours()!==h) throw new Error('날짜와 시간을 확인해 주세요.');
 return value.getTime();
}
function parts(ms){
 const d=new Date(ms),h=pad(d.getHours()),m=pad(d.getMinutes()),s=pad(d.getSeconds());
 return {h,m,s,time:`${h}:${m}:${s}`,date:`${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`,weekday:['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][d.getDay()]};
}
class Clock{
 constructor(now=()=>performance.now()){this.now=now;this.running=false;this.initial=0;this.held=0;this.anchor=0;}
 set(value){if(!Number.isFinite(value))throw new Error('올바른 날짜와 시간을 입력해 주세요.');this.running=false;this.initial=value;this.held=value;}
 value(){return this.held+(this.running?this.now()-this.anchor:0);}
 start(){if(this.running)return;this.anchor=this.now();this.running=true;}
 pause(){this.held=this.value();this.running=false;}
 reset(){this.set(this.initial);}
}
const api={Clock,parseDateTime,parts};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StillClock=api;
})(typeof globalThis!=='undefined'?globalThis:this);
