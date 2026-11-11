import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const destination=resolve('.cache/sdk-distribution');
await mkdir(destination,{recursive:true});
const manager=process.env.npm_execpath;
if(!manager)throw new Error('Run this script through pnpm sdk:pack.');
for(const name of ['sdk']){
  const result=spawnSync(process.execPath,[manager,'pack','--pack-destination',destination],{cwd:resolve('packages',name),stdio:'inherit'});
  if(result.status!==0)process.exit(result.status??1);
}
