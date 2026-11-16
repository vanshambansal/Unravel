import { defineConfig } from '@playwright/test';
import nextEnv from '@next/env';
import { fileURLToPath } from 'node:url';
nextEnv.loadEnvConfig(fileURLToPath(new URL('./', import.meta.url)), true, {
  info() {},
  error() {},
});

// Run against an explicitly started app/player pair; never take over another developer server.
export default defineConfig({
  testDir: './tests/demo',
  workers: 1,
  retries: 0,
  timeout: 90000,
  expect: { timeout: 20000 },
  reporter: 'list',
  outputDir: './test-results/demo',
  use: {
    baseURL: process.env.DEMO_BASE_URL ?? 'http://localhost:3052',
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
});
