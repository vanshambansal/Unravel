import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const config=resolve(root,'.cache/standard-react-config.json');
createServer(async(req,res)=>{const path=new URL(req.url,'http://localhost').pathname;try{if(path==='/integration.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(await readFile(config));return;}if(path==='/api/question'&&req.method==='POST'){const settings=JSON.parse(await readFile(config));res.writeHead(settings.fixed?200:500,{'Content-Type':'application/json'});res.end(JSON.stringify({accepted:settings.fixed===true}));return;}if(path==='/app.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(await readFile(resolve(root,'.cache/standard-react.js')));return;}res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end('<!doctype html><html lang="en"><head><title>Standard React website</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>');}catch{res.writeHead(503);res.end('Integration config unavailable');}}).listen(4194,'127.0.0.1',()=>console.log('Standard React website: http://127.0.0.1:4194'));
