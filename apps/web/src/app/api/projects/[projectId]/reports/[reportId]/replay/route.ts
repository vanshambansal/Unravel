import { requireDeveloper } from '@/server/auth';
import { reportServices } from '@/server/reports';
import { errorResponse } from '@/server/http';
export async function GET(_request: Request, context: { params: Promise<{ projectId: string; reportId: string }> }) {
  try { const owner = await requireDeveloper(); const { projectId, reportId } = await context.params; return Response.json(await reportServices().replay(owner, projectId, reportId), { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }); }
  catch (error) { return errorResponse(error); }
}
