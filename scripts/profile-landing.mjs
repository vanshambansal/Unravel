import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
await mkdir('.cache',{recursive:true});
const results=[];
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const page=await browser.newPage({viewport});
 await page.addInitScript(()=>{window.perf={rects:0,long:[],frames:[]};const original=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){window.perf.rects++;return original.call(this)};new PerformanceObserver(list=>window.perf.long.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});});
 await page.goto('http://localhost:3000');await page.waitForTimeout(6000);
 const result=await page.evaluate(async()=>{const p=window.perf;p.rects=0;p.long=[];let last=performance.now();await new Promise(resolve=>{const start=last;function tick(now){p.frames.push(now-last);last=now;if(now-start<4000)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});const sorted=p.frames.sort((a,b)=>a-b);return {rectReads:p.rects,frames:sorted.length,p95:sorted[Math.floor(sorted.length*.95)],longTasks:p.long,scene:document.querySelector('[data-landing-root]')?.__unravelStudy?.(),resources:performance.getEntriesByType('resource').filter(e=>/glb|ktx|png|webp/.test(e.name)).map(e=>({path:new URL(e.name).pathname,bytes:e.transferSize,duration:e.duration}))}});
 results.push({viewport,...result});await page.close();
}
await browser.close();await writeFile('.cache/performance-'+(process.argv[2]||'baseline').replace(/[^a-z0-9-]/gi,'')+'.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({scene,resources,...r})=>({...r,scene:scene?.scene,resources})),null,2));
