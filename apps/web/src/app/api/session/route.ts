import { auth } from '@clerk/nextjs/server';
import { authConfigured } from '@/server/auth';

/** Public navigation hint only. Private routes enforce their own authorization. */
export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
  if (!authConfigured()) return Response.json({ signedIn: false }, { headers });
  try {
    const { userId } = await auth();
    return Response.json({ signedIn: Boolean(userId) }, { headers });
  } catch {
    return Response.json({ error: 'Session unavailable' }, { status: 503, headers });
  }
}
