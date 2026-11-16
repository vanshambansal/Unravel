import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { check, format, resolveConfig } from 'prettier';

const root = fileURLToPath(new URL('../', import.meta.url));
const writing = process.argv.includes('--write');
// Format maintained source, including application UI; retained prototypes and history stay untouched.
const directories = [
  'packages/contracts/src',
  'packages/sdk/src',
  'packages/test-plan/src',
  'apps/web/src',
  'examples/sdk-react/src',
  'examples/sdk-next/app',
  'examples/sdk-next/src',
  'examples/browser-demo/src',
  'tests/unit',
];
const files = [
  'package.json',
  '.prettierrc.json',
  '.github/workflows/ci.yml',
  'scripts/format.mjs',
  'scripts/release-check.mjs',
  'scripts/pack-sdk.mjs',
  'scripts/check-sdk-package.mjs',
  'scripts/verify-sdk-registry.mjs',
  'scripts/prepare-sdk-consumer.mjs',
  'scripts/build-standard-sites.mjs',
  'scripts/build-browser-demo.mjs',
  'apps/web/playwright.standard.config.ts',
  'packages/sdk/scripts/build.mjs',
  'packages/sdk/package.json',
  'apps/web/next.config.ts',
  'apps/web/playwright.demo.config.ts',
  'apps/web/tests/demo/demo.spec.ts',
];
async function collect(directory) {
  for (const item of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${item.name}`;
    if (item.isDirectory()) await collect(path);
    else if (/\.(?:ts|tsx|js|css)$/.test(item.name)) files.push(path);
  }
}
for (const directory of directories) await collect(directory);
let mismatches = 0;
for (const file of files) {
  const path = resolve(root, file);
  const options = { ...(await resolveConfig(path)), filepath: path };
  const source = await readFile(path, 'utf8');
  if (await check(source, options)) continue;
  mismatches++;
  if (writing) await writeFile(path, await format(source, options));
  else console.error(`Formatting required: ${relative(root, path)}`);
}
console.log(
  `${writing ? 'Formatted' : 'Checked'} ${files.length} maintained core files (${mismatches} ${writing ? 'updated' : 'unformatted'}).`,
);
if (!writing && mismatches) process.exitCode = 1;
