import { defineConfig } from '@playwright/test';
import nextEnv from '@next/env';
import { fileURLToPath } from 'node:url';
nextEnv.loadEnvConfig(fileURLToPath(new URL('./', import.meta.url)), true, { info() {}, error() {} });
const external = process.env.REPORTS_BASE_URL;
export default defineConfig({
  testDir: './tests/reports', testIgnore: ['restart.spec.ts', 'project-management.spec.ts', 'standard-sites.spec.ts', 'management.spec.ts'], workers: 1, retries: 0, timeout: 120000, expect: { timeout: 20000 }, reporter: 'list', outputDir: './test-results/reports',
  use: { baseURL: external ?? 'http://localhost:3015', trace: 'off', screenshot: 'off', video: 'off' },
  webServer: [
    { command: 'node ../../scripts/replay-host.mjs', url: 'http://127.0.0.1:4191/health', reuseExistingServer: false, env: { REPLAY_PORT: '4191', REPLAY_PARENT_ORIGINS: external ?? 'http://localhost:3015' } },
    { command: 'node ../../fixtures/test-site/server.mjs', url: 'http://127.0.0.1:4185', reuseExistingServer: false, env: { FIXTURE_PORT: '4185', FIXTURE_ALLOW_TEST_CONFIG: '1' } },
    ...external ? [] : [{ command: 'corepack pnpm exec next dev --hostname localhost --port 3015', url: 'http://localhost:3015/sign-in', reuseExistingServer: false, timeout: 120000, env: { NEXT_TELEMETRY_DISABLED: '1', REPLAY_ORIGIN: 'http://127.0.0.1:4191' } }],
  ],
});
