import { mkdir, copyFile, writeFile } from 'node:fs/promises';

// Only public parent origins enter this static output. No application credentials are needed.
const parents = (process.env.REPLAY_PARENT_ORIGINS ?? '').split(',').map((value) => value.trim());
if (
  !parents.length ||
  parents.some((value) => {
    try {
      const url = new URL(value);
      return url.origin !== value || url.protocol !== 'https:';
    } catch {
      return true;
    }
  })
)
  throw Error('REPLAY_PARENT_ORIGINS must list explicit canonical HTTPS dashboard origins.');

const output = new URL('./.vercel/output/', import.meta.url);
await mkdir(new URL('static/', output), { recursive: true });
for (const name of ['player.js', 'player.css']) {
  await copyFile(
    new URL(`../../.cache/replay-host/${name}`, import.meta.url),
    new URL(`static/${name}`, output),
  );
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="unravel-parent-origins" content="${parents.join(' ')}"><title>Unravel isolated replay</title><link rel="stylesheet" href="/player.css"><style>html,body{margin:0;background:#f4f4f4;color:#181818;overflow:hidden}#replay{margin:0 auto}.replayer-wrapper{position:relative}</style></head><body><div id="replay"></div><script src="/player.js"></script></body></html>`;
await writeFile(new URL('static/index.html', output), html);
await writeFile(new URL('static/health', output), '{"ready":true}');
const headers = {
  'Content-Security-Policy': `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'none'; font-src 'none'; media-src 'none'; connect-src 'none'; frame-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors ${parents.join(' ')}`,
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
// Vercel Build Output API preserves headers on the fixed static player routes.
await writeFile(
  new URL('config.json', output),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '/(.*)', headers, continue: true },
        { src: '/', dest: '/index.html' },
        { src: '/health', headers: { 'Content-Type': 'application/json' }, continue: true },
        { handle: 'filesystem' },
        { src: '/(.*)', status: 404 },
      ],
    },
    null,
    2,
  ),
);
console.log('Built isolated static replay deployment.');
