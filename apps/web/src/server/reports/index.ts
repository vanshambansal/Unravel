import 'server-only';
import { database } from '../db/connection';
import { reportRepository } from './repository';
import { reportService } from './service';
import { ApplicationError } from '../errors';

export function reportServices() {
  const service = reportService(reportRepository(database()));
  const safe = async <T>(work: () => Promise<T>): Promise<T> => {
    try { return await work(); } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(503, 'Report storage is unavailable. Please try again.');
    }
  };
  return {
    website: (id: string, origin: string | null) => safe(() => service.website(id, origin)),
    submit: (id: string, origin: string | null, input: unknown) => safe(() => service.submit(id, origin, input)),
    list: (owner: string | null, id: string) => safe(() => service.list(owner, id)),
    detail: (owner: string | null, id: string, report: string) => safe(() => service.detail(owner, id, report)),
    replay: (owner: string | null, id: string, report: string) => safe(() => service.replay(owner, id, report)),
    remove: (owner: string | null, id: string, report: string) => safe(() => service.remove(owner, id, report)),
  };
}
