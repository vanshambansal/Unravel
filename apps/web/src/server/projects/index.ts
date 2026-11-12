import 'server-only';
import { database } from '../db/connection.ts';
import { projectRepository } from './repository.ts';
import { projectService } from './service.ts';
import { ApplicationError } from '../errors.ts';
import { cache } from 'react';
import { storageFailureKind } from '../storage-diagnostics';

async function safe<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); }
  catch (error) {
    if (error instanceof ApplicationError) throw error;
    console.error('Project storage request failed:',storageFailureKind(error));
    // Do not attach driver causes: server-rendering logs must not expose secrets.
    throw new ApplicationError(503, 'Project storage is unavailable. Please try again.');
  }
}
// React invalidates this at each server render; never a cross-owner/session cache.
const renderProjectList = cache((owner: string | null) => safe(() => projectService(projectRepository(database())).list(owner)));

export function projectServices() {
  const service = projectService(projectRepository(database()));
  return {
    list: renderProjectList,
    get: (owner: string | null, id: string) => safe(() => service.get(owner, id)),
    create: (owner: string | null, input: unknown) => safe(() => service.create(owner, input)),
    update: (owner: string | null, id: string, input: unknown) => safe(() => service.update(owner, id, input)),
    remove: (owner: string | null, id: string, input: unknown) => safe(() => service.remove(owner, id, input)),
  };
}
