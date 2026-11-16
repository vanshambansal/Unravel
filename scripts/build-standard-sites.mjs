import { build } from '../packages/sdk/node_modules/esbuild/lib/main.js';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
const app = createRequire(new URL('../apps/web/package.json', import.meta.url));
await mkdir('.cache', { recursive: true });
for (const name of ['react', 'next'])
  await writeFile(
    `.cache/standard-${name}-config.json`,
    JSON.stringify({ projectId: null, applicationOrigin: 'http://localhost:3016', fixed: false }),
  );
const packed = process.env.STANDARD_PACKED_CONSUMER === 'true';
const consumerName =
  process.env.STANDARD_SDK_REGISTRY === 'true' ? 'sdk-registry-consumer' : 'sdk-release-consumer';
await build({
  entryPoints: [packed ? `.cache/${consumerName}/react.tsx` : 'fixtures/standard-sites/react.tsx'],
  outfile: '.cache/standard-react.js',
  bundle: true,
  platform: 'browser',
  format: 'iife',
  jsx: 'automatic',
  ...(packed
    ? {}
    : {
        alias: {
          react: app.resolve('react'),
          'react/jsx-runtime': app.resolve('react/jsx-runtime'),
          'react-dom/client': app.resolve('react-dom/client'),
          '@vansham/unravel-sdk':
            process.env.SDK_ENTRY_OVERRIDE ??
            fileURLToPath(new URL('../packages/sdk/dist/index.js', import.meta.url)),
        },
      }),
});
