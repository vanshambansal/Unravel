import 'server-only';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ApplicationError } from '../errors.ts';
import * as schema from './schema.ts';

const singleton = globalThis as typeof globalThis & { unravelPool?: Pool };
export function database() {
  if (!process.env.DATABASE_URL?.trim()) throw new ApplicationError(503, 'Project storage is not configured yet.');
  try {
    if (!singleton.unravelPool) {
      singleton.unravelPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 });
      // Idle pool failures must not become unhandled events or log credentials.
      singleton.unravelPool.on('error', () => { console.error('Project storage lost an idle database connection.'); });
    }
  } catch {
    throw new ApplicationError(503, 'Project storage is unavailable. Please try again.');
  }
  return drizzle(singleton.unravelPool, { schema });
}
