import { requireDeveloper } from '@/server/auth';
import { readPlan, savePlan } from '@/server/reports/plans';
import { boundedJson, errorResponse, appOrigin } from '@/server/http';
import { ApplicationError } from '@/server/errors';
export const runtime = 'nodejs';
type Context = { params: Promise<{ projectId: string; reportId: string }> };
export async function GET(_request: Request, { params }: Context) {
  try {
    const start = performance.now(),
      owner = await requireDeveloper(),
      { projectId, reportId } = await params;
    const metrics = [`auth;dur=${(performance.now() - start).toFixed(1)}`];
    const plan = await readPlan(owner, projectId, reportId, (name, ms) =>
      metrics.push(`${name};dur=${ms.toFixed(1)}`),
    );
    // Numeric timings only: no identities, queries, evidence or provider errors.
    return Response.json(plan, {
      headers: { 'Cache-Control': 'no-store', 'Server-Timing': metrics.join(', ') },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    const owner = await requireDeveloper(),
      { projectId, reportId } = await params;
    if (request.headers.get('origin') !== appOrigin(request))
      throw new ApplicationError(403, 'Save plans from the Unravel application.');
    return Response.json(
      await savePlan(owner, projectId, reportId, await boundedJson(request, 131072)),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
