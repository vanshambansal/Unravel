import { requireDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { reportServices } from '@/server/reports';
import { boundedJson, errorResponse } from '@/server/http';
import { ApplicationError } from '@/server/errors';
import { submissionByteLimit } from '@/server/hosting-limits';

export const runtime = 'nodejs';
export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    if (process.env.PORTFOLIO_DEMO_ENABLED !== 'true')
      throw new ApplicationError(503, 'Portfolio recording is not enabled.');
    const owner = await requireDeveloper();
    const origin = process.env.APP_ORIGIN || new URL(request.url).origin;
    if (request.headers.get('origin') !== origin)
      throw new ApplicationError(403, 'Submit demo recordings from this application.');
    if (!(request.headers.get('content-type') ?? '').startsWith('application/json'))
      throw new ApplicationError(415, 'Use a JSON report.');
    if (
      request.headers.get('content-encoding') &&
      request.headers.get('content-encoding') !== 'identity'
    )
      throw new ApplicationError(415, 'Compressed submissions are unsupported.');
    const { projectId } = await context.params;
    const project = await projectServices().get(owner, projectId);
    if (project.origin !== origin)
      throw new ApplicationError(403, 'Use your demo project for this origin.');
    await reportServices().website(projectId, origin);
    await reportServices().consume(projectId);
    const input = await boundedJson(request, submissionByteLimit());
    const receipt = await reportServices().submit(projectId, origin, input);
    return Response.json(receipt, {
      status: receipt.duplicate ? 200 : 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
