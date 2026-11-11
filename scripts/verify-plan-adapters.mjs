// Execute actual adapter output in Chromium against a deterministic synthetic site.
// No application credentials, remote services or code execution server are involved.
import { exportPlaywright } from '../packages/test-plan/dist/index.js';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
const root = resolve('.cache/plan-adapters'); await mkdir(root,{recursive:true});
const locator={kind:'css',value:'#feedback',name:''};
const cases=[];
for(const kind of ['text','visible','url','response','no-page-errors']) for(const succeeds of [true,false]) {
  const id=`${kind}/${succeeds?'pass':'expected-failure'}`;
  const assertion = kind==='text'?{id:'check',kind,locator,text:succeeds?'Saved':'Wrong text'}:kind==='visible'?{id:'check',kind,locator:{...locator,value:succeeds?'#details':'#missing'}}:kind==='url'?{id:'check',kind,path:succeeds?'/account':'/wrong'}:kind==='response'?{id:'check',kind,path:'/api/save',method:'POST',status:201}:{id:'check',kind};
  cases.push({id,succeeds,kind,plan:{version:2,initialPath:'/',steps:[{id:'go',action:'click',locator:{kind:'testId',value:'go',name:''},value:null,note:'',included:true,sourceAt:null}],assertions:kind==='no-page-errors'?[{id:'completion',kind:'visible',locator:{kind:'css',value:'#details',name:''}},assertion]:[assertion],expectedBehaviorConfirmed:true}});
}
cases.push({id:'reproduction/no-assertions',kind:'reproduction',succeeds:true,plan:{...cases[0].plan,assertions:[],expectedBehaviorConfirmed:false}});
let generated="import {test,expect} from '@playwright/test';\n";
for(const item of cases) {
  const behavior=item.kind==='url'?"location.href='/account'":item.kind==='response'?"fetch('/api/save',{method:'POST'})":item.kind==='no-page-errors'&&!item.succeeds?"document.getElementById('details').hidden=false;throw new Error('Synthetic page crash')":"document.getElementById('feedback').textContent='Saved';document.getElementById('details').hidden=false";
  const html=`<!doctype html><button data-testid="go">Continue</button><output id="feedback">Waiting</output><section id="details" hidden>Details</section><script>document.querySelector('button').addEventListener('click',()=>{${behavior}})</script>`;
  let code=exportPlaywright(item.plan,item.kind==='reproduction'?'reproduction':'regression').replace(/import \{ test(?:, expect)? \} from '@playwright\/test';/,'');
  code=code.replace(/test\('reported (regression|reproduction)', async \(\{ page(?:, baseURL)? \}\) => \{/,
    `test(${JSON.stringify(item.id)}, async ({page,baseURL})=>{\n${!item.succeeds?"test.fail(true,'Expected assertion failure in synthetic negative case');":''}\nawait page.route('http://unravel-adapter.test/**',route=>new URL(route.request().url()).pathname==='/api/save'?route.fulfill({status:${item.succeeds?201:500},contentType:'application/json',body:'{}'}):route.fulfill({contentType:'text/html',body:${JSON.stringify(html)}}));`);
  generated+=code+'\n';
}
await writeFile(resolve(root,'generated.spec.ts'),generated);
await writeFile(resolve(root,'playwright.config.ts'),`import {defineConfig} from '@playwright/test';export default defineConfig({testDir:'.',testMatch:'generated.spec.ts',workers:1,retries:0,timeout:10000,expect:{timeout:1000},reporter:[['json',{outputFile:'${resolve(root,'results.json').replaceAll('\\','/')}'}]],outputDir:'${resolve(root,'artifacts').replaceAll('\\','/')}',use:{baseURL:'http://unravel-adapter.test',actionTimeout:2500,screenshot:'only-on-failure',trace:'retain-on-failure'}});`);
const exit=await new Promise((accept,reject)=>{const child=spawn(process.execPath,[resolve('node_modules/@playwright/test/cli.js'),'test','--config',resolve(root,'playwright.config.ts')],{stdio:'ignore',env:process.env});child.once('error',reject);child.once('exit',accept);});
const report=JSON.parse(await readFile(resolve(root,'results.json'),'utf8')); const results=[];
function collect(suite){for(const spec of suite.specs??[])for(const test of spec.tests)results.push({title:spec.title,...test.results[0]});for(const child of suite.suites??[])collect(child);}
for(const suite of report.suites)collect(suite);
if(exit!==0||results.length!==cases.length)throw new Error('Adapter verification failed. Inspect .cache/plan-adapters/results.json.');
for(const item of cases){const result=results.find(r=>r.title===item.id);if(!result||result.status!==(item.succeeds?'passed':'failed'))throw new Error(`Unexpected outcome: ${item.id}`);if(!item.succeeds){const matcher=item.kind==='text'?'toHaveText':item.kind==='visible'?'toBeVisible':item.kind==='url'?'toHaveURL':item.kind==='response'?'response status':'Uncaught errors during reproduced actions';if(!result.errors.some(error=>error.message?.includes(matcher)))throw new Error(`Negative case did not fail at its intended assertion: ${item.id}`);}}
console.log(JSON.stringify({cases:results.length,positivePasses:cases.filter(c=>c.succeeds).length,expectedAssertionFailures:cases.filter(c=>!c.succeeds).length,retries:0,artifacts:'.cache/plan-adapters',note:'Controlled Chromium adapter checks, not arbitrary-site compatibility.'},null,2));
