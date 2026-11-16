import nextEnv from '@next/env';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
nextEnv.loadEnvConfig(root, true, { info() {}, error() {} });
const command = process.argv[2];
const variable = command === 'migrate' ? 'DATABASE_MIGRATION_URL' : 'DATABASE_URL';
let pool;
function identity(value) {
  const url = new URL(value);
  return `${url.hostname.replace(/-pooler(?=\.)/, '')}:${url.port || '5432'}${url.pathname}`;
}
try {
  const value = process.env[variable]?.trim();
  if (!value) throw new Error(`${variable} is missing. Configure apps/web/.env.local.`);
  if (command === 'migrate') {
    if (!process.env.DATABASE_URL || identity(value) !== identity(process.env.DATABASE_URL))
      throw new Error('Migration and application URLs must target the same development database.');
  } else if (command !== 'check') throw new Error('Use check or migrate.');
  pool = new Pool({ connectionString: value, max: 1, connectionTimeoutMillis: 15000 });
  if (command === 'migrate') {
    await migrate(drizzle(pool), { migrationsFolder: resolve(root, 'drizzle') });
    console.log('Reviewed development migrations applied successfully.');
  } else {
    await pool.query('select 1');
    const tables = [
      'projects',
      'reports',
      'report_payloads',
      'report_test_plans',
      'ingestion_budgets',
      'account_intake_blocks',
    ];
    const result = await pool.query(
      "select name, to_regclass('public.' || name) is not null as present from unnest($1::text[]) as names(name)",
      [tables],
    );
    const missing = result.rows.filter((row) => !row.present).map((row) => row.name);
    if (missing.length)
      throw new Error(`Database schema incomplete: ${missing.join(', ')}. Run db:migrate.`);
    console.log(`Database connection and all ${tables.length} required application tables passed.`);
  }
} catch (error) {
  // Database driver messages can contain credentials/hostnames; never echo them.
  const safe =
    error instanceof Error &&
    /^(DATABASE_|Database schema|Migration and|Use check)/.test(error.message);
  console.error(
    safe
      ? error.message
      : 'Database operation failed. Check local credentials, network access and the reviewed schema. No connection details were logged.',
  );
  process.exitCode = 1;
} finally {
  await pool?.end();
}
