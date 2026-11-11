import { defineConfig } from '@playwright/test';
import reports from './playwright.reports.config';

export default defineConfig({
  ...reports,
  testMatch: 'project-management.spec.ts',
  testIgnore: [],
  outputDir: './test-results/project-management',
  webServer: [
    ...(Array.isArray(reports.webServer) ? reports.webServer : []),
    { command: 'node ../../fixtures/test-site/server.mjs', url: 'http://127.0.0.1:4187', reuseExistingServer: false, env: { FIXTURE_PORT: '4187', FIXTURE_ALLOW_TEST_CONFIG: '1' } },
  ],
});
