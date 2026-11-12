import {defineConfig} from '@playwright/test';
import reports from './playwright.reports.config';
export default defineConfig({...reports,testMatch:'management.spec.ts',testIgnore:[],timeout:180000,outputDir:'./test-results/management',use:{...reports.use,actionTimeout:15000},webServer:[...(Array.isArray(reports.webServer)?reports.webServer:[]),{command:'node ../../fixtures/test-site/server.mjs',url:'http://127.0.0.1:4188',reuseExistingServer:false,env:{FIXTURE_PORT:'4188',FIXTURE_ALLOW_TEST_CONFIG:'1'}}]});
