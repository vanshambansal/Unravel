import { defineConfig } from '@playwright/test';
import base from './playwright.reports.config';
if (!process.env.REPORTS_BASE_URL) throw new Error('Set REPORTS_BASE_URL to the application preview after actually restarting it.');
export default defineConfig({
  ...base, testMatch: 'restart.spec.ts', testIgnore: [],
  // This proof targets an already restarted app and its already running isolated player.
  webServer: undefined,
});
