import 'server-only';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ApplicationError } from '../errors.ts';
import * as schema from './schema.ts';

const singleton = globalThis as typeof globalThis & { unravelPool?: Pool };
export function database(): NodePgDatabase<typeof schema> {
  if (!process.env.DATABASE_URL?.trim()) throw new ApplicationError(503, 'Project storage is not configured yet.');
  try {
    if (!singleton.unravelPool) {
      // Measured reconnects cost ~0.5s while warm queries cost ~0.09s. Reuse the
      // same bounded pool across ordinary pauses; no background keepalive query.
      singleton.unravelPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 120000, maxLifetimeSeconds: 300 });
      // Idle pool failures must not become unhandled events or log credentials.
      singleton.unravelPool.on('error', () => { console.error('Project storage lost an idle database connection.'); });
    }
  } catch {
    throw new ApplicationError(503, 'Project storage is unavailable. Please try again.');
  }
  return drizzle(singleton.unravelPool, { schema });
}

/** Attribute acquisition separately from execution; never retain SQL or values. */
export async function withDatabaseConnection<T>(work: (db: ReturnType<typeof database>) => Promise<T>, timing?: (name: 'connection' | 'query', ms: number) => void): Promise<T> {
  database();
  const start = performance.now();
  const client = await singleton.unravelPool!.connect();
  timing?.('connection', performance.now() - start);
  const acquired = performance.now();
  try { return await work(drizzle(client, { schema })); }
  finally { timing?.('query', performance.now() - acquired); client.release(); }
}
