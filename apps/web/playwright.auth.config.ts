import { defineConfig } from '@playwright/test';
import nextEnv from '@next/env';
import { fileURLToPath } from 'node:url';
import base from '../../playwright.config';
nextEnv.loadEnvConfig(fileURLToPath(new URL('./', import.meta.url)), true, { info() {}, error() {} });

export default defineConfig({
  ...base, testDir: './tests/auth',
  outputDir: './test-results/auth', reporter: [['list']],
  // Auth traces can contain session headers; keep no auth traces or storage files.
  use: { ...base.use, trace: 'off', screenshot: 'off', video: 'off' },
});
