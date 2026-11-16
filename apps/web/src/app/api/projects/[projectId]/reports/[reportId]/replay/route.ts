import { timedPrivateRead } from '@/server/timed-private-read';
import { reportServices } from '@/server/reports';
import { errorResponse } from '@/server/http';
export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string; reportId: string }> },
) {
  try {
    const { projectId, reportId } = await context.params;
    return await timedPrivateRead((owner, db) =>
      reportServices(db).replay(owner, projectId, reportId),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
