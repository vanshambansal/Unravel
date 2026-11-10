import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

// This is a freshness/integrity check, not a claim of cross-GPU pixel equivalence.
const sources = ['src/scene.ts', 'src/asset-scene.ts', 'src/architecture.ts', 'src/framing.ts', 'src/choreography.ts', 'src/capture.ts', 'package-lock.json', 'public/architecture/atrium.glb', 'public/architecture/indirect-light.png', 'public/architecture/ambient-occlusion.png'];
const filenames = ['scene-start-desktop.png', 'scene-hero-desktop.png', 'scene-start-mobile.png', 'scene-hero-mobile.png'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceHash = hash(Buffer.concat(await Promise.all(sources.map(path => readFile(path)))));
const assets = Object.fromEntries(await Promise.all(filenames.map(async name => {
  const bytes = await readFile(`public/artwork/${name}`);
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Invalid PNG: ${name}`);
  return [name, { sha256: hash(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }];
})));
const path = 'public/artwork/scene-posters.json';
if (process.argv.includes('--stamp')) {
  await writeFile(path, JSON.stringify({ sourceHash, sources, assets, ambientTime: 0, capturedWith: 'capture.html; Chromium; DPR 1; desktop 1440x900 / mobile 390x844' }, null, 2) + '\n');
  console.log('Poster manifest stamped. Only use after recapturing all four frames.');
} else {
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  if (manifest.sourceHash !== sourceHash || JSON.stringify(manifest.assets) !== JSON.stringify(assets)) throw new Error('Scene posters are stale. Regenerate via capture.html and stamp the manifest; see README.');
  console.log('Scene poster freshness/integrity: passed');
}
