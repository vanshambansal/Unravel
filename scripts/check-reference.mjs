import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const before = JSON.parse(await readFile('tests/fixtures/prototype-manifest.json', 'utf8'));
for (const [file, expected] of Object.entries(before)) {
  const bytes = await readFile(`prototypes/landing-motion/${file}`);
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error(`Reference changed: ${file}`);
}
console.log(`Original prototype unchanged: ${Object.keys(before).length} files`);
