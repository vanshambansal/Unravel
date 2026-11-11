import { build } from 'esbuild';
import { writeFile, readFile, readdir } from 'node:fs/promises';
const shared = { entryPoints: ['src/index.ts'], bundle: true, platform: 'browser', target: ['es2022'], minify: true, sourcemap: false, metafile: true, legalComments: 'external', loader: { '.css': 'text', '.svg': 'text' } };
const esm = await build({ ...shared, format: 'esm', splitting: true, outdir: 'dist', chunkNames: 'chunks/[name]-[hash]' });
const script = await build({ ...shared, format: 'iife', globalName: 'UnravelSDK', outfile: 'dist/unravel.global.js' });
await writeFile('dist/build-meta.json', JSON.stringify({ esm: esm.metafile, script: script.metafile }, null, 2) + '\n');
// Runtime contracts are bundled. Make declarations equally portable, without a private
// workspace package lookup when a developer installs the SDK tarball externally.
await writeFile('dist/contracts.d.ts', await readFile('../contracts/dist/index.d.ts', 'utf8'));
for (const name of await readdir('dist')) if (name.endsWith('.d.ts') && name !== 'contracts.d.ts') {
  const path = `dist/${name}`;
  await writeFile(path, (await readFile(path,'utf8')).replaceAll("'@unravel/contracts'", "'./contracts'"));
}
