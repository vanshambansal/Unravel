import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { context } from 'esbuild';
import { bundleOptions } from './configuration.mjs';
const options = bundleOptions();
const port = Number(process.env.PORT ?? 4201);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('PORT must be an unprivileged local port.');
const bundle = await context(options);
await bundle.watch();
await bundle.rebuild();
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost:4201').pathname;
  if (path === '/api/question' && req.method === 'POST') {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Intentional SDK demonstration failure' }));
    return;
  }
  if (path === '/main.js' || path === '/main.css') {
    res.setHeader('Content-Type', path.endsWith('.css') ? 'text/css' : 'text/javascript');
    res.end(await readFile('dist' + path));
    return;
  }
  if (path === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.end(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>React SDK manual test</title><link rel="stylesheet" href="/main.css"></head><body><div id="root"></div><script type="module" src="/main.js"></script></body></html>',
    );
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});
server.listen(port, 'localhost', () =>
  console.log(`React SDK manual test: http://localhost:${port}`),
);
async function stop() {
  server.close();
  await bundle.dispose();
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
