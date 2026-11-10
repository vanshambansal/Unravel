import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, retries: 0, timeout: 120000,
  expect: { timeout: 15000 }, reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000', launchOptions: { args: ['--enable-unsafe-swiftshader'] }, trace: { mode: 'retain-on-failure', screenshots: false, snapshots: true, sources: true }, screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'corepack pnpm dev', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI,
    timeout: 120000, env: { NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_MOTION_DIAGNOSTICS: '1' },
  },
});
