import { timedPrivateRead } from '@/server/timed-private-read';
import { requireDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { errorResponse, projectBody } from '@/server/http';

export const runtime = 'nodejs';
export async function GET() {
  try {
    return await timedPrivateRead(async (owner, db) => ({
      projects: await projectServices(db).list(owner),
    }));
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    const owner = await requireDeveloper();
    const body = await projectBody(request);
    const project = await projectServices().create(owner, body);
    return Response.json({ project }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
