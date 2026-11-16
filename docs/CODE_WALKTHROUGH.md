# Code walkthrough

Owner: engineering explanation. Start here when demonstrating the implementation; [PROJECT_STATUS.md](PROJECT_STATUS.md) owns verified results and limitations.

## The short route through the code

| Open this file | Explain this decision |
| --- | --- |
| `apps/web/src/app/(product)/app/layout.tsx` | Authenticate once at the workspace boundary, share the project query across navigation, and stream slower sections without rebuilding the entire shell. |
| `apps/web/src/features/projects/SdkSetup.tsx` | Give integrators one public package and a root-level browser lifecycle. The project ID identifies the destination; it is not a secret. |
| `packages/sdk/src/index.ts` | Small public API: complete widget or low-level recorder. Importing the module does not start capture. |
| `packages/sdk/src/widget.ts` | Visitor interaction state: choose mode, start, minimize, stop, describe, submit/retry. Shadow DOM keeps host styling out. |
| `packages/sdk/src/recorder.ts` | Coordinate lifecycle, DOM replay events, semantic events, time/size limits and cleanup. Cancelled async work must not restart recording. |
| `packages/sdk/src/events.ts`, `network.ts` | Record readable actions, errors, navigation and fetch/XHR metadata. Instrumentation forwards original behavior and only restores functions it still owns. |
| `packages/sdk/src/privacy.ts`, `replay.ts`, `presentation.ts` | Mask field values according to the chosen mode while preserving supported structure/styles. Ordinary displayed page text stays visible. |
| `packages/sdk/src/submission.ts` | Freeze the first submission envelope. Retrying reuses the same recording identity and evidence. |
| `apps/web/src/app/api/ingest/[projectId]/route.ts` | Thin HTTP boundary for origin checks, bounded input and structured responses. |
| `apps/web/src/server/reports/validation.ts`, `service.ts`, `repository.ts` | Independently validate untrusted SDK input, enforce policy, and transactionally persist evidence. Ownership belongs in every private query, not just in the UI. |
| `apps/web/src/features/reports/ReportViewer.tsx` | Coordinate timeline, playback and seeking. The dashboard does not execute recorded documents. |
| `scripts/replay-host.mjs`, `apps/web/src/features/reports/replay-origin.ts` | Serve a trusted player on a separate origin and validate the bridge. The inner recorded document cannot run scripts or submit forms. |
| `packages/test-plan/src/normalization.ts`, `schema.ts`, `validation.ts` | Convert immutable observations into a constrained, editable plan. Fold duplicate actions without rewriting original evidence. |
| `packages/test-plan/src/descriptions.ts`, `playwright.ts` | Produce readable steps and Playwright code. Expected correctness must come from the developer, not the observed failure. |

## A useful interview explanation

“Unravel has two evidence streams: DOM changes for replay and semantic events for actions and diagnostics. The SDK records only after explicit Start. The server treats that payload as untrusted, validates it and stores it separately from list metadata. Retrying the same recording is idempotent. The dashboard retrieves owner-authorized evidence and sends replay to an isolated player. A deterministic generator turns actions into a reviewed test plan; the developer supplies safe inputs and intended assertions before exporting Playwright.”

Be ready to explain why an HTTP 500 is evidence of failure, why CORS is not authentication, why DOM replay is not video, and why structural selectors may need review after markup changes. [SDK](SDK.md), [reports](REPORTS.md) and [test plans](TEST_PLANS.md) contain the details.

## The hosted demo implementation

- `/demo`: `features/demo/DemoHub.tsx` reuses the signed-in owner's project for the current origin, or creates one only after a button click.
- `/demo/next`: an ordinary Next route renders `ScenarioSite.tsx`.
- `/demo/react`: a Route Handler serves a plain document. `examples/browser-demo/src/main.tsx` mounts React without any Next runtime; `scripts/build-browser-demo.mjs` builds its assets.
- `DemoRecorder.tsx` imports the npm release through the explicit `@unravel/published-sdk` alias. It checks project ownership/origin through existing private APIs and destroys capture on exit. Public example controls work without a recording project.
- `/demo/api/question`: intentionally returns 500 without reading, storing or logging the request body. Bugs and synthetic values are clearly labelled.

The two demos share ordinary React presentation so fixes do not drift, while their runtime entry points differ. Independent manual examples and automated external consumers still test installation outside the main app.

## Formatting and comments

Run `corepack pnpm format` before review; CI checks the same maintained source with `format:check`. Application routes, server modules, UI, landing source, SDK, generator and example source are included. The retained prototype and historical material are excluded. Generated minified demo assets stay ignored.

Comments explain trust boundaries, cancellation, privacy, retries and non-obvious rendering decisions. Avoid narrating obvious JSX or introducing abstractions just to shorten a file. Follow one request through the modules above rather than memorizing every implementation line.
