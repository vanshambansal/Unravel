import 'server-only';
import { database } from '../db/connection';
import { reportRepository } from './repository';
import { reportService } from './service';
import type { ReportQuery } from '../../features/reports/management';
import { ApplicationError } from '../errors';
import { storageFailureKind } from '../storage-diagnostics';

export function reportServices(db = database()) {
  const service = reportService(reportRepository(db));
  const safe = async <T>(work: () => Promise<T>): Promise<T> => {
    try {
      return await work();
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      console.error('Report storage request failed:', storageFailureKind(error));
      throw new ApplicationError(503, 'Report storage is unavailable. Please try again.');
    }
  };
  return {
    website: (id: string, origin: string | null) => safe(() => service.website(id, origin)),
    submit: (id: string, origin: string | null, input: unknown) =>
      safe(() => service.submit(id, origin, input)),
    list: (owner: string | null, id: string, query?: ReportQuery) =>
      safe(() => service.list(owner, id, query)),
    consume: (id: string) => safe(() => service.consume(id)),
    update: (owner: string | null, id: string, report: string, input: unknown) =>
      safe(() => service.update(owner, id, report, input)),
    detail: (owner: string | null, id: string, report: string) =>
      safe(() => service.detail(owner, id, report)),
    planContext: (owner: string | null, id: string, report: string) =>
      safe(() => service.planContext(owner, id, report)),
    assertOwned: (owner: string | null, id: string, report: string) =>
      safe(() => service.assertOwned(owner, id, report)),
    replay: (owner: string | null, id: string, report: string) =>
      safe(() => service.replay(owner, id, report)),
    remove: (owner: string | null, id: string, report: string) =>
      safe(() => service.remove(owner, id, report)),
  };
}
