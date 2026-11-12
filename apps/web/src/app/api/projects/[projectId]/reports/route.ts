import { requireDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { reportServices } from '@/server/reports';
import { reportQuery } from '@/features/reports/management';
import { ApplicationError } from '@/server/errors';
import { errorResponse } from '@/server/http';
export async function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try { const owner = await requireDeveloper(); const { projectId } = await context.params; await projectServices().get(owner, projectId); let query;try{query=reportQuery(Object.fromEntries(new URL(request.url).searchParams));}catch(error){throw new ApplicationError(400,(error as Error).message);}return Response.json(await reportServices().list(owner, projectId,query), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return errorResponse(error); }
}
