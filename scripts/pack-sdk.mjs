import { mkdir, readFile, copyFile, cp, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { log } from 'node:console';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const destination = resolve('.cache/sdk-distribution');
await mkdir(destination, { recursive: true });
const manager = process.env.npm_execpath;
if (!manager) throw new Error('Run this script through pnpm sdk:pack.');
for (const name of ['sdk']) {
  const source = resolve('packages', name);
  const pkg = JSON.parse(await readFile(resolve(source, 'package.json'), 'utf8'));
  const stage = resolve('.cache/sdk-package-stage');
  await mkdir(stage, { recursive: true });
  await cp(resolve(source, 'dist'), resolve(stage, 'dist'), { recursive: true });
  for (const file of ['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.txt']) {
    await copyFile(resolve(source, file), resolve(stage, file));
  }
  // Keep registry installation instructions aligned with this archive's version.
  const readme = await readFile(resolve(source, 'README.md'), 'utf8');
  const releaseReadme = readme.replace(
    /\*\*Release status:\*\*[\s\S]*?(?=Register your website)/,
    `## Installation\n\n\`\`\`sh\nnpm install ${pkg.name}@${pkg.version}\n\`\`\`\n\n`,
  );
  if (releaseReadme === readme)
    throw Error('Review SDK README installation structure before packing.');
  await writeFile(resolve(stage, 'README.md'), releaseReadme);
  // Keep the workspace protected. Only the reviewed distribution manifest is
  // publishable, with no private workspace devDependencies or lifecycle scripts.
  const fields = [
    'name',
    'version',
    'description',
    'license',
    'repository',
    'homepage',
    'bugs',
    'keywords',
    'publishConfig',
    'type',
    'exports',
    'files',
    'dependencies',
  ];
  const distribution = Object.fromEntries(fields.map((field) => [field, pkg[field]]));
  await writeFile(
    resolve(stage, 'package.json'),
    JSON.stringify({ ...distribution, private: false }, null, 2) + '\n',
  );
  const result = spawnSync(process.execPath, [manager, 'pack', '--pack-destination', destination], {
    cwd: stage,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  // A replaced local file at the same version/path can reuse stale pnpm contents.
  // Print an immutable artifact identity for independent consumer installations.
  const archiveName = pkg.name.replace(/^@/, '').replace('/', '-');
  const archive = resolve(destination, `${archiveName}-${pkg.version}.tgz`);
  const digest = createHash('sha256')
    .update(await readFile(archive))
    .digest('hex')
    .slice(0, 12);
  const immutable = resolve(destination, `${archiveName}-${pkg.version}-${digest}.tgz`);
  await copyFile(archive, immutable);
  log(`Install this build in each external app: pnpm add ${immutable}`);
}
