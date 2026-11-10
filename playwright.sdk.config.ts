import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/sdk', workers: 1, retries: 0, timeout: 30000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4183', trace: 'off', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node fixtures/test-site/server.mjs', url: 'http://127.0.0.1:4183', reuseExistingServer: false, env: { FIXTURE_PORT: '4183' } },
    { command: 'corepack pnpm --filter @unravel/web exec next dev --hostname localhost --port 3013', url: 'http://localhost:3013/sdk-lab', reuseExistingServer: false, timeout: 120000, env: { NEXT_TELEMETRY_DISABLED: '1' } },
  ],
});
