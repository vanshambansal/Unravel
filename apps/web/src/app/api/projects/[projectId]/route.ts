import { requireDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { errorResponse } from '@/server/http';

export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const owner = await requireDeveloper();
    return Response.json({ project: await projectServices().get(owner, (await params).projectId) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
