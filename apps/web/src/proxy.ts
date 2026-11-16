import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { clerkKeysHaveValidFormat } from './features/authentication/configuration';

const authenticate = clerkMiddleware();
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Missing configuration never enables a keyless/claimable app or bypasses services.
  if (
    !clerkKeysHaveValidFormat(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      process.env.CLERK_SECRET_KEY,
    )
  )
    return NextResponse.next();
  return authenticate(request, event);
}
export const config = {
  matcher: [
    '/app(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/projects(.*)',
    '/api/session',
    '/api/demo(.*)',
    '/demo/session',
  ],
};
