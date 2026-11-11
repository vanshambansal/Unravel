import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';
import { fixtureConfiguration } from './configuration.mjs';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/recording.js', ['recording.js', 'text/javascript; charset=utf-8']],
  ['/unravel.js', ['../../packages/sdk/dist/unravel.global.js', 'text/javascript; charset=utf-8']],
  ['/react-smoke.js', ['../../.cache/sdk-react-smoke.js', 'text/javascript; charset=utf-8']],
]);

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

export function createTestServer(configuration = fixtureConfiguration()) {
  return createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (request.method === 'GET' && pathname === '/unravel-config.js') {
        response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        response.end(`window.__UNRAVEL_FIXTURE_CONFIG__ = Object.freeze(${JSON.stringify(configuration)});`);
        return;
      }
      if (request.method === 'GET' && pathname === '/react-smoke') {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Plain React SDK smoke</title></head><body><div id="root"></div><script src="/react-smoke.js"></script></body></html>');
        return;
      }
      if (request.method === 'POST' && pathname === '/api/questions') {
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > 16_384) {
            json(response, 413, { error: 'Request too large.' });
            return;
          }
          chunks.push(chunk);
        }
        let body;
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
        catch { json(response, 400, { error: 'Invalid JSON.' }); return; }
        if (!body || typeof body.question !== 'string' || !body.question.trim() || body.question.length > 2000 || !['general', 'account', 'technical'].includes(body.category)) {
          json(response, 400, { error: 'A question and valid category are required.' });
          return;
        }
        // Intentional fixture defect. No data is saved or logged.
        json(response, 500, { error: 'Question submission is intentionally unavailable.' });
        return;
      }
      const asset = assets.get(pathname);
      if ((request.method !== 'GET' && request.method !== 'HEAD') || !asset) {
        json(response, 404, { error: 'Not found.' });
        return;
      }
      const content = await readFile(new URL(asset[0], import.meta.url));
      response.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch {
      if (!response.headersSent) json(response, 500, { error: 'Fixture server error.' });
      else response.end();
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Automated fixture processes are hermetic and explicitly opt into URL overrides.
  if (process.env.FIXTURE_ALLOW_TEST_CONFIG !== '1') {
    try { loadEnvFile(fileURLToPath(new URL('./.env.local', import.meta.url))); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const configuration = fixtureConfiguration();
  if (configuration.error && !configuration.testOverrides) console.warn(`Unravel developer setup: ${configuration.error}`);
  const server = createTestServer(configuration);
  server.on('error', (error) => {
    console.error(error.code === 'EADDRINUSE' ? 'Port 4173 is in use. Stop the other process before starting this fixture.' : 'The local test server could not start.');
    process.exitCode = 1;
  });
  const port = Number(process.env.FIXTURE_PORT ?? 4173);
  server.listen(port, '127.0.0.1', () => console.log(`Unravel test website: http://127.0.0.1:${port}`));
}
