import 'server-only';
import { and, eq } from 'drizzle-orm';
import { TestPlanSchema, generatePlan, exportPlaywright, planIssues, type ExportMode } from '@unravel/test-plan';
import { database } from '../db/connection';
import { reportTestPlans } from '../db/schema';
import { reportServices } from './index';
import { ApplicationError } from '../errors';

export async function readPlan(owner: string, projectId: string, reportId: string, timing?: (name: 'evidence'|'draft'|'generation', ms: number) => void) {
  const started=performance.now();
  const { report, events } = await reportServices().detail(owner, projectId, reportId);
  const evidence=performance.now();timing?.('evidence',evidence-started);
  const [saved] = await database().select().from(reportTestPlans).where(eq(reportTestPlans.reportId, reportId));
  const draft=performance.now();timing?.('draft',draft-evidence);
  const generated = generatePlan({ initialUrl: report.recording.initialUrl, events });
  timing?.('generation',performance.now()-draft);
  return { plan: saved ? TestPlanSchema.parse(saved.plan) : generated, revision: saved?.revision ?? 0, updatedAt: saved?.updatedAt ?? null, generated, targetOrigin: report.recording.initialUrl.origin };
}
export async function savePlan(owner: string, projectId: string, reportId: string, input: unknown) {
  await reportServices().detail(owner, projectId, reportId);
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const parsed = TestPlanSchema.safeParse(data.plan);
  if (!parsed.success || !Number.isInteger(data.revision) || Number(data.revision) < 0 || Number(data.revision) > 1e9) throw new ApplicationError(422, 'Provide a valid versioned test plan and revision.');
  const revision = Number(data.revision), db = database();
  const rows = revision === 0 ? await db.insert(reportTestPlans).values({ reportId, plan: parsed.data }).onConflictDoNothing().returning()
    : await db.update(reportTestPlans).set({ plan: parsed.data, revision: revision + 1, updatedAt: new Date() }).where(and(eq(reportTestPlans.reportId, reportId), eq(reportTestPlans.revision, revision))).returning();
  if (!rows.length) throw new ApplicationError(409, 'This plan changed in another tab. Reload the saved version before saving again.');
  return { plan: rows[0].plan, revision: rows[0].revision, updatedAt: rows[0].updatedAt };
}
export async function exportPlan(owner: string, projectId: string, reportId: string, mode: ExportMode = 'regression') {
  const saved = await readPlan(owner, projectId, reportId);
  if (!saved.revision) throw new ApplicationError(422, 'Save and validate the plan before exporting.');
  const issues = planIssues(saved.plan, mode);
  if (issues.length) throw new ApplicationError(422, issues.join(' '));
  return exportPlaywright(saved.plan, mode);
}
