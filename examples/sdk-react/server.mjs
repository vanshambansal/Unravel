import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {context} from 'esbuild';
const bundle=await context({entryPoints:['src/main.tsx'],bundle:true,outdir:'dist',jsx:'automatic',sourcemap:true});await bundle.watch();await bundle.rebuild();
const server=createServer(async(req,res)=>{const path=new URL(req.url,'http://localhost:4201').pathname;
 if(path==='/api/question'&&req.method==='POST'){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Intentional SDK demonstration failure'}));return;}
 if(path==='/main.js'||path==='/main.css'){res.setHeader('Content-Type',path.endsWith('.css')?'text/css':'text/javascript');res.end(await readFile('dist'+path));return;}
 if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>React SDK manual test</title><link rel="stylesheet" href="/main.css"></head><body><div id="root"></div><script type="module" src="/main.js"></script></body></html>');return;}
 res.writeHead(404);res.end('Not found');});
server.listen(4201,'localhost',()=>console.log('React SDK manual test: http://localhost:4201'));
async function stop(){server.close();await bundle.dispose();process.exit(0);}process.on('SIGINT',stop);process.on('SIGTERM',stop);
