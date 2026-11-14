import 'server-only';
import { requireDeveloper } from './auth';
import { withDatabaseConnection, type database } from './db/connection';

/** Numeric stage timings only. Authentication and data ownership remain in the read. */
export async function timedPrivateRead<T>(read: (owner: string, db: ReturnType<typeof database>) => Promise<T>) {
  const started = performance.now();
  const owner = await requireDeveloper();
  const timings = [`auth;dur=${(performance.now() - started).toFixed(1)}`];
  const value = await withDatabaseConnection(db => read(owner, db), (name, ms) => timings.push(`${name};dur=${ms.toFixed(1)}`));
  const serialization = performance.now();
  const body = JSON.stringify(value);
  timings.push(`serialization;dur=${(performance.now() - serialization).toFixed(1)}`);
  return new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Server-Timing': timings.join(', ') } });
}
