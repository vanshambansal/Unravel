import 'server-only';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ApplicationError } from '../errors.ts';
import * as schema from './schema.ts';

const singleton = globalThis as typeof globalThis & { unravelPool?: Pool };
export function database(): NodePgDatabase<typeof schema> {
  if (!process.env.DATABASE_URL?.trim())
    throw new ApplicationError(503, 'Project storage is not configured yet.');
  try {
    if (!singleton.unravelPool) {
      // A 125s idle comparison measured 575ms reconnect versus 0.7ms reuse. Keep the
      // same bounded pool across ordinary pauses; no background keepalive query.
      singleton.unravelPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 300000,
        maxLifetimeSeconds: 1800,
      });
      // Idle pool failures must not become unhandled events or log credentials.
      singleton.unravelPool.on('error', () => {
        console.error('Project storage lost an idle database connection.');
      });
    }
  } catch {
    throw new ApplicationError(503, 'Project storage is unavailable. Please try again.');
  }
  return drizzle(singleton.unravelPool, { schema });
}

/** Attribute acquisition separately from execution; never retain SQL or values. */
export async function withDatabaseConnection<T>(
  work: (db: ReturnType<typeof database>) => Promise<T>,
  timing?: (name: 'connection' | 'query', ms: number) => void,
): Promise<T> {
  database();
  const start = performance.now();
  const client = await singleton.unravelPool!.connect();
  timing?.('connection', performance.now() - start);
  const acquired = performance.now();
  try {
    return await work(drizzle(client, { schema }));
  } finally {
    timing?.('query', performance.now() - acquired);
    client.release();
  }
}
