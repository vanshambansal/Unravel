import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const pkg = JSON.parse(await readFile('packages/sdk/package.json', 'utf8'));
const archiveName = pkg.name.replace(/^@/, '').replace('/', '-');
const archive = resolve(`.cache/sdk-distribution/${archiveName}-${pkg.version}.tgz`);
function tar(...args) {
  const result = spawnSync('tar', [...args, archive], {
    encoding: 'utf8',
    maxBuffer: 10_000_000,
    windowsHide: true,
  });
  if (result.error || result.status !== 0)
    throw Error('Cannot inspect SDK archive. Run pnpm sdk:pack and ensure tar is available.');
  return result.stdout;
}
const files = tar('-tzf').trim().split(/\r?\n/);
for (const required of [
  'package.json',
  'README.md',
  'LICENSE',
  'THIRD_PARTY_NOTICES.txt',
  'dist/index.js',
  'dist/index.d.ts',
  'dist/contracts.d.ts',
]) {
  if (!files.includes(`package/${required}`)) throw Error(`SDK archive missing ${required}`);
}
if (files.some((path) => /(?:\.env|build-meta|node_modules|\.map$|\.tsbuildinfo)/.test(path)))
  throw Error('SDK archive contains private or development artifacts.');
// tar's file operand must follow the archive; keep shell interpolation out of it.
function content(path) {
  const result = spawnSync('tar', ['-xOf', archive, path], {
    encoding: 'utf8',
    maxBuffer: 10_000_000,
    windowsHide: true,
  });
  if (result.status !== 0 || result.error) throw Error(`Cannot inspect ${path}`);
  return result.stdout;
}
const manifest = JSON.parse(content('package/package.json'));
if (
  manifest.name !== pkg.name ||
  manifest.private !== false ||
  manifest.scripts ||
  manifest.devDependencies
) {
  throw Error(
    'SDK distribution must match its approved name and omit workspace scripts/devDependencies.',
  );
}
if (
  manifest.license !== 'MIT' ||
  Object.values(manifest.dependencies ?? {}).some((value) => /workspace:|file:|link:/.test(value))
)
  throw Error('SDK runtime metadata is not portable.');
for (const path of files.filter((path) => path.endsWith('.d.ts'))) {
  if (content(path).includes('@unravel/contracts'))
    throw Error('SDK declarations depend on a private workspace package.');
}
const entry = content('package/dist/index.js');
for (const [, chunk] of entry.matchAll(/import\(["'](\.\/[^"']+)["']\)/g)) {
  if (!files.includes(`package/dist/${chunk.slice(2)}`))
    throw Error(`SDK dynamic chunk missing: ${chunk}`);
}
const result = {
  checkedAt: new Date().toISOString(),
  package: manifest.name,
  version: manifest.version,
  sha256: createHash('sha256')
    .update(await readFile(archive))
    .digest('hex'),
  files,
  private: manifest.private === true,
  archiveChecksPassed: true,
  note: 'Archive checks only. Registry ownership, publication and public hosted acceptance remain separate gates.',
};
await mkdir('.cache/sdk-distribution', { recursive: true });
await writeFile(
  '.cache/sdk-distribution/release-review.json',
  JSON.stringify(result, null, 2) + '\n',
);
console.log(JSON.stringify(result, null, 2));
