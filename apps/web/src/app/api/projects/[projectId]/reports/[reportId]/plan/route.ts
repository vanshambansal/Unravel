import { requireDeveloper } from '@/server/auth';
import { readPlan, savePlan } from '@/server/reports/plans';
import { boundedJson, errorResponse } from '@/server/http';
import { ApplicationError } from '@/server/errors';
export const runtime = 'nodejs';
type Context = { params: Promise<{ projectId: string; reportId: string }> };
export async function GET(_request: Request, { params }: Context) {
  try { const owner = await requireDeveloper(), { projectId, reportId } = await params; return Response.json(await readPlan(owner, projectId, reportId), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return errorResponse(error); }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    const owner = await requireDeveloper(), { projectId, reportId } = await params;
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new ApplicationError(403, 'Save plans from the Unravel application.');
    return Response.json(await savePlan(owner, projectId, reportId, await boundedJson(request, 131072)), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
