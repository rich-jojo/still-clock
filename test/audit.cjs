const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 fs.mkdirSync(path.join(__dirname,'../artifacts'),{recursive:true});
 const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:412,height:915}});const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));
 const scans=[];
 for(const theme of ['chalk','ink','blue','cherry']){
  await p.evaluate(theme=>{settings.theme=theme;apply();},theme);
  for(const panel of [null,'timeDialog','appearanceDialog']){
   if(panel)await p.evaluate(id=>document.getElementById(id).showModal(),panel);
   const results=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   scans.push({theme,panel,violations:results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
   if(panel)await p.evaluate(id=>document.getElementById(id).close(),panel);
  }
 }
 await p.evaluate(()=>{clock.set(parseDateTime('2026-11-08','09:41:08'));settings.caption='';settings.theme='chalk';settings.layout='stack';apply();render();enterCapture();});
 await p.evaluate(()=>document.fonts.ready);
 for(const [theme,layout]of [['chalk','stack'],['ink','split'],['blue','line'],['cherry','stack']]){
  await p.evaluate(({theme,layout})=>{settings.theme=theme;settings.layout=layout;apply();},{theme,layout});
  await p.screenshot({path:path.resolve(__dirname,`../artifacts/${theme}-${layout}.png`)});
 }
 await p.evaluate(()=>leaveCapture());
 await p.emulateMedia({reducedMotion:'reduce'});
 await p.evaluate(()=>{settings.theme='chalk';settings.layout='stack';apply();});
 await p.locator('#edit').click();await p.keyboard.press('Escape');
 const checks={scans,consoleErrors:errors};fs.writeFileSync(path.resolve(__dirname,'../artifacts/audit.json'),JSON.stringify(checks,null,2));
 console.log(JSON.stringify(checks,null,2));await b.close();assert.equal(scans.reduce((n,s)=>n+s.violations.length,0),0);assert.deepEqual(errors,[]);
})().catch(e=>{console.error(e);process.exit(1);});
