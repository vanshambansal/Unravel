import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createTestServer } from '../fixtures/test-site/server.mjs';

const root = resolve('.cache/regression-proof');
const file = resolve(root, 'generated.spec.ts');
const original = await readFile(file); // Export once through the real application test first.
const hash = data => createHash('sha256').update(data).digest('hex');
const source = await readFile('fixtures/test-site/server.mjs', 'utf8');
const buggyLine = "json(response, 500, { error: 'Question submission is intentionally unavailable.' });";
if (source.split(buggyLine).length !== 2) throw new Error('Expected one isolated fixture defect; review the proof patch.');
const fixedSource = source.replace(buggyLine, "json(response, 200, { accepted: true });").replace('new URL(asset[0], import.meta.url)', `new URL(asset[0], ${JSON.stringify(pathToFileURL(resolve('fixtures/test-site/server.mjs')).href)})`);
await mkdir(root, { recursive: true });
// The source-patched server retains its original relative configuration import.
await writeFile(resolve(root, 'configuration.mjs'), await readFile('fixtures/test-site/configuration.mjs'));
await writeFile(resolve(root, 'server-fixed.mjs'), fixedSource);
await writeFile(resolve(root, 'fix.patch'), `- ${buggyLine}\n+ json(response, 200, { accepted: true });\n`);
await writeFile(resolve(root, 'playwright.config.ts'), `import { defineConfig } from '@playwright/test';\nexport default defineConfig({ testDir: '.', testMatch: 'generated.spec.ts', retries: 0, workers: 1, timeout: 10000, repeatEach: 5, expect: { timeout: 1500 }, reporter: [['json', { outputFile: process.env.PROOF_REPORT }]], outputDir: process.env.PROOF_ARTIFACTS, use: { baseURL: 'http://127.0.0.1:4189', screenshot: 'on', trace: 'on' } });\n`);
const playwright = resolve('node_modules/@playwright/test/cli.js');
async function run(label, server) {
  await new Promise((accept, reject) => { server.once('error', reject); server.listen(4189, '127.0.0.1', accept); });
  let code;
  try {
    code = await new Promise((accept, reject) => { const child = spawn(process.execPath, [playwright, 'test', '--config', resolve(root, 'playwright.config.ts')], { env: { ...process.env, PROOF_REPORT: resolve(root, `${label}.json`), PROOF_ARTIFACTS: resolve(root, label) }, stdio: 'ignore' }); child.once('error', reject); child.once('exit', accept); });
  } finally { await new Promise(accept => server.close(accept)); }
  const report = JSON.parse(await readFile(resolve(root, `${label}.json`), 'utf8'));
  const results = [];
  function visit(suite) { for (const spec of suite.specs ?? []) for (const test of spec.tests) results.push(...test.results); for (const s of suite.suites ?? []) visit(s); }
  for (const suite of report.suites) visit(suite);
  if (results.length !== 5 || results.some(r => r.retry !== 0)) throw new Error('Proof must contain five fresh runs without retries.');
  if (label === 'buggy' && (code === 0 || results.some(r => r.status !== 'failed' || !r.errors?.some(e => /toHaveText/.test(e.message) && /submitted successfully/.test(e.message))))) throw new Error('Buggy version did not fail consistently on the expected text assertion.');
  if (label === 'fixed' && (code !== 0 || results.some(r => r.status !== 'passed'))) throw new Error('Fixed version did not pass all five runs.');
  if (hash(await readFile(file)) !== hash(original)) throw new Error('Exported file changed during the proof.');
  return { exitCode: code, runs: results.length, outcome: label === 'buggy' ? 'expected assertion failures' : 'passed' };
}
const buggy = await run('buggy', createTestServer());
const fixed = await run('fixed', (await import(pathToFileURL(resolve(root, 'server-fixed.mjs')).href)).createTestServer());
const proof = { exportedSha256: hash(original), identicalExport: true, retries: 0, buggy, fixed, fixturePatch: 'Only the question endpoint changes HTTP 500 to HTTP 200; tracked buggy fixture remains unchanged.', createdAt: new Date().toISOString() };
await writeFile(resolve(root, 'proof.json'), JSON.stringify(proof, null, 2) + '\n');
console.log(JSON.stringify(proof, null, 2));
