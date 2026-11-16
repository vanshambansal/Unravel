import { build } from '../packages/sdk/node_modules/esbuild/lib/main.js';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const appRequire = createRequire(new URL('../apps/web/package.json', import.meta.url));
await build({ entryPoints: ['tests/sdk/react-smoke.tsx'], outfile: '.cache/sdk-react-smoke.js', bundle: true, platform: 'browser', format: 'iife', jsx: 'automatic', alias: {
  react: appRequire.resolve('react'),
  'react/jsx-runtime': appRequire.resolve('react/jsx-runtime'),
  'react-dom/client': appRequire.resolve('react-dom/client'),
  '@vansham/unravel-sdk': fileURLToPath(new URL('../packages/sdk/dist/index.js', import.meta.url)),
} });
