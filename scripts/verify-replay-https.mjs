import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {chromium,firefox} from '@playwright/test';
const origin='https://127.0.0.1:4193',parent='http://localhost:4196';
const server=createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><html><head><title>HTTPS replay verification parent</title></head><body></body></html>');});
await new Promise((accept,reject)=>{server.once('error',reject);server.listen(4196,'127.0.0.1',accept);});
const child=spawn(process.execPath,[resolve('scripts/replay-host.mjs')],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,REPLAY_PORT:'4193',REPLAY_PUBLIC_ORIGIN:origin,REPLAY_PARENT_ORIGINS:parent,REPLAY_TLS_CERT_FILE:resolve('.cache/replay-tls/cert.pem'),REPLAY_TLS_KEY_FILE:resolve('.cache/replay-tls/key.pem')}});
const results=[];
try{
 await new Promise((accept,reject)=>{const timer=setTimeout(()=>reject(Error('TLS replay startup timed out')),10000);child.stdout.once('data',()=>{clearTimeout(timer);accept();});child.once('error',reject);child.once('exit',code=>{if(code)reject(Error('TLS replay startup failed'));});});
 for(const [name,type] of [['chromium',chromium],['firefox',firefox]]){
  const browser=await type.launch(),context=await browser.newContext({ignoreHTTPSErrors:true});
  try{const page=await context.newPage();let external=0;await page.route('https://unravel-network-sentinel.invalid/**',route=>{external++;return route.abort();});await page.goto(parent);
   await page.evaluate(({origin})=>{const frame=document.createElement('iframe');frame.title='TLS replay';frame.src=origin;frame.setAttribute('sandbox','allow-scripts allow-same-origin');document.body.append(frame);const base=Date.now(),node={type:0,id:1,childNodes:[{type:2,id:2,tagName:'html',attributes:{},childNodes:[{type:2,id:3,tagName:'head',attributes:{},childNodes:[]},{type:2,id:4,tagName:'body',attributes:{},childNodes:[{type:2,id:5,tagName:'h1',attributes:{},childNodes:[{type:3,id:6,textContent:'HTTPS replay verified'}]},{type:2,id:7,tagName:'img',attributes:{src:'https://unravel-network-sentinel.invalid/pixel'},childNodes:[]}]}]}]};window.addEventListener('message',event=>{if(event.origin!==origin||event.source!==frame.contentWindow)return;if(event.data.type==='ready')frame.contentWindow.postMessage({type:'initialize',channel:'tls-proof',durationMs:1000,events:[{type:4,timestamp:base,data:{href:'http://example.test/',width:800,height:600}},{type:2,timestamp:base,data:{node,initialOffset:{top:0,left:0}}}]},origin);if(event.data.type==='initialized')Reflect.set(window,'tlsReady',true);});},{origin});
   const inner=page.frameLocator('iframe[title="TLS replay"]').frameLocator('iframe');await inner.getByRole('heading',{name:'HTTPS replay verified'}).waitFor();
   const sandbox=await page.frameLocator('iframe[title="TLS replay"]').locator('iframe').getAttribute('sandbox');if(sandbox!=='allow-same-origin')throw Error('Recorded-document sandbox changed');
   const isolated=await page.evaluate(()=>{try{void document.querySelector('iframe').contentWindow.document.body;return false;}catch{return true;}});if(!isolated||external)throw Error('Replay isolation/resource policy failed');
   if((await context.request.get(origin+'/.env')).status()!==404||(await context.request.get(origin+'/health',{headers:{Host:'wrong.invalid'}})).status()!==403)throw Error('Static host resource/host guard failed');
   results.push({browser:name,httpsLoaded:true,dashboardIsolated:true,recordedScriptsDisabled:true,externalRequests:external,staticHostGuards:true});
  }finally{await context.close();await browser.close();}
 }
 const proof={verifiedAt:new Date().toISOString(),results,limitations:'Local self-signed certificate explicitly ignored by test clients; no public certificate, reverse proxy or hosted-origin verification.'};await writeFile('.cache/replay-tls/results.json',JSON.stringify(proof,null,2));console.log(JSON.stringify(proof,null,2));
}finally{child.kill();server.closeAllConnections();await new Promise(accept=>server.close(accept));}
