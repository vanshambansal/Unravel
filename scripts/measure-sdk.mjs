import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const root = 'packages/sdk/';
const meta = JSON.parse(await readFile(root + 'dist/build-meta.json', 'utf8'));
const result = { measuredAt: new Date().toISOString(), node: process.version, bundles: {}, note: 'Bytes are build measurements, not proven product budgets. rrweb is lazy in ESM and bundled in the standalone script.' };
for (const [name, build] of Object.entries(meta)) {
  const outputs = [];
  for (const [path, details] of Object.entries(build.outputs)) {
    if (!path.endsWith('.js')) continue;
    const bytes = await readFile(root + path);
    outputs.push({ file: path, bytes: bytes.length, gzip: gzipSync(bytes).length });
    for (const [input, contribution] of Object.entries(details.inputs)) {
      if (contribution.bytesInOutput > 0 && /(?:replay|replayer|player)[/\\]/i.test(input)) throw new Error('Playback implementation found in recording bundle: ' + input);
    }
    if (/class Replayer|class Player/.test(bytes.toString())) throw new Error('Unexpected playback class');
  }
  result.bundles[name] = outputs;
}
await mkdir('.cache', { recursive: true });
await writeFile('.cache/sdk-bundle-measurement.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
try {
  const previous = JSON.parse(await readFile('.cache/sdk-recording-measurement.json', 'utf8'));
  console.log('Last browser sample (not rerun by this command):', JSON.stringify(previous));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  console.log('No saved browser sample. Run pnpm test:sdk to measure recording overhead.');
}
