import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/sdk', workers: 1, retries: 0, timeout: 30000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4183', trace: 'off', screenshot: 'only-on-failure' },
  projects: (process.env.SDK_BROWSER==='all'?['chromium','firefox']:process.env.SDK_BROWSER==='firefox'?['firefox']:['chromium']).map(name=>({name,use:{...devices[name==='firefox'?'Desktop Firefox':'Desktop Chrome']}})),
  webServer: [
    { command: 'node fixtures/test-site/server.mjs', url: 'http://127.0.0.1:4183', reuseExistingServer: false, env: { FIXTURE_PORT: '4183', FIXTURE_ALLOW_TEST_CONFIG: '1' } },
    { command: 'node fixtures/test-site/server.mjs', url: 'http://127.0.0.1:4186', reuseExistingServer: false, env: { FIXTURE_PORT: '4186', FIXTURE_ALLOW_TEST_CONFIG: '0', UNRAVEL_PROJECT_ID: '12345678-1234-4234-8234-123456789012', UNRAVEL_APPLICATION_ORIGIN: 'http://127.0.0.1:4183' } },
    ...process.env.SDK_LAB_BASE_URL ? [] : [{ command: 'corepack pnpm --filter @unravel/web exec next dev --hostname localhost --port 3013', url: 'http://localhost:3013/sdk-lab', reuseExistingServer: false, timeout: 120000, env: { NEXT_TELEMETRY_DISABLED: '1' } }],
  ],
});
