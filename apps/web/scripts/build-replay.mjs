import { build } from '../../../packages/sdk/node_modules/esbuild/lib/main.js';
import { fileURLToPath } from 'node:url';
await build({ absWorkingDir: fileURLToPath(new URL('../', import.meta.url)), entryPoints: ['src/features/reports/player-host.ts'], outdir: '../../.cache/replay-host', entryNames: 'player', bundle: true, platform: 'browser', target: 'es2022', format: 'iife', minify: true, legalComments: 'inline' });
console.log('Trusted sandbox replay host built.');
