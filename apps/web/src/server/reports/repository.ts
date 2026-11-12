import { and, desc, eq, inArray, ilike, or, count, sql, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { projects, reports, reportPayloads, ingestionBudgets, accountIntakeBlocks, type Report } from '../db/schema.ts';
import type * as schema from '../db/schema.ts';
import type { ReportSubmission } from '@unravel/contracts';
import { REPORT_PAGE_SIZE, type ReportQuery, type ReportStatus } from '../../features/reports/management.ts';
import { ApplicationError } from '../errors.ts';

export function reportRepository(db: NodePgDatabase<typeof schema>) {
  const owned = (ownerId: string, projectId: string) => and(eq(projects.ownerId, ownerId), eq(reports.projectId, projectId));
  return {
    async publicProject(id: string) { const [project] = await db.select({ id: projects.id, origin: projects.origin }).from(projects).leftJoin(accountIntakeBlocks,eq(accountIntakeBlocks.ownerId,projects.ownerId)).where(and(eq(projects.id,id),isNull(accountIntakeBlocks.ownerId))).limit(1); return project; },
    async insert(input: ReportSubmission, digest: string, bytes: number) {
      return db.transaction(async tx => {
        const { replay, events, ...recording } = input.recording;
        const [project]=await tx.select({id:projects.id,origin:projects.origin,ownerId:projects.ownerId}).from(projects).where(eq(projects.id,recording.projectId)).for('update');
        const [closed]=project?await tx.select({id:accountIntakeBlocks.ownerId}).from(accountIntakeBlocks).where(eq(accountIntakeBlocks.ownerId,project.ownerId)).limit(1):[];
        if(!project||closed||project.origin!==recording.initialUrl.origin)throw new ApplicationError(403,'Website registration changed. Ask the developer to check SDK setup.');
        const [existing]=await tx.select({id:reports.id,digest:reports.digest}).from(reports).where(and(eq(reports.projectId,recording.projectId),eq(reports.recordingId,recording.id))).limit(1);
        if(existing){if(existing.digest!==digest)throw new ApplicationError(409,'This recording ID already has different submitted content.');return {reportId:existing.id,duplicate:true};}
        const [usage]=await tx.select({bytes:sql<number>`coalesce(sum(${reports.bytes}),0)::float8`,count:count()}).from(reports).where(eq(reports.projectId,recording.projectId));
        if(usage.count>=1000||usage.bytes+bytes>100_000_000)throw new ApplicationError(429,'This project has reached its report storage limit. The owner must delete reports before accepting more.');
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
    async list(ownerId: string, projectId: string, query: ReportQuery = {q:'',status:'all',page:1}) {
      // One statement gives count, clamped page and rows the same MVCC snapshot,
      // without BEGIN/count/rows/COMMIT network round trips to remote PostgreSQL.
      const escaped = query.q.replace(/[\\%_]/g, value => `\\${value}`);
      const where=and(owned(ownerId,projectId),query.status==='all'?undefined:eq(reports.status,query.status),query.q?or(ilike(reports.title,`%${escaped}%`),ilike(reports.description,`%${escaped}%`)):undefined);
      const totals=db.select({total:sql<number>`count(*)::int`.as('total')}).from(reports).innerJoin(projects,eq(projects.id,reports.projectId)).where(where);
      const rows=db.select({id:reports.id,title:reports.title,description:reports.description,status:reports.status,revision:reports.revision,createdAt:sql<Date>`${reports.createdAt}`.as('createdAt'),recording:reports.recording,bytes:reports.bytes,eventCount:sql<number>`${reports.eventCount}`.as('eventCount')}).from(reports).innerJoin(projects,eq(projects.id,reports.projectId)).where(where).orderBy(desc(reports.createdAt),desc(reports.id)).limit(REPORT_PAGE_SIZE);
      const pageRows=sql`${rows.getSQL()} offset (least(${query.page},greatest(1,ceil(totals.total::numeric / ${REPORT_PAGE_SIZE}))) - 1)::int * ${REPORT_PAGE_SIZE}`;
      type Row=Pick<Report,'id'|'title'|'description'|'status'|'revision'|'createdAt'|'recording'|'bytes'|'eventCount'>;
      const result=await db.execute<Omit<Row,'id'|'createdAt'> & {id:string|null;createdAt:Date|string;total:number}>(sql`select totals.total, selected.* from (${totals}) totals left join lateral (${pageRows}) selected on true`);
      const total=result.rows[0]?.total??0,pages=Math.max(1,Math.ceil(total/REPORT_PAGE_SIZE)),page=Math.min(query.page,pages);
      return {reports:result.rows.flatMap(row=>row.id===null?[]:[{id:row.id,title:row.title,description:row.description,status:row.status,revision:row.revision,createdAt:row.createdAt instanceof Date?row.createdAt:new Date(row.createdAt),recording:row.recording,bytes:row.bytes,eventCount:row.eventCount}]),total,page,pages,pageSize:REPORT_PAGE_SIZE};
    },
    async update(ownerId:string,projectId:string,reportId:string,input:{title:string;description:string;status:ReportStatus;revision:number}) {
      const ownerProjects=db.select({id:projects.id}).from(projects).where(and(eq(projects.id,projectId),eq(projects.ownerId,ownerId)));
      const [row]=await db.update(reports).set({title:input.title,description:input.description,status:input.status,revision:input.revision+1,updatedAt:new Date()}).where(and(eq(reports.id,reportId),eq(reports.projectId,projectId),eq(reports.revision,input.revision),inArray(reports.projectId,ownerProjects))).returning();
      return row;
    },
    async consume(projectId:string) {
      const minute=sql`date_trunc('minute', now())`,day=sql`date_trunc('day', now() at time zone 'UTC') at time zone 'UTC'`;
      const [row]=await db.insert(ingestionBudgets).values({projectId,minute,minuteCount:1,day,dayCount:1}).onConflictDoUpdate({target:ingestionBudgets.projectId,set:{minute,day,minuteCount:sql`case when ${ingestionBudgets.minute} = ${minute} then ${ingestionBudgets.minuteCount} + 1 else 1 end`,dayCount:sql`case when ${ingestionBudgets.day} = ${day} then ${ingestionBudgets.dayCount} + 1 else 1 end`},setWhere:sql`(${ingestionBudgets.minute} <> ${minute} or ${ingestionBudgets.minuteCount} < 30) and (${ingestionBudgets.day} <> ${day} or ${ingestionBudgets.dayCount} < 200)`}).returning({id:ingestionBudgets.projectId});
      if(!row)throw new ApplicationError(429,'This project has reached its submission-attempt limit. Keep your recording and retry later.');
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
