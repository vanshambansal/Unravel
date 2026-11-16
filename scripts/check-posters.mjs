import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const motion = 'apps/web/src/features/landing/motion/';
const artwork = 'apps/web/public/landing/artwork/';
const sources = ['scene.ts','asset-scene.ts','architecture.ts','framing.ts','choreography.ts'].map(name => motion + name);
sources.push('apps/web/src/features/landing/SceneCapture.tsx', 'apps/web/package.json', 'pnpm-lock.yaml', ...['atrium.glb','indirect-light.png','ambient-occlusion.png'].map(name => 'apps/web/public/landing/architecture/' + name));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
// Git checkouts may use CRLF on Windows and LF in CI. Text line endings do not
// change a rendered frame; binary model/texture bytes must remain exact.
const sourceHash = hash(Buffer.concat(await Promise.all(sources.map(async path => {
  const bytes = await readFile(path);
  return /\.(?:ts|tsx|json|yaml)$/.test(path)
    ? Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'))
    : bytes;
}))));
const names = ['scene-start-desktop.png','scene-hero-desktop.png','scene-start-mobile.png','scene-hero-mobile.png'];
const assets = Object.fromEntries(await Promise.all(names.map(async name => {
  const bytes = await readFile(artwork + name);
  if (bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Invalid PNG: ' + name);
  return [name, { sha256: hash(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }];
})));
const path = artwork + 'scene-posters.json';
if (process.argv.includes('--stamp')) {
  await writeFile(path, JSON.stringify({ sourceHashVersion: 2, sourceHash, sources, assets, ambientTime: 0, capturedWith: 'Next.js /motion-capture; Chromium; DPR1; desktop 1440x900 and mobile 390x844' }, null, 2) + '\n');
  console.log('Poster manifest stamped after capture.');
} else {
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  if (manifest.sourceHash !== sourceHash || JSON.stringify(manifest.assets) !== JSON.stringify(assets)) throw new Error('Posters stale: run pnpm posters:capture against the local development server, then pnpm posters:stamp.');
  console.log('Application poster integrity/freshness passed');
}
