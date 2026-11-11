import { requireDeveloper } from '@/server/auth';
import { exportPlan } from '@/server/reports/plans';
import { errorResponse } from '@/server/http';
import { ApplicationError } from '@/server/errors';
export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ projectId: string; reportId: string }> }) {
  try { const owner = await requireDeveloper(), { projectId, reportId } = await params;
    const mode = new URL(request.url).searchParams.get('mode') ?? 'regression';
    if (mode !== 'reproduction' && mode !== 'regression') throw new ApplicationError(422, 'Choose reproduction or regression export.');
    return new Response(await exportPlan(owner, projectId, reportId, mode), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': `attachment; filename="unravel-${reportId}-${mode}.spec.ts"`, 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
