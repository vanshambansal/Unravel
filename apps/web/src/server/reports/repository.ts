import { and, desc, eq, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { projects, reports, reportPayloads, type Report } from '../db/schema.ts';
import type * as schema from '../db/schema.ts';
import type { ReportSubmission } from '@unravel/contracts';
import { ApplicationError } from '../errors.ts';

export function reportRepository(db: NodePgDatabase<typeof schema>) {
  const owned = (ownerId: string, projectId: string) => and(eq(projects.ownerId, ownerId), eq(reports.projectId, projectId));
  return {
    async publicProject(id: string) { const [project] = await db.select({ id: projects.id, origin: projects.origin }).from(projects).where(eq(projects.id, id)).limit(1); return project; },
    async insert(input: ReportSubmission, digest: string, bytes: number) {
      return db.transaction(async tx => {
        const { replay, events, ...recording } = input.recording;
        const [created] = await tx.insert(reports).values({ projectId: recording.projectId, recordingId: recording.id, title: input.title, description: input.description, digest, bytes, eventCount: replay.length + events.length, recording }).onConflictDoNothing({ target: [reports.projectId, reports.recordingId] }).returning({ id: reports.id });
        if (created) {
          await tx.insert(reportPayloads).values({ reportId: created.id, replay, events });
          return { reportId: created.id, duplicate: false };
        }
        const [previous] = await tx.select({ id: reports.id, digest: reports.digest }).from(reports).where(and(eq(reports.projectId, recording.projectId), eq(reports.recordingId, recording.id))).limit(1);
        if (!previous) throw new ApplicationError(503, 'Retry this submission.');
        if (previous.digest !== digest) throw new ApplicationError(409, 'This recording ID already has different submitted content.');
        return { reportId: previous.id, duplicate: true };
      });
    },
    list(ownerId: string, projectId: string) {
      return db.select({ id: reports.id, title: reports.title, createdAt: reports.createdAt, recording: reports.recording, bytes: reports.bytes, eventCount: reports.eventCount }).from(reports).innerJoin(projects, eq(projects.id, reports.projectId)).where(owned(ownerId, projectId)).orderBy(desc(reports.createdAt), desc(reports.id)).limit(100);
    },
    async detail(ownerId: string, projectId: string, reportId: string) {
      const [row] = await db.select({ report: reports, events: reportPayloads.events }).from(reports).innerJoin(projects, eq(projects.id, reports.projectId)).innerJoin(reportPayloads, eq(reportPayloads.reportId, reports.id)).where(and(owned(ownerId, projectId), eq(reports.id, reportId))).limit(1);
      return row;
    },
    async replay(ownerId: string, projectId: string, reportId: string) {
      const [row] = await db.select({ replay: reportPayloads.replay }).from(reportPayloads).innerJoin(reports, eq(reports.id, reportPayloads.reportId)).innerJoin(projects, eq(projects.id, reports.projectId)).where(and(owned(ownerId, projectId), eq(reports.id, reportId))).limit(1);
      return row;
    },
    async remove(ownerId: string, projectId: string, reportId: string): Promise<boolean> {
      const ownerProjects = db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)));
      const removed: Pick<Report, 'id'>[] = await db.delete(reports).where(and(eq(reports.id, reportId), eq(reports.projectId, projectId), inArray(reports.projectId, ownerProjects))).returning({ id: reports.id });
      return removed.length === 1;
    },
  };
}
export type ReportRepository = ReturnType<typeof reportRepository>;
