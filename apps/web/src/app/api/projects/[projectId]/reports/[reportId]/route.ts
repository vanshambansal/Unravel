import { timedPrivateRead } from '@/server/timed-private-read';
import { requireDeveloper } from '@/server/auth';
import { reportServices } from '@/server/reports';
import { errorResponse, projectBody, appOrigin } from '@/server/http';
import { ApplicationError } from '@/server/errors';
type Context = { params: Promise<{ projectId: string; reportId: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const { projectId, reportId } = await context.params;
    return await timedPrivateRead((owner, db) => reportServices(db).detail(owner, projectId, reportId));
  }
  catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const owner = await requireDeveloper();
    if (request.headers.get('origin') !== appOrigin(request)) throw new ApplicationError(403, 'Delete from the Unravel application.');
    const { projectId, reportId } = await context.params; await reportServices().remove(owner, projectId, reportId);
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request:Request,context:Context){
  try{const owner=await requireDeveloper();const {projectId,reportId}=await context.params;return Response.json(await reportServices().update(owner,projectId,reportId,await projectBody(request)),{headers:{'Cache-Control':'no-store'}});}catch(error){return errorResponse(error);}
}
