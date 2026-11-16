import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(new URL('../examples/browser-demo/package.json', import.meta.url));
const { build } = require('esbuild');

// Resolve every runtime from the independent registry consumer, never from workspace SDK source.
await build({
  absWorkingDir: root,
  entryPoints: ['examples/browser-demo/src/main.tsx'],
  outfile: 'apps/web/public/demo-assets/react.js',
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'iife',
  jsx: 'automatic',
  external: ['/landing/*'],
  define: { 'process.env.NODE_ENV': '"production"' },
  alias: {
    react: require.resolve('react'),
    'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    'react-dom/client': require.resolve('react-dom/client'),
    '@unravel/published-sdk': fileURLToPath(
      new URL(
        '../examples/browser-demo/node_modules/@unravel/published-sdk/dist/index.js',
        import.meta.url,
      ),
    ),
  },
});
console.log('Built standalone React demo with the published SDK.');
