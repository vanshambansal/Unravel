import { defineConfig } from '@playwright/test';
import reports from './playwright.reports.config';
export default defineConfig({
  ...reports,
  testMatch: 'standard-sites.spec.ts',
  testIgnore: [],
  outputDir: './test-results/standard-sites',
  timeout: 180000,
  webServer: [
    ...(Array.isArray(reports.webServer) ? reports.webServer : []),
    {
      command: 'node ../../fixtures/standard-sites/server.mjs',
      url: 'http://127.0.0.1:4194',
      reuseExistingServer: false,
    },
    {
      command:
        process.env.STANDARD_PACKED_CONSUMER === 'true'
          ? process.env.STANDARD_SDK_REGISTRY === 'true'
            ? 'node ../../.cache/sdk-registry-consumer/serve-next.mjs'
            : 'node ../../.cache/sdk-release-consumer/serve-next.mjs'
          : 'corepack pnpm --dir ../.. --filter @unravel/standard-next-fixture dev',
      url: 'http://127.0.0.1:3017',
      reuseExistingServer: false,
      timeout: 120000,
      env: { NEXT_TELEMETRY_DISABLED: '1' },
    },
  ],
});
