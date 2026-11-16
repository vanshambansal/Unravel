# Local report ingestion and replay

Milestone 4 uses the existing Clerk/Neon projects. See PROJECT_STATUS.md for actual verification; this document describes behavior and operation, not test results.

## Run locally

From the repository root, start the dashboard and its isolated player together:

```powershell
# Application: http://localhost:3000; isolated player: http://127.0.0.1:4192
corepack pnpm dev
```

The root development command starts/checks the paired player before launching Next. It reuses an already healthy player with the expected parent; stopping the command stops only processes it owns. Do not launch another player on the same port. If Next was launched separately with an app-only command, restore the missing player with `corepack pnpm replay:dev`. `node scripts/dev-local.mjs --check` verifies the default player's availability/configuration without starting a dashboard.

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

Public deployment is not verified. Release preparation and operator gates are owned by [DEPLOYMENT.md](DEPLOYMENT.md). A genuinely separate trusted replay origin, HTTPS/cookie policy, upload/abuse controls, domain/provider setup, retention/privacy review and hosting-specific limits must be reviewed before release. The current loopback binding/URL checks are a local-development boundary, not a complete reverse-proxy or public-ingestion security design. No deployment provider or paid service is selected here.

Plan persistence and private export are owned by TEST_PLANS.md. The player origin remains isolated; inline presentation does not authorize original stylesheet/image/font requests. Reload the fixture to load the new SDK and make a fresh recording for styled playback.

## Report triage and retrieval - 2026-11-12

New and existing reports start Open. Owners may edit title/description and resolve/reopen through the report header. Cancel leaves saved metadata intact; failed saves retain input. Revision conflicts require reloading saved details explicitly. Dirty dialogs warn on full refresh/unload; bounded memory-only recovery survives local SPA navigation. Metadata revisions are separate from test-plan revisions. Original replay/events/digest remain immutable; idempotent visitor retries do not undo owner edits.

The reports list supports literal title/description search, All/Open/Resolved filters and stable 20-row pages ordered by created time then UUID. Query state stays in the URL and the report's All reports link. Count/rows use one SELECT statement snapshot (totals plus a lateral, clamped page), never replay payloads. Invalid query values are explained; no-match and initial-empty states differ. Dataset changes between page requests can shift offset boundaries; stability is verified on a fixed dataset, not a concurrent-write snapshot across navigation.

The timeline groups only adjacent fill updates of the same identified control within 1.5 seconds. Diagnostics/navigation interrupt a group. Selecting a group seeks its final update; Show every typing event restores raw per-event inspection. No recording or generated plan is rewritten by this display preference.

Reviewed additive migration 0003_workable_viper adds metadata status/revision/update time, an index and shared ingestion budgets. It contains no evidence rewrite/deletion. Local limits, upload deadlines, HTTPS replay options and public fail-closed gates are described in DEPLOYMENT.md; owner-managed retention remains unchanged pending public review.

## Account closure and inspection updates

Approved account closure rejects new intake and retains existing projects/reports/evidence. It requires a delivered, signed Clerk `user.deleted` event; local handler/tests are implemented, hosted delivery is a release gate. See SERVICE_SETUP.md for setup and DEPLOYMENT.md for operator obligations. No automatic data expiry or destructive account cascade was added.

The player caches unchanged fit calculations and omits duplicate idle time messages. Timeline grouping is memoized, and selection remains consistent when switching between raw/grouped events. Fit presents the full captured viewport;100% lets users inspect small content without pretending a desktop capture is mobile-responsive. Current latency and device limits belong to PROJECT_STATUS.md.

## Replay activity and recovery - 2026-11-13

Switching to the plan retains the isolated frame and position and pauses playback explicitly. Backgrounding pauses it as well. The clock runs during playback and stops on pause/finish/teardown. Slow initialization can recover after the initial warning. Retry creates a fresh frame/channel and aborts the old request. Recording retrieval has a60-second deadline. A loading or payload error uses recovery guidance for the configured player origin. Normal development and local production can have different paired origins. Evidence and security validation remain owned by the existing replay boundary.


## Recording mode metadata (2026-11-14)

New SDK recordings optionally include captureMode (`masked-values` or `full`), persisted with existing recording JSON. Dashboard replay labels distinguish these and legacy recordings. Full may contain sensitive field values; server password snapshot attributes are retained only for explicit full mode. The uploader's mode is a client declaration, not proof of visitor consent. Recorded scripts/resources remain blocked in every mode. [Current capture policy](SDK.md#approved-privacy-policy) owns privacy semantics. No existing recording is rewritten/unmasked.

## Action presentation and historical input timing (2026-11-14)

Evidence rows use recorded targetLabel or a label derived read-only from the sanitized initial snapshot. Dynamic historic targets may keep a generic description. Raw selectors remain in Technical locator details. Historical delayed inputs can align selected replay state to a matching node/value within two seconds, with a separate captured-state time; original event times and payloads remain unchanged. This cannot restore data masked in an earlier recording. New SDK input sampling avoids the delay. Recording-mode notice is server rendered outside the hydrated viewer.

Large evidence timelines render100 rows per page with direct page selection and previous/next controls. Filters retain complete evidence and external selection opens the matching page. Pagination affects presentation only.

## Diagnostic/native control repair (2026-11-15)

Both explicit visitor modes include bounded URL paths and error messages. Selected errors show their available file and line/column; absent historic data cannot be recovered. Native details/dialog tags, empty-string open state and rrweb modal/non-modal marker pass closed validation. Earlier boolean open forms normalize during intake, not by rewriting stored reports. Computed presentation retains auto/percentage sizing through available Typed OM; the supported replay subset and external-resource exclusions remain. [Readiness audit](audits/SDK_READINESS_2026-11-15.md) owns exact verification, final saved reports, intermediate failures and remaining public-release/visual limits.
