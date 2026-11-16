import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const before = JSON.parse(await readFile('tests/fixtures/prototype-manifest.json', 'utf8'));
for (const [file, expected] of Object.entries(before)) {
  const bytes = await readFile(`prototypes/landing-motion/${file}`);
  if (createHash('sha256').update(bytes).digest('hex') === expected) continue;
  // The reference manifest predates migration and contains mixed text endings.
  // A Git checkout may convert them; permit only that reversible difference.
  const text = bytes.toString('utf8');
  const isText = !bytes.includes(0) && Buffer.from(text).equals(bytes);
  const variants = isText ? [text.replaceAll('\r\n', '\n'), text.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n')] : [];
  if (!variants.some(value => createHash('sha256').update(value).digest('hex') === expected)) throw new Error(`Reference changed: ${file}`);
}
console.log(`Original prototype unchanged: ${Object.keys(before).length} files`);
