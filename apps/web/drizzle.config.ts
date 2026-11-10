import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';
loadEnvConfig(process.cwd(), true, { info() {}, error() {} });

export default defineConfig({
  schema: './src/server/db/schema.ts', out: './drizzle', dialect: 'postgresql',
  // Generation needs no credentials; migration is performed by the guarded script.
  dbCredentials: { url: process.env.DATABASE_MIGRATION_URL ?? '' },
});
