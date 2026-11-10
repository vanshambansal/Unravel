import 'server-only';
import { database } from '../db/connection.ts';
import { projectRepository } from './repository.ts';
import { projectService } from './service.ts';
import { ApplicationError } from '../errors.ts';

async function safe<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); }
  catch (error) {
    if (error instanceof ApplicationError) throw error;
    // Do not attach driver causes: server-rendering logs must not expose secrets.
    throw new ApplicationError(503, 'Project storage is unavailable. Please try again.');
  }
}
export function projectServices() {
  const service = projectService(projectRepository(database()));
  return {
    list: (owner: string | null) => safe(() => service.list(owner)),
    get: (owner: string | null, id: string) => safe(() => service.get(owner, id)),
    create: (owner: string | null, input: unknown) => safe(() => service.create(owner, input)),
  };
}
