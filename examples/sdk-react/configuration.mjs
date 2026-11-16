import process, { loadEnvFile } from 'node:process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Inject only these public values, never the process environment as a whole. */
export function bundleOptions() {
  const directory = fileURLToPath(new URL('./', import.meta.url));
  const local = new URL('./.env.local', import.meta.url);
  if (existsSync(local)) loadEnvFile(local);
  return {
    absWorkingDir: directory,
    entryPoints: ['src/main.tsx'],
    bundle: true,
    outdir: 'dist',
    jsx: 'automatic',
    sourcemap: true,
    define: {
      'process.env.UNRAVEL_PROJECT_ID': JSON.stringify(process.env.UNRAVEL_PROJECT_ID ?? ''),
      'process.env.UNRAVEL_APPLICATION_ORIGIN': JSON.stringify(
        process.env.UNRAVEL_APPLICATION_ORIGIN ?? 'http://localhost:3000',
      ),
    },
  };
}
