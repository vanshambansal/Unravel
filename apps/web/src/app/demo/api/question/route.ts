/** Intentional demo-only failure. Never parse, store or log the submitted body. */
export function POST() {
  return Response.json(
    { error: 'Intentional demonstration failure' },
    { status: 500, headers: { 'Cache-Control': 'no-store' } },
  );
}
