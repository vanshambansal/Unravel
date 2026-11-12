import { ApplicationError } from './errors.ts';

export function errorResponse(error: unknown) {
  const known = error instanceof ApplicationError;
  return Response.json({ error: known ? error.message : 'Unable to complete this request. Please try again.', ...(known && error.fields ? { fields: error.fields } : {}) }, {
    status: known ? error.status : 503, headers: { 'Cache-Control': 'no-store', ...(known&&error.status===429?{'Retry-After':'60'}:{}) },
  });
}
export function appOrigin(request:Request){
  const configured=process.env.APP_ORIGIN;
  if(!configured)return new URL(request.url).origin;
  try{const url=new URL(configured);if(url.origin!==configured||!['http:','https:'].includes(url.protocol))throw Error();return configured;}catch{throw new ApplicationError(503,'The application origin is not configured correctly.');}
}
export async function projectBody(request: Request): Promise<unknown> {
  if (request.headers.get('origin') !== appOrigin(request)) throw new ApplicationError(403, 'Submit this form from the Unravel application.');
  return boundedJson(request, 8192);
}
export async function boundedJson(request: Request, maxBytes: number, timeoutMs=15000): Promise<unknown> {
  const text=await boundedText(request,maxBytes,timeoutMs);
  try{return JSON.parse(text);}catch{throw new ApplicationError(400,'The request contains invalid JSON.');}
}
export async function boundedText(request: Request, maxBytes: number, timeoutMs=15000): Promise<string> {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new ApplicationError(415, 'Send a JSON request.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApplicationError(400, 'The request body is missing.');
  const chunks: Uint8Array[] = []; let length = 0;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(new ApplicationError(408,'The upload took too long. Keep the recording and retry.'));void reader.cancel().catch(()=>{});},timeoutMs);});
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(),deadline]); if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); throw new ApplicationError(413, 'The request exceeds the permitted size.'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    try { return new TextDecoder('utf-8',{fatal:true}).decode(bytes); }
    catch { throw new ApplicationError(400, 'The request contains invalid UTF-8.'); }
  } finally { clearTimeout(timer); reader.releaseLock(); }
}
