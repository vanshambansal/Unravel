import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';

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

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const directory = '.playwright-mcp/migration-parity'; await mkdir(directory, { recursive: true });
const results = [];
try {
  for (const [device,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
    for (const [name,base] of [['reference','http://127.0.0.1:4174'],['next','http://localhost:3000']]) {
      const context = await browser.newContext({ viewport: {width,height}, deviceScaleFactor: 1 });
      let release; const gate = new Promise(resolve => { release = resolve; });
      await context.route('**/architecture/atrium.glb', async route => { await gate; await route.continue(); });
      const page = await context.newPage();
      try {
        await page.goto(base, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => !!window.__unravelStudy);
        await page.getByRole('button', {name:'Pause motion'}).click(); release();
        await page.waitForFunction(() => !!window.__unravelStudy().scene);
        await page.evaluate(() => document.fonts.ready);
        for (const [frame,progress] of [['start',0],['crossing',.45],['hero',1]]) {
          await page.evaluate(p => scrollTo(0,innerHeight*2*p),progress);
          await page.waitForFunction(p => Math.abs(window.__unravelStudy().progress-p)<.001,progress);
          await page.evaluate(() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
          await page.screenshot({path:`${directory}/${device}-${frame}-${name}.png`});
        }
      } finally { release(); await context.close(); }
    }
    for (const frame of ['start','crossing','hero']) {
      const a=await png(`${directory}/${device}-${frame}-reference.png`), b=await png(`${directory}/${device}-${frame}-next.png`);
      let sum=0,changed=0;
      for(let i=0;i<a.width*a.height;i++) {
        let peak=0;
        for(let c=0;c<3;c++){const d=Math.abs(a.pixels[i*a.channels+c]-b.pixels[i*b.channels+c]);sum+=d;peak=Math.max(peak,d);}
        if(peak>16)changed++;
      }
      const result={device,frame,mean:sum/(a.width*a.height*3),changedFraction:changed/(a.width*a.height)};
      results.push(result); console.log(JSON.stringify(result));
      if(result.mean>2||result.changedFraction>.03) throw new Error('Visual parity requires inspection: '+JSON.stringify(result));
    }
  }
  await writeFile(`${directory}/results.json`, JSON.stringify(results,null,2)+'\n');
} finally { await browser.close(); }
