import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const pkg = JSON.parse(await readFile('packages/sdk/package.json', 'utf8'));
const expected = process.argv.find((value) => value.startsWith('--sha256='))?.slice(9);
if (!/^[a-f0-9]{64}$/.test(expected ?? '')) throw Error('Supply the approved --sha256 digest.');
const metadataUrl = `https://registry.npmjs.org/${pkg.name.replace('/', '%2f')}/${pkg.version}`;
const attempts = process.argv.includes('--wait') ? 12 : 1;
let response;
for (let attempt = 0; attempt < attempts; attempt++) {
  response = await fetch(metadataUrl, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
  if (response.status !== 404 || attempt === attempts - 1) break;
  console.log('Registry indexing is not ready yet; checking again in 10 seconds.');
  await delay(10000);
}
if (!response.ok)
  throw Error(
    `Registry metadata returned HTTP ${response.status}. Publication may still be processing.`,
  );
const metadata = await response.json();
if (metadata.name !== pkg.name || metadata.version !== pkg.version || metadata.license !== 'MIT')
  throw Error('Registry release metadata does not match the approved package.');
const tarball = new URL(metadata.dist.tarball);
if (tarball.protocol !== 'https:' || tarball.hostname !== 'registry.npmjs.org')
  throw Error('Unexpected registry tarball origin.');
const downloaded = await fetch(tarball, { signal: AbortSignal.timeout(20000) });
if (!downloaded.ok) throw Error(`Registry archive returned HTTP ${downloaded.status}.`);
const bytes = Buffer.from(await downloaded.arrayBuffer());
const sha256 = createHash('sha256').update(bytes).digest('hex');
if (sha256 !== expected) throw Error('Registry archive differs from the approved artifact.');
await mkdir('.cache/sdk-distribution/registry', { recursive: true });
await writeFile('.cache/sdk-distribution/registry/published.tgz', bytes);
const result = {
  checkedAt: new Date().toISOString(),
  name: metadata.name,
  version: metadata.version,
  license: metadata.license,
  tarball: tarball.href,
  sha256,
  bytes: bytes.length,
  approvedArchiveMatches: true,
};
await writeFile(
  '.cache/sdk-distribution/registry-release.json',
  JSON.stringify(result, null, 2) + '\n',
);
console.log(JSON.stringify(result, null, 2));
