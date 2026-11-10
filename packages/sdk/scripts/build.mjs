import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
const shared = { entryPoints: ['src/index.ts'], bundle: true, platform: 'browser', target: ['es2022'], minify: true, sourcemap: false, metafile: true, legalComments: 'external' };
const esm = await build({ ...shared, format: 'esm', splitting: true, outdir: 'dist', chunkNames: 'chunks/[name]-[hash]' });
const script = await build({ ...shared, format: 'iife', globalName: 'UnravelSDK', outfile: 'dist/unravel.global.js' });
await writeFile('dist/build-meta.json', JSON.stringify({ esm: esm.metafile, script: script.metafile }, null, 2) + '\n');
