import { requireDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { reportServices } from '@/server/reports';
import { errorResponse } from '@/server/http';
export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  try { const owner = await requireDeveloper(); const { projectId } = await context.params; await projectServices().get(owner, projectId); return Response.json({ reports: await reportServices().list(owner, projectId) }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return errorResponse(error); }
}
