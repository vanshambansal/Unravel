import {ingestionAllowed} from '@/server/release';
import { MAX_SUBMISSION_BYTES } from '@unravel/contracts';
import { reportServices } from '@/server/reports';
import { boundedJson, errorResponse } from '@/server/http';
import { ApplicationError } from '@/server/errors';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ projectId: string }> };

// This endpoint intentionally fails closed outside loopback. CORS is not authentication.
function local(request: Request) {
  const configured=process.env.APP_ORIGIN;
  const canonical=process.env.PUBLIC_INGESTION_ENABLED==='true'&&configured&&request.headers.get('host')===new URL(configured).host?configured+new URL(request.url).pathname:request.url;
  if (!ingestionAllowed(canonical)) throw new ApplicationError(503, 'Report ingestion is disabled until the release configuration and security review are complete.');
}
const cors = (origin: string) => ({ 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '0', Vary: 'Origin', 'Cache-Control': 'no-store' });
export async function OPTIONS(request: Request, context: Context) {
  try {
    local(request); const { projectId } = await context.params;
    await reportServices().website(projectId, request.headers.get('origin'));
    if (request.headers.get('access-control-request-method') !== 'POST' || (request.headers.get('access-control-request-headers') ?? '').split(',').some(header => header.trim() && header.trim().toLowerCase() !== 'content-type')) throw new ApplicationError(403, 'Unsupported preflight request.');
    return new Response(null, { status: 204, headers: cors(request.headers.get('origin')!) });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request, context: Context) {
  let allowed: string | null = null;
  try {
    local(request); const { projectId } = await context.params;
    await reportServices().website(projectId, request.headers.get('origin')); allowed = request.headers.get('origin');
    await reportServices().consume(projectId);
    if (request.headers.get('content-encoding') && request.headers.get('content-encoding') !== 'identity') throw new ApplicationError(415, 'Compressed submissions are unsupported.');
    const input = await boundedJson(request, MAX_SUBMISSION_BYTES);
    const receipt = await reportServices().submit(projectId, allowed, input);
    return Response.json(receipt, { status: receipt.duplicate ? 200 : 201, headers: cors(allowed!) });
  } catch (error) {
    const response = errorResponse(error); if (allowed) for (const [key,value] of Object.entries(cors(allowed))) response.headers.set(key,value);
    return response;
  }
}
