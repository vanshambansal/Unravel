import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const port = Number(process.env.REPLAY_PORT ?? 4192);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Use an unprivileged local REPLAY_PORT.');
const origin = `http://127.0.0.1:${port}`;
const parents = (process.env.REPLAY_PARENT_ORIGINS ?? 'http://localhost:3000').split(',').map(value => value.trim());
for (const parent of parents) {
  const url = new URL(parent);
  if (url.origin !== parent || url.protocol !== 'http:' || url.hostname !== 'localhost' || parent === origin) throw new Error('Replay parents must be explicit localhost HTTP origins, separate from the 127.0.0.1 player host.');
}
const root = new URL('../.cache/replay-host/', import.meta.url);
// Only trusted build files are served: no credentials, arbitrary files or report-data endpoint.
const [script, css] = await Promise.all([readFile(new URL('player.js', root)), readFile(new URL('player.css', root))]);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="unravel-parent-origins" content="${parents.join(' ')}"><title>Unravel isolated replay</title><link rel="stylesheet" href="/player.css"><style>html,body{margin:0;background:#f4f4f4;color:#181818;overflow:hidden}#replay{margin:0 auto}.replayer-wrapper{position:relative}</style></head><body><div id="replay"></div><script src="/player.js"></script></body></html>`;
const policy = `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'none'; font-src 'none'; media-src 'none'; connect-src 'none'; frame-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors ${parents.join(' ')}`;
const server = createServer((request, response) => {
  if (request.headers.host !== `127.0.0.1:${port}`) { response.writeHead(403); response.end(); return; }
  const path = new URL(request.url, origin).pathname;
  const asset = path === '/' ? [html, 'text/html; charset=utf-8'] : path === '/player.js' ? [script, 'text/javascript; charset=utf-8'] : path === '/player.css' ? [css, 'text/css; charset=utf-8'] : path === '/health' ? ['{"ready":true}', 'application/json'] : null;
  const accepted = asset && ['GET','HEAD'].includes(request.method);
  response.writeHead(accepted ? 200 : 404, { 'Content-Type': asset?.[1] ?? 'text/plain', 'Cache-Control': 'no-store', 'Content-Security-Policy': policy,
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  response.end(request.method === 'HEAD' ? undefined : accepted ? asset[0] : 'Not found');
});
server.on('error', () => { console.error('Isolated replay host could not start. Check the local port.'); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Isolated replay host: ${origin}; allowed parents: ${parents.join(', ')}`));
for (const signal of ['SIGINT','SIGTERM']) process.once(signal, () => server.close(() => process.exit(0)));
