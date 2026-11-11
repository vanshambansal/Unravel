// Never host replay on the authenticated application's origin.
export function GET() {
  return new Response('Use the separately configured isolated replay host.', { status: 410, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' } });
}
