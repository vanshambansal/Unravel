import { timedPrivateRead } from '@/server/timed-private-read';
import { projectServices } from '@/server/projects';
import { reportServices } from '@/server/reports';
import { reportQuery } from '@/features/reports/management';
import { ApplicationError } from '@/server/errors';
import { errorResponse } from '@/server/http';
export async function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await context.params;
    return await timedPrivateRead(async (owner, db) => {
      await projectServices(db).get(owner, projectId);
      let query;
      try { query = reportQuery(Object.fromEntries(new URL(request.url).searchParams)); }
      catch (error) { throw new ApplicationError(400, (error as Error).message); }
      return reportServices(db).list(owner, projectId, query);
    });
  }
  catch (error) { return errorResponse(error); }
}
