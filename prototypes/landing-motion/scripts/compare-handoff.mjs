import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { resolve } from 'node:path';

// Read Chromium's non-interlaced 8-bit RGB/RGBA screenshots without adding an image dependency.
async function png(path) {
  const bytes = await readFile(path), chunks = [];
  let width, height, channels;
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      channels = data[9] === 2 ? 3 : data[9] === 6 ? 4 : 0;
      if (data[8] !== 8 || data[12] !== 0 || !channels) throw new Error(`Unsupported PNG format: ${path}`);
    }
    if (type === 'IDAT') chunks.push(data);
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * channels;
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const up = y ? pixels[(y - 1) * stride + x] : 0;
      const corner = y && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      const p = left + up - corner;
      const paeth = Math.abs(p - left) <= Math.abs(p - up) && Math.abs(p - left) <= Math.abs(p - corner) ? left : Math.abs(p - up) <= Math.abs(p - corner) ? up : corner;
      const prediction = [0, left, up, Math.floor((left + up) / 2), paeth][filter];
      if (prediction === undefined) throw new Error(`Unknown PNG filter ${filter}`);
      pixels[y * stride + x] = (raw[y * (stride + 1) + 1 + x] + prediction) & 255;
    }
  }
  return { width, height, channels, pixels };
}
const root = resolve(process.argv[2] ?? '../../.playwright-mcp');
for (const name of ['desktop', 'wide', 'mobile']) {
  const a = await png(`${root}/handoff-${name}-before.png`), b = await png(`${root}/handoff-${name}-after.png`);
  if (a.width !== b.width || a.height !== b.height) throw new Error(`Size mismatch: ${name}`);
  let sum = 0, changed = 0, max = 0;
  for (let i = 0; i < a.width * a.height; i++) {
    let pixelDifference = 0;
    for (let c = 0; c < 3; c++) {
      const d = Math.abs(a.pixels[i * a.channels + c] - b.pixels[i * b.channels + c]);
      sum += d; pixelDifference = Math.max(pixelDifference, d); max = Math.max(max, d);
    }
    if (pixelDifference > 8) changed++;
  }
  const mean = sum / (a.width * a.height * 3), changedFraction = changed / (a.width * a.height);
  console.log(JSON.stringify({ name, meanChannelDifference: mean, changedFraction, maxChannelDifference: max }));
  if (mean > 1 || changedFraction > .01) throw new Error(`Visible poster/renderer mismatch: ${name}`);
}
