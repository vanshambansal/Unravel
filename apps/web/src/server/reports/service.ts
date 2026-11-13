import { createHash } from 'node:crypto';
import { MAX_SUBMISSION_BYTES } from '@unravel/contracts';
import { ApplicationError } from '../errors.ts';
import type { ReportRepository } from './repository.ts';
import { reportChanges, type ReportQuery } from '../../features/reports/management.ts';
import { validateSubmission } from './validation.ts';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function reportService(repository: ReportRepository) {
  function owner(subject: string | null, projectId: string, reportId?: string): string {
    if (!subject) throw new ApplicationError(401, 'Sign in to continue.');
    if (!uuid.test(projectId) || (reportId && !uuid.test(reportId))) throw new ApplicationError(404, 'Report not found.');
    return subject;
  }
  return {
    async website(projectId: string, origin: string | null) {
      if (!uuid.test(projectId) || !origin) throw new ApplicationError(403, 'Website origin is not registered for this project.');
      const project = await repository.publicProject(projectId);
      if (!project || project.origin !== origin) throw new ApplicationError(403, 'Website origin is not registered for this project.');
      return project;
    },
    async submit(projectId: string, origin: string | null, input: unknown) {
      await this.website(projectId, origin);
      const value = validateSubmission(input);
      if (value.recording.projectId !== projectId || value.recording.initialUrl.origin !== origin) throw new ApplicationError(422, 'Recording does not match the registered website.');
      const canonical = JSON.stringify(value), bytes = new TextEncoder().encode(canonical).byteLength;
      if (bytes > MAX_SUBMISSION_BYTES) throw new ApplicationError(413, 'Report exceeds the 5 MB limit.');
      return repository.insert(value, createHash('sha256').update(canonical).digest('hex'), bytes);
    },
    list(subject: string | null, projectId: string, query?: ReportQuery) { return repository.list(owner(subject, projectId), projectId,query); },
    consume(projectId:string){return repository.consume(projectId);},
    async update(subject:string|null,projectId:string,reportId:string,input:unknown){
      const ownerId=owner(subject,projectId,reportId);let changes;
      try{changes=reportChanges(input);}catch(error){throw new ApplicationError(422,(error as Error).message);}
      const row=await repository.update(ownerId,projectId,reportId,changes);
      if(row)return {report:row};
      if(!await repository.detail(ownerId,projectId,reportId))throw new ApplicationError(404,'Report not found.');
      throw new ApplicationError(409,'This report changed in another tab. Reload its saved details before saving again.');
    },
    async assertOwned(subject: string | null, projectId: string, reportId: string) {
      const isOwned = await repository.assertOwned(owner(subject, projectId, reportId), projectId, reportId);
      if (!isOwned) throw new ApplicationError(404, 'Report not found.');
    },
    async detail(subject: string | null, projectId: string, reportId: string) {
      const row = await repository.detail(owner(subject, projectId, reportId), projectId, reportId);
      if (!row) throw new ApplicationError(404, 'Report not found.'); return row;
    },
    async planContext(subject: string | null, projectId: string, reportId: string) {
      const row = await repository.planContext(owner(subject, projectId, reportId), projectId, reportId);
      if (!row) throw new ApplicationError(404, 'Report not found.'); return row;
    },
    async replay(subject: string | null, projectId: string, reportId: string) {
      const row = await repository.replay(owner(subject, projectId, reportId), projectId, reportId);
      if (!row) throw new ApplicationError(404, 'Report not found.'); return row;
    },
    async remove(subject: string | null, projectId: string, reportId: string) {
      if (!await repository.remove(owner(subject, projectId, reportId), projectId, reportId)) throw new ApplicationError(404, 'Report not found.');
    },
  };
}
