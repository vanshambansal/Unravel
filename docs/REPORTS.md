# Local report ingestion and replay

Milestone 4 uses the existing Clerk/Neon projects. See PROJECT_STATUS.md for actual verification; this document describes behavior and operation, not test results.

## Run locally

From the repository root, use separate terminals:

```powershell
# Application: http://localhost:3000
corepack pnpm dev
```

```powershell
# Isolated player: http://127.0.0.1:4192
corepack pnpm replay:dev
```

```powershell
# Independent website: use its printed URL; configured example http://127.0.0.1:4184
corepack pnpm build:packages
node fixtures/test-site/server.mjs
```

Use localhost for the dashboard. The player intentionally uses 127.0.0.1 on another port/origin. Its server has no Clerk/Neon configuration, report-fetch endpoint or credential-file access. It serves only its HTML and trusted compiled JS/CSS. Stop each terminal with Ctrl+C. Rebuild/restart the player after changing its source; it loads the trusted build at startup.

1. Sign in to Unravel and create a project with the fixture's exact origin, including its port.
2. Open the project's SDK setup. As the developer, set the public project ID and Unravel origin in fixtures/test-site/.env.local and restart the fixture (see its README). Question desk's bare URL shows Report a bug automatically; visitors never configure it. Real applications mount the widget with those values in code.
3. Open the widget and Start recording explicitly. Minimize it to the Stop dock, enter synthetic question/category values, submit the form for its intentional HTTP 500, and optionally trigger the separate JavaScript error.
4. Stop, reopen the widget, enter a title/optional description (no secrets), then Send bug report. Visitors need no account. A failed response can already represent a saved report: Retry preserves the same details/recording and returns one report.
5. In Unravel, Open reports and investigate. V2 provides replay, evidence filters and readable selected-event details. Drag the desktop divider or focus it and use arrow/Home/End keys; narrow screens stack the panels. Network response time precedes later feedback; inspect the later state for that feedback. Fit returns the replay area to view. The Reproduction & test plan tab supports review, persisted edits and validated Playwright export; see TEST_PLANS.md.
6. Owner deletion requires a confirmation and removes the metadata, replay and timeline. Local Discard/reload does not delete a saved report. Reports otherwise have no automatic expiry during development. Provider backups have their own retention; application row deletion does not promise instant backup erasure.

If the default fixture port is occupied, set FIXTURE_PORT in its terminal and register that actual origin. Do not kill an unrelated process. The fixture retains the question after its intentional failure; this endpoint has not been fixed yet.

## Data and trust boundaries

- SDK capture is local until a separate explicit submit call. Requests omit credentials. A public project UUID is an identifier, not an ingestion secret.
- POST /api/ingest/[projectId] and its preflight check the exact registered browser Origin/project. Streaming JSON reads enforce a 5,000,000-byte complete-request cap, independently of Content-Length. Compression is unsupported. CORS is browser policy, not authentication; non-browser callers can forge Origin.
- Server validation checks version, bounded nesting/events/duration, required full snapshot and the supported inert rrweb subset. Unknown active attributes/sources are rejected; recorded stylesheet references are removed even if the SDK opted them in. The SDK is not trusted to certify payload safety or consent. Do not log raw submissions.
- Metadata and immutable replay/semantic payloads are stored separately in PostgreSQL in one transaction. List queries do not select payloads. Project plus recording UUID is the idempotency key; canonical content is hashed. Identical retries return the same server report ID; different content with that key conflicts.
- Every private list/detail/replay/delete operation authenticates the developer and constrains the project owner. Replay data is fetched separately, with no-store responses. Anonymous visitors cannot read reports. The service never fetches submitted website/resource URLs.
- Owner deletion physically deletes report rows and cascades to their payload. Re-submitting a recording after deletion can create a new report; there is no retained content/tombstone-based suppression after deletion.

## Why the separate replay origin exists

rrweb must manipulate its script-disabled inner iframe. An opaque-origin outer sandbox prevented that access. The earlier proposal to combine script and same-origin permissions on the dashboard's own origin was rejected and reverted.

The user explicitly approved the local separate-origin host. The trusted player frame receives allow-scripts/allow-same-origin only on that different origin. It cannot access the dashboard DOM; the actual recorded-document iframe has allow-same-origin alone, with scripts/forms disabled. Recorded scripts, image/resource URLs, inline active attributes and external stylesheets are not accepted into the supported replay representation. CSP additionally blocks image/font/media/fetch requests and forms. Only the host's own trusted JS/CSS may load.

The player checks event.source and an exact allowed parent origin. The dashboard checks source, player origin and a per-mount channel. Payload/control messages target explicit origins. CSP frame-ancestors limits embedding to configured dashboard origins. No wildcard origins, cookie-based player authentication, arbitrary HTML import or private API fetch runs in the host.

This is masked bounded replay, not pixel-perfect reconstruction: classes, arbitrary attributes, original CSS bodies/images/fonts, canvas, scripts, Shadow DOM and complex widgets remain unsupported. New presentation-v1 recordings preserve bounded computed styles; legacy recordings do not. Redaction preserves ASCII whitespace for readability, without exposing masked page content. The UI states the fidelity limitation and displays partial-recording status when applicable. Failed/unavailable playback leaves the private timeline accessible.

## Configuration and verification

Defaults: app localhost:3000; player 127.0.0.1:4192; fixture 127.0.0.1:4173. For another approved local app port, set server-side REPLAY_ORIGIN for Next and REPLAY_PORT / REPLAY_PARENT_ORIGINS for the player. Parent origins are comma-separated exact localhost HTTP origins. These are public local addresses, not secrets. Never point REPLAY_ORIGIN at the dashboard origin.

Do not use 4190: Fetch/browser port blocking rejects it even though Node can listen there. The default 4192 was verified through the actual production browser/restart workflow.

`corepack pnpm test:reports` builds the SDK/player and starts its own app (3015), fixture (4185) and player (4191). Stop another apps/web dev instance first. It uses the existing approved synthetic Clerk users and development database; it retains E2E-labelled rows/restart-proof reports, without saving auth state/traces. REPORTS_BASE_URL can target a running preview that uses REPLAY_ORIGIN=http://127.0.0.1:4191. Database integration tests use only the separately configured test database and clean their own rows.

For the explicit restart proof, first run the report suite to retain a synthetic report, actually stop/restart the application, and start its configured isolated player. Set REPORTS_BASE_URL to that running application and run `corepack pnpm test:report-restart`. This separate test starts no server and creates no replacement report; it reopens the retained ID in a fresh authenticated session and records the actual app/player origins in the ignored proof file.

Public deployment remains out of scope. A genuinely separate trusted replay origin, HTTPS/cookie policy, upload/abuse controls, domain/provider setup, retention/privacy review and hosting-specific limits must be reviewed before release. The current loopback binding/URL checks are a local-development boundary, not a complete reverse-proxy or public-ingestion security design. No deployment provider or paid service is selected here.

Plan persistence and private export are owned by TEST_PLANS.md. The player origin remains isolated; inline presentation does not authorize original stylesheet/image/font requests. Reload the fixture to load the new SDK and make a fresh recording for styled playback.
