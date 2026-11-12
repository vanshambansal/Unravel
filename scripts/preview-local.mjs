import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { clerkKeysHaveValidFormat } from '../apps/web/src/features/authentication/configuration.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const app = fileURLToPath(new URL('../apps/web/', import.meta.url));
const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
require('@next/env').loadEnvConfig(app, true, { info() {}, error() {} });
const output = process.env.UNRAVEL_NEXT_OUTPUT ?? '.next-responsive';
const port = Number(process.env.PREVIEW_PORT ?? 3020), replayPort = Number(process.env.PREVIEW_REPLAY_PORT ?? 4191);
if (!/^\.next-[a-z0-9-]+$/.test(output) || [port, replayPort].some(p => !Number.isInteger(p) || p < 1024 || p > 65535) || port === replayPort) throw Error('Use an isolated .next-* output and distinct unprivileged preview ports.');
const origin = `http://localhost:${port}`, replayOrigin = `http://127.0.0.1:${replayPort}`;

try {
  if (!clerkKeysHaveValidFormat(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, process.env.CLERK_SECRET_KEY)) throw Error('Configure the existing Clerk development keys locally first.');
  if (!process.env.CLERK_SECRET_KEY.startsWith('sk_test_')) throw Error('This loopback preview requires development Clerk keys. Keep production keys on their configured HTTPS domain.');
  try { await fetch('https://api.clerk.com', { signal: AbortSignal.timeout(5000) }); }
  catch { throw Error('Cannot reach Clerk over HTTPS. Run this preview in a terminal with normal network access; do not disable Clerk security. No servers started.'); }
  const { Pool } = require('pg'), pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 5000 });
  try { if (!process.env.DATABASE_URL) throw Error(); await pool.query('select 1'); }
  catch { throw Error('The existing database is unreachable. Check local configuration and network access. No servers started.'); }
  finally { await pool.end(); }
  console.log('Existing Clerk HTTPS and database connectivity passed. This does not verify login delivery.');
  if (process.argv.includes('--check')) process.exit(0);
  await access(new URL(`../apps/web/${output}/BUILD_ID`, import.meta.url));
  await access(new URL('../.cache/replay-host/player.js', import.meta.url));
} catch (error) {
  console.error(error.code === 'ENOENT' ? 'Build the isolated web output and trusted replay host before starting the preview.' : error.message);
  process.exit(1);
}

const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
function start(args, cwd, env, inherit = true) {
  const runtime = inherit ? process.env : Object.fromEntries(Object.entries(process.env).filter(([name]) => ['SYSTEMROOT', 'WINDIR', 'PATH', 'TEMP', 'TMP', 'COMSPEC'].includes(name.toUpperCase())));
  const child = spawn(process.execPath, args, { cwd, env: { ...runtime, ...env }, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.once('error', () => stop(1));
  child.once('exit', code => { if (!stopping) stop(code || 1); });
}
process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
process.once('exit', () => { for (const child of children) child.kill(); });
start([fileURLToPath(new URL('./replay-host.mjs', import.meta.url))], root, { REPLAY_PORT: String(replayPort), REPLAY_PUBLIC_ORIGIN: replayOrigin, REPLAY_PARENT_ORIGINS: origin }, false);
start([require.resolve('next/dist/bin/next'), 'start', '--hostname', 'localhost', '--port', String(port)], app, { NODE_ENV: 'production', UNRAVEL_NEXT_OUTPUT: output, APP_ORIGIN: origin, REPLAY_ORIGIN: replayOrigin, ALLOW_LOOPBACK_INGESTION: 'true', PUBLIC_INGESTION_ENABLED: 'false' });
console.log(`Local production preview: ${origin}; isolated replay: ${replayOrigin}. No public release gates are enabled.`);
