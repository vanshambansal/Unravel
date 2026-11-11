// Run actual browser downloads. The standard-site Playwright suite owns both local servers.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const root=resolve('.cache/standard-proof'),hosts=['react','next'],scenarios=['navigation-button','form-click','form-enter'];
const hash=data=>createHash('sha256').update(data).digest('hex');
const cases=[];
for(const host of hosts)for(const scenario of scenarios){const name=`${host}-${scenario}`,metadata=JSON.parse(await readFile(resolve(root,`${name}.json`),'utf8'));cases.push({...metadata,name,sha256:hash(await readFile(resolve(root,`${name}-regression.spec.ts`)))});}
const configs=await Promise.all(hosts.map(async host=>({file:resolve(`.cache/standard-${host}-config.json`),value:JSON.parse(await readFile(`.cache/standard-${host}-config.json`,'utf8'))})));
const config=resolve(root,'playwright.config.ts');
await writeFile(config,`import {defineConfig} from '@playwright/test';export default defineConfig({testDir:'.',workers:1,retries:0,timeout:12000,expect:{timeout:1800},reporter:[['json',{outputFile:process.env.STANDARD_REPORT}]],outputDir:process.env.STANDARD_ARTIFACTS,use:{actionTimeout:5000,screenshot:'on',trace:'on'},projects:${JSON.stringify(hosts.map(host=>({name:host,testMatch:`${host}-*-${'MODE'}.spec.ts`,use:{baseURL:cases.find(item=>item.host===host).origin}})))}.map(project=>({...project,testMatch:project.testMatch.replace('MODE',process.env.STANDARD_MODE)}))});`);
async function run(label,mode,fixed){
 for(const item of configs)await writeFile(item.file,JSON.stringify({...item.value,fixed}));
 const code=await new Promise((accept,reject)=>{const child=spawn(process.execPath,[resolve('node_modules/@playwright/test/cli.js'),'test','--config',config],{stdio:'ignore',windowsHide:true,env:{...process.env,STANDARD_MODE:mode,STANDARD_REPORT:resolve(root,`${label}.json`),STANDARD_ARTIFACTS:resolve(root,label)}});child.once('error',reject);child.once('exit',accept);});
 const report=JSON.parse(await readFile(resolve(root,`${label}.json`),'utf8')),results=[];
 function visit(suite){for(const spec of suite.specs??[])for(const test of spec.tests)for(const result of test.results)results.push({title:spec.title,...result});for(const child of suite.suites??[])visit(child);}
 for(const suite of report.suites)visit(suite);
 if(results.length!==6||results.some(item=>item.retry!==0))throw Error(`${label}: expected six runs, no retries`);
 const expectedFailure=label==='buggy-regression';
 if(expectedFailure?(code===0||results.some(item=>item.status!=='failed'||!item.errors?.some(error=>/toHaveText/.test(error.message)))):(code!==0||results.some(item=>item.status!=='passed')))throw Error(`${label}: unexpected result; inspect ${root}`);
 for(const item of cases)if(hash(await readFile(resolve(root,`${item.name}-regression.spec.ts`)))!==item.sha256)throw Error('An exported file changed during execution');
 return {runs:results.length,retries:0,outcome:expectedFailure?'expected text-assertion failures':'passed',exitCode:code};
}
try{
 const reproduction=await run('buggy-reproduction','reproduction',false),buggy=await run('buggy-regression','regression',false),fixed=await run('fixed-regression','regression',true);
 const proof={createdAt:new Date().toISOString(),cases,identicalRegressionFiles:true,reproduction,buggy,fixed,limits:'Chromium; controlled React/Next websites. Inputs require safe replacements; expected outcomes supplied by the developer. No locator corrections.'};
 await writeFile(resolve(root,'proof.json'),JSON.stringify(proof,null,2));console.log(JSON.stringify(proof,null,2));
}finally{for(const item of configs)await writeFile(item.file,JSON.stringify(item.value));}
