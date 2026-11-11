import { requireDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { errorResponse, projectBody } from '@/server/http';

export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const owner = await requireDeveloper();
    return Response.json({ project: await projectServices().get(owner, (await params).projectId) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const owner = await requireDeveloper();
    const input = await projectBody(request);
    return Response.json({ project: await projectServices().update(owner, (await params).projectId, input) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const owner = await requireDeveloper();
    const input = await projectBody(request);
    await projectServices().remove(owner, (await params).projectId, input);
    return new Response(null, { status: 204 });
  } catch (error) { return errorResponse(error); }
}
