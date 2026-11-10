# Project status

Last updated: 2026-11-10

## Current phase

Unravel is a browser bug-reporting, replay and regression-test generation portfolio project. **Milestones 1-3 are implemented: cinematic landing, developer access/private project onboarding, and local standalone SDK recording.** Recording stays in memory; report ingestion/replay, JSON-plan editing and Playwright export are not implemented. The user approved Milestone 3 privacy defaults and now requested its local commit followed by Milestone 4. Settle consequential upload/retention/replay-resource decisions before implementing those policies.

## Implemented behavior

- Developer email-code and Google authentication through the existing user-created Clerk Development app. The user confirmed both real sign-in methods worked. Scoped Clerk provider, sign-out and server-side session checks; no authentication bypass/keyless app.
- Private project list, create-project/website form, and direct SDK-setup routing. A project has one owner and registered origin. Registration accepts full HTTP(S) URLs or domains, previews the normalized origin and rejects unsafe URLs/embedded credentials. Domain registration is not ownership verification.
- Thin authenticated project APIs call services and an owner-constrained Drizzle repository. Client-supplied ownership is ignored; foreign/unknown IDs return the same 404. Same-origin JSON writes are bounded to 8 KiB. Duplicate origins per owner are prevented atomically.
- Neon PostgreSQL with reviewed migrations, lazy node-postgres pool and no migration at application startup. Initial SQL applied to the verified empty development and isolated test databases. No other data was replaced or removed.
- Approved practical dark UI: subtle sign-in architecture motif, visual Register / Integrate SDK / Investigate workflow, and responsive forms. SDK setup now shows actual local-workspace API instructions and clearly states upload/replay are unavailable; no invented registry install command.
- Accepted landing scene/shaders/camera preserved. Original Vite prototype, Blender files and 52-file reference remain unchanged. The independent vanilla fixture now integrates the standalone recording script; it has not become the product.

## Milestone 3 implementation

- packages/sdk: browser-only initialize/start/stop/destroy lifecycle, dynamic rrweb loading, in-memory result, semantic form actions/SPA history, JavaScript errors/unhandled rejections and safe fetch/XHR metadata. SSR import is safe. Repeated/cancelled starts, teardown, concurrent-instance rejection and late-request cleanup are tested.
- packages/contracts: version 1 runtime schemas/types with Zod Mini. Strict semantic envelopes reject raw body/header extensions; origins/paths/status values are validated. Replay envelopes are not a complete server-side ingestion validator.
- Approved privacy: mask text/all values, always block passwords (including revealed fields), omit network headers/bodies/query/fragment, redact paths and error messages unless explicitly allowlisted. Checked/selected states require opt-in too. Test sentinels cover replay and semantic channels. Only synthetic fixture content/known paths/intentional error are opted in. No data upload, localStorage or database recording writes.
- Configurable provisional duration/size/event guardrails visibly stop with reason/truncation/full-snapshot metadata. Limits bound the stored recording, not transient rrweb allocations. Recorder UI is blocked from capture.
- Independent Question desk controls and public SDK inspection; plain React Strict Mode harness plus development-only Next.js /sdk-lab. Production /sdk-lab returns 404. Marketing/dashboard do not automatically start recording. See SDK.md for API and the conservative fidelity/resource limitations.

### Milestone 3 actual verification (2026-11-10)

| Check | Outcome |
| --- | --- |
| lint / typecheck | Passed for application, SDK/contracts and typed repository tests |
| unit tests | 17 passed, including Node SSR import and contract rejection |
| test:sdk | 12 Chromium cases passed in one final logic-verification run, retries disabled; real HTTP 500, separate JS error, replay/action redaction, lifecycle/limits, fetch/XHR/history, late completion, plain React Strict Mode and Next.js desktop/mobile |
| Fixture server tests | 4 passed; intentional HTTP failure and repository-file exclusion retained |
| build / posters | Production build passed; four renderer-derived poster captures completed and manifest refreshed, image bytes unchanged |
| reference:check | All 52 original prototype files unchanged |
| Production boundaries | /sdk-lab and /motion-capture returned 404 in normal production |
| Existing authenticated onboarding | Real two-account Clerk ownership/create/reload/sign-out test passed against the final production preview, including updated SDK setup instructions. Existing synthetic E2E project rows retained. |
| Visual inspection | Fixture desktop/mobile and Next.js lab mobile captures inspected; no horizontal overflow in tested viewports. Final fixture control spacing verified by a focused browser rerun. |
| sdk:measure | ESM entry 43,607 bytes / 14,631 gzip; lazy recorder chunk 73,880 / 23,186 gzip; standalone script 118,361 / 37,618 gzip. Metadata checks found no playback implementation; rrweb includes a shared mirror deprecation string mentioning replayer, not a player implementation. |
| Controlled overhead sample | Windows headless Chromium 158, 1280x720, Node 22.18.0, no CPU throttle: latest 200-event synchronous synthetic input burst took ~0.4 ms without capture / 5.2 ms with capture; result 32,216 bytes, 3 replay and 201 semantic events after 200 ms flush. This single burst is not a real-site performance guarantee. |

Generated evidence: .playwright-mcp/m3-fixture-*.png, m3-next-sdk-mobile.png, test-results attachments and .cache/sdk-bundle-measurement.json (ignored). Earlier intermediate runs exposed a browser-prefixed error message (fixed by reading only an exact-allowlisted own Error.message) and a Next.js dev-lock conflict with our poster preview (resolved by stopping that preview). An initially sandboxed test run could not clean up its server; the identified owned processes were stopped and the elevated final run exited normally. No weakening of privacy assertions or retries.

## Local operation / providers

Use **http://localhost:3000** and the root README commands. Next/Clerk rewrites failed with the previous 127.0.0.1 binding; a matching localhost origin fixed the observed issue without a framework upgrade or authentication rewrite.

At this handoff, the production preview is running on localhost:3000 and a separate current SDK fixture preview on http://127.0.0.1:4184. The documented fixture command defaults to 4173; 4184 avoids disturbing the older process already on 4173. Preview processes are temporary local development conveniences, not deployed services.

The user created Clerk and Neon projects and entered secrets locally in ignored apps/web/.env.local. All required development/database values and two synthetic test-user identities are configured. No values should be printed. Masked keys are rejected by a shared format preflight, with credential/session validation still performed by Clerk.

Clerk 7.9.25, Drizzle 0.45.4 / Kit 0.31.11 and pg 8.23.1 are pinned alongside the existing Next.js 16.4.6 / React 19.3.1 stack. The live databases report PostgreSQL 18.6. Development/migration URLs match; the test target is separate. No agent-created provider project, Docker, paid upgrade or deployment.

The user explicitly approved two synthetic Clerk development users for ownership proof. E2E-labelled project rows remain under those test accounts, separate from the real developer account. Auth traces/storage files are disabled; explicit UI captures contain synthetic data only. No credentials/session headers are intended as test artifacts.

## Historical Milestone 2 verification

| Check | Outcome |
| --- | --- |
| lint / typecheck | Passed |
| unit tests | 15 passed |
| db:migrate / db:check | Reviewed development migration applied; connection/table checks passed |
| test:integration | Real PostgreSQL test passed: owner scoping, concurrent uniqueness, validation and reconnect persistence; only its own synthetic rows cleaned |
| test:auth | Real Clerk two-user browser proof passed in development and against the production build: creation, reload, owner isolation, forged-owner input, duplicate/cross-origin rejection and sign-out |
| First-factor sign-in | User manually confirmed both Google and email-code sign-in; this is separate from helper-based sessions |
| Application restart | Previously saved project re-read through authenticated API/setup page after a full Next.js restart |
| Visual inspection | Real Clerk screen and authenticated project list/form/setup inspected at 1440x900 and 390x844; six private-page captures, no horizontal overflow |
| reference:check | All 52 original prototype files unchanged |
| General Chromium regressions | Configured-service full run: 13 passed, one long motion case hit its 120s total limit. With only that case budget raised to 240s, targeted rerun passed (1.9 minutes). All 14 cases covered across runs; no claim of one clean full invocation, retries or performance guarantee. |
| Production build/posters | Final configured production build passed. Four localhost captures completed, PNG bytes unchanged, source/dependency stamp refreshed. |

A scan found no actual private credential values in client bundles or versionable text files; .env.local remains ignored. This check does not replace a release security review.

Browser evidence is ignored under .playwright-mcp/m2-clerk-live-desktop.png and m2-live-*.png. Restart proof metadata under .cache contains only a synthetic project identifier/name, no session state. Historical failed setup checks and the masked-key diagnosis remain in PROMPT_LOG.md; they are not current blockers.

## Limitations / next step

Local development is verified, not public-deployment readiness. Clerk development keys, production OAuth/domain setup, public-ingestion protections, hosting limits and privacy review still matter before release. Real phones, Safari/Firefox and sustained GPU performance remain unverified. pg emits an SSL-mode forward-compatibility notice; current TLS verification was preserved. Kit has two deprecated esbuild-kit transitive packages; generation and migrations work with the pinned tooling.

Next: Milestone 4 report ingestion and replay, only after a separate task. Discuss bounded upload/retention and replay resource/sandbox policy; enforce registered origin and server-side validation independently of client masking. Default replay sanitization currently omits CSS bodies, arbitrary attributes/classes and images, so full visual fidelity is not established. Shadow DOM, custom controls, real phones, Safari/Firefox and long-duration overhead remain unverified. Packages are local/private; third-party notices/distribution need review before SDK publication. Marketing diagnostic zoom and later storytelling remain deferred.

## Git

main; Milestone 2 baseline 91ffac7, previous baseline 6b818e6; origin https://github.com/vanshambansal/Unravel.git. The user explicitly requested a local Milestone 3 checkpoint commit; git log is authoritative for its hash. Read-only git ls-remote origin succeeded with no advertised refs on 2026-11-10. No push, reset or infrastructure provisioning is authorized by this checkpoint. Current requirements/rationale live in PROJECT_BRIEF.md, ARCHITECTURE.md, DECISIONS.md and DEVELOPMENT_PLAN.md; historical docs are retained separately.
