# Isolated replay deployment

This Vercel project serves the existing trusted player as static files using the [Build Output API](https://vercel.com/docs/build-output-api). It contains no dashboard API or database/authentication credentials. The local Node replay host remains unchanged.

1. Import the same GitHub repository as a second Vercel project, named `unravel-replay` (or an available alternative).
2. Set Root Directory to `apps/replay`, Framework Preset to **Other**, and allow source files outside the root directory.
3. Use the install/build commands in `vercel.json`. Leave Output Directory unset: the build creates `.vercel/output`.
4. Add only `REPLAY_PARENT_ORIGINS`, set to the exact canonical dashboard origin, without a trailing slash. Comma-separated explicit origins are supported; wildcards are rejected. Do not copy the dashboard's secrets here.
5. Deploy and check `/health`, the generated CSP headers and dashboard embedding. The viewer homepage by itself is intentionally empty.
6. Set the dashboard's `REPLAY_ORIGIN` to the new player origin and redeploy the dashboard. Keep public ingestion disabled until all remaining release checks pass.

The trusted player executes its own JavaScript; the reconstructed document still cannot execute recorded scripts or submit forms. Parent origin/source/channel checks stay in `apps/web/src/features/reports/player-host.ts`. Changing parent origins requires rebuilding the viewer. Hosted header/embedding acceptance must be checked after deployment; a local build alone is insufficient.
