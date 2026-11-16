import { timedPrivateRead } from '@/server/timed-private-read';
import { reportServices } from '@/server/reports';
import { errorResponse } from '@/server/http';
import { assertHostedResponseFits } from '@/server/hosting-limits';
export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string; reportId: string }> },
) {
  try {
    const { projectId, reportId } = await context.params;
    const response = await timedPrivateRead((owner, db) =>
      reportServices(db).replay(owner, projectId, reportId),
    );
    const text = await response.text();
    assertHostedResponseFits(text);
    return new Response(text, { status: response.status, headers: response.headers });
  } catch (error) {
    return errorResponse(error);
  }
}
