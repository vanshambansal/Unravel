import { ApplicationError } from './errors.ts';

export function errorResponse(error: unknown) {
  const known = error instanceof ApplicationError;
  return Response.json({ error: known ? error.message : 'Unable to complete this request. Please try again.', ...(known && error.fields ? { fields: error.fields } : {}) }, {
    status: known ? error.status : 503, headers: { 'Cache-Control': 'no-store' },
  });
}
export async function projectBody(request: Request): Promise<unknown> {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new ApplicationError(403, 'Submit this form from the Unravel application.');
  return boundedJson(request, 8192);
}
export async function boundedJson(request: Request, maxBytes: number): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new ApplicationError(415, 'Send a JSON request.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApplicationError(400, 'The request body is missing.');
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); throw new ApplicationError(413, 'The request exceeds the permitted size.'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    try { return JSON.parse(new TextDecoder().decode(bytes)); }
    catch { throw new ApplicationError(400, 'The request contains invalid JSON.'); }
  } finally { reader.releaseLock(); }
}
