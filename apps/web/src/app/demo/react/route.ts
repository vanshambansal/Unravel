/** Serve a standalone React document; this route has no Next/React server-rendered UI. */
export function GET() {
  return new Response(
    '<!doctype html><html lang="en" class="demo-document"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>React SDK demo | Unravel</title><link rel="stylesheet" href="/demo-assets/react.css"></head><body><div id="root"></div><script defer src="/demo-assets/react.js"></script></body></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}
