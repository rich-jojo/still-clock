const {test,expect}=require('@playwright/test');
const path=require('node:path');
const target=process.env.CLOCK_URL||'file://'+path.resolve(__dirname,'../index.html');
test('configure precise date and second, start clean capture, pause and reset',async({page})=>{
 await page.goto(target);
 await page.getByRole('button',{name:'날짜·시간 설정'}).click();
 await page.getByLabel('날짜', {exact:true}).fill('2026-12-31');
 await page.getByLabel('시', {exact:true}).fill('23');
 await page.getByLabel('분', {exact:true}).fill('59');
 await page.getByLabel('초', {exact:true}).fill('58');
 await page.getByRole('button',{name:'이 시간으로 맞추기'}).click();
 await expect(page.locator('#clock')).toHaveAttribute('aria-label','2026.12.31 23:59:58');
 await page.waitForTimeout(1100);
 await expect(page.locator('#clock')).toHaveAttribute('aria-label','2026.12.31 23:59:58');
 await page.getByRole('button',{name:'시작',exact:true}).click();
 await expect(page.locator('body')).toHaveClass(/capture/);
 await page.waitForTimeout(3200);
 await expect(page.locator('#dateDisplay')).toContainText('2027.01.01');
 await page.locator('#reveal').click();
 await page.getByRole('button',{name:'일시정지',exact:true}).click();
 const held=await page.locator('#clock').getAttribute('aria-label');
 await page.waitForTimeout(1100);
 expect(await page.locator('#clock').getAttribute('aria-label')).toBe(held);
 await page.getByRole('button',{name:'처음으로'}).click();
 await expect(page.locator('#clock')).toHaveAttribute('aria-label','2026.12.31 23:59:58');
});
test('all appearance controls, persistence, invalid input, now button and Escape',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(target);
 await page.locator('#appearance').click();
 for(const theme of ['ink','blue','cherry','chalk']){await page.locator(`button[data-theme=${theme}]`).click();await expect(page.locator('body')).toHaveAttribute('data-theme',theme);}
 for(const layout of ['line','split','stack']){await page.locator(`button[data-layout=${layout}]`).click();await expect(page.locator('body')).toHaveAttribute('data-layout',layout);}
 await page.locator('#showSeconds').uncheck();await expect(page.locator('.seconds')).toBeHidden();await page.locator('#showSeconds').check();
 await page.locator('#showDate').uncheck();await expect(page.locator('.dateRow')).toBeHidden();await page.locator('#showDate').check();
 await page.locator('#fullscreen').uncheck();await page.locator('#fullscreen').check();
 await page.locator('#delay').selectOption('3');await page.locator('#delay').selectOption('5');await page.locator('#delay').selectOption('0');
 await page.locator('#captionInput').fill('우리의 첫 장면');await expect(page.locator('#captionDisplay')).toHaveText('우리의 첫 장면');
 await page.getByRole('button',{name:'꾸미기 완료',exact:true}).click();
 await page.reload();await expect(page.locator('#captionDisplay')).toHaveText('우리의 첫 장면');
 await page.locator('#appearance').click();await page.getByRole('button',{name:'화면 꾸미기 닫기',exact:true}).click();
 await page.locator('#edit').click();await page.locator('#hourInput').fill('24');await page.locator('#timeForm button[type=submit]').click();await expect(page.locator('#timeError')).not.toBeEmpty();
 await page.locator('#now').click();await expect(page.locator('#timeError')).toBeEmpty();
 await page.keyboard.press('Escape');await expect(page.locator('#timeDialog')).not.toBeVisible();
 await page.locator('#edit').click();await page.getByRole('button',{name:'날짜·시간 설정 닫기',exact:true}).click();
 await page.locator('#capture').click();await expect(page.locator('body')).toHaveClass(/capture/);await page.keyboard.press('Escape');await expect(page.locator('body')).not.toHaveClass(/capture/);
 expect(errors).toEqual([]);
});
test('all 12 visual combinations fit narrow, tablet, desktop and landscape',async({page})=>{
 await page.goto(target);
 for(const [width,height]of [[320,740],[360,800],[412,915],[768,1024],[1440,900],[915,412]]){
  await page.setViewportSize({width,height});
  for(const theme of ['chalk','ink','blue','cherry'])for(const layout of ['stack','line','split']){
   await page.evaluate(({theme,layout})=>{settings.theme=theme;settings.layout=layout;apply();enterCapture();},{theme,layout});
   const box=await page.locator('#clock').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(height+1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   for(const id of ['hours','minutes','seconds']){const r=await page.locator('#'+id).boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(width+1);}
  }
 }
});
test('preparation countdown does not advance configured time early',async({page})=>{
 await page.goto(target);await page.locator('#appearance').click();await page.locator('#delay').selectOption('3');await page.getByRole('button',{name:'꾸미기 완료'}).click();
 const original=await page.locator('#clock').getAttribute('aria-label');
 await page.locator('#start').click();await expect(page.locator('#countdown')).toHaveText('3');await page.waitForTimeout(1200);expect(await page.locator('#clock').getAttribute('aria-label')).toBe(original);await page.waitForTimeout(3100);await expect(page.locator('#countdown')).toBeHidden();expect(await page.locator('#clock').getAttribute('aria-label')).not.toBe(original);
});
test('unsupported fullscreen offers fallback that still starts the clock',async({page})=>{
 await page.goto(target);await page.evaluate(()=>{document.documentElement.requestFullscreen=()=>Promise.reject(new Error('unsupported'));});
 await page.locator('#start').click();await expect(page.locator('#helpDialog')).toBeVisible();
 const held=await page.locator('#clock').getAttribute('aria-label');await page.locator('#continueCapture').click();
 await page.waitForTimeout(1200);expect(await page.locator('#clock').getAttribute('aria-label')).not.toBe(held);
});
test('standalone file has no network dependency',async({page})=>{
 const requests=[];page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});await page.goto(target);await page.evaluate(()=>document.fonts.ready);expect(requests.filter(u=>u!==target)).toEqual([]);
});
