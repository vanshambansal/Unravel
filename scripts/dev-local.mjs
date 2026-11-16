import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
import { log, error } from 'node:console';
import { setTimeout as delay } from 'node:timers/promises';
const {fetch,AbortSignal}=globalThis;

const root=fileURLToPath(new URL('../',import.meta.url));
const app=fileURLToPath(new URL('../apps/web/',import.meta.url));
const require=createRequire(new URL('../apps/web/package.json',import.meta.url));
const port=Number(process.env.DEV_PORT??3000), playerPort=Number(process.env.DEV_REPLAY_PORT??4192);
if([port,playerPort].some(n=>!Number.isInteger(n)||n<1024||n>65535)||port===playerPort)throw Error('Use distinct unprivileged DEV_PORT and DEV_REPLAY_PORT values.');
const playerOrigin=`http://127.0.0.1:${playerPort}`, appOrigin=`http://localhost:${port}`;
const owned=[];let stopping=false;
function stop(code=0){
  if(stopping)return;stopping=true;process.exitCode=code;
  for(const child of owned)child.kill();
}
function launch(args,cwd,env){
  const child=spawn(process.execPath,args,{cwd,env,stdio:'inherit',windowsHide:true});owned.push(child);
  child.once('error',()=>{error('Local development service could not start.');stop(1);});
  child.once('exit',code=>{if(!stopping)stop(code||1);});return child;
}
process.once('SIGINT',()=>stop());process.once('SIGTERM',()=>stop());
process.once('exit',()=>{for(const child of owned)child.kill();});
async function playerReady(){
  try{
    const response=await fetch(playerOrigin+'/health',{signal:AbortSignal.timeout(1000)});
    if(!response.ok||(await response.json()).ready!==true)return false;
    const page=await fetch(playerOrigin+'/',{signal:AbortSignal.timeout(1000)});
    const html=await page.text();
    if(!page.ok||!html.includes(`name="unravel-parent-origins" content="${appOrigin}"`))throw Error(`Port${playerPort} has a player with a different parent configuration. Stop that process explicitly before starting development.`);
    return true;
  }catch(cause){if(cause instanceof Error&&cause.message.startsWith(`Port${playerPort}`))throw cause;return false;}
}
try{
  const existing=await playerReady();
  if(!existing){
    if(process.argv.includes('--check'))throw Error('The isolated development player is unavailable at '+playerOrigin+'. Run pnpm dev or pnpm replay:dev.');
    // The player receives no application/provider credentials.
    const system=Object.fromEntries(Object.entries(process.env).filter(([name])=>['SYSTEMROOT','WINDIR','PATH','TEMP','TMP','COMSPEC'].includes(name.toUpperCase())));
    launch([fileURLToPath(new URL('./replay-host.mjs',import.meta.url))],root,{...system,REPLAY_PORT:String(playerPort),REPLAY_PUBLIC_ORIGIN:playerOrigin,REPLAY_PARENT_ORIGINS:appOrigin});
    for(let attempt=0;attempt<30&&!stopping;attempt++){if(await playerReady())break;await delay(100);}
    if(stopping||!await playerReady())throw Error('The isolated development player did not become ready.');
  }
  log(`Development replay ready: ${playerOrigin} (${existing?'existing process retained':'started with dashboard'}).`);
  if(!process.argv.includes('--check'))launch([require.resolve('next/dist/bin/next'),'dev','--hostname','localhost','--port',String(port)],app,{...process.env,REPLAY_ORIGIN:playerOrigin});
}catch(cause){error(cause instanceof Error?cause.message:'Local development startup failed.');stop(1);}
