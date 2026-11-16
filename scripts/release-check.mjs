import nextEnv from '../apps/web/node_modules/@next/env/dist/index.js';
import { releaseIssues } from '../apps/web/src/server/release.ts';
nextEnv.loadEnvConfig('apps/web', true, { info() {}, error() {} });
const issues = releaseIssues(process.env);
console.log(
  JSON.stringify(
    {
      ready: issues.length === 0 && process.env.PUBLIC_INGESTION_ENABLED === 'true',
      configurationReady: issues.length === 0,
      publicIngestionEnabled: process.env.PUBLIC_INGESTION_ENABLED === 'true',
      issues,
      note: 'Configuration preflight only. Does not prove provider settings, edge enforcement, TLS, retention review or deployment behavior.',
    },
    null,
    2,
  ),
);
// A fully configured but deliberately disabled deployment is still not ready.
if (issues.length || process.env.PUBLIC_INGESTION_ENABLED !== 'true') process.exitCode = 1;
