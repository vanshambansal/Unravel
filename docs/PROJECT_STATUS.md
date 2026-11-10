# Project status

Last updated: 2026-11-10

## Current phase

Unravel is a browser bug-reporting, replay and regression-test generation portfolio project. **Milestones 1 and 2 are complete. Developer access and private project onboarding are implemented and verified against Clerk/Neon.** No recording SDK, report ingestion/replay, JSON-plan editor or Playwright exporter exists yet. Do not start the next milestone automatically.

## Implemented behavior

- Developer email-code and Google authentication through the existing user-created Clerk Development app. The user confirmed both real sign-in methods worked. Scoped Clerk provider, sign-out and server-side session checks; no authentication bypass/keyless app.
- Private project list, create-project/website form, and direct SDK-setup routing. A project has one owner and registered origin. Registration accepts full HTTP(S) URLs or domains, previews the normalized origin and rejects unsafe URLs/embedded credentials. Domain registration is not ownership verification.
- Thin authenticated project APIs call services and an owner-constrained Drizzle repository. Client-supplied ownership is ignored; foreign/unknown IDs return the same 404. Same-origin JSON writes are bounded to 8 KiB. Duplicate origins per owner are prevented atomically.
- Neon PostgreSQL with reviewed migrations, lazy node-postgres pool and no migration at application startup. Initial SQL applied to the verified empty development and isolated test databases. No other data was replaced or removed.
- Approved practical dark UI: subtle sign-in architecture motif, visual Register / Integrate SDK / Investigate workflow, and responsive forms. SDK setup truthfully says recording is unavailable; no invented install command.
- Accepted landing scene/shaders/camera preserved. Landing changes are application navigation and truthful availability copy only. Original Vite prototype, fixture, Blender files and 52-file reference remain unchanged.

## Local operation / providers

Use **http://localhost:3000** and the root README commands. Next/Clerk rewrites failed with the previous 127.0.0.1 binding; a matching localhost origin fixed the observed issue without a framework upgrade or authentication rewrite.

The user created Clerk and Neon projects and entered secrets locally in ignored apps/web/.env.local. All required development/database values and two synthetic test-user identities are configured. No values should be printed. Masked keys are rejected by a shared format preflight, with credential/session validation still performed by Clerk.

Clerk 7.9.25, Drizzle 0.45.4 / Kit 0.31.11 and pg 8.23.1 are pinned alongside the existing Next.js 16.4.6 / React 19.3.1 stack. The live databases report PostgreSQL 18.6. Development/migration URLs match; the test target is separate. No agent-created provider project, Docker, paid upgrade or deployment.

The user explicitly approved two synthetic Clerk development users for ownership proof. E2E-labelled project rows remain under those test accounts, separate from the real developer account. Auth traces/storage files are disabled; explicit UI captures contain synthetic data only. No credentials/session headers are intended as test artifacts.

## Actual verification

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

Next: discuss Milestone 3: standalone recording SDK and contracts, privacy defaults, explicit lifecycle and fixture integration. Do not implement it automatically. Marketing diagnostic zoom and later storytelling remain deferred.

## Git

main; initial baseline 6b818e6; origin https://github.com/vanshambansal/Unravel.git. Milestone 2 changes are uncommitted. No commit, push, reset or new remote-history verification in this task. Current requirements/rationale live in PROJECT_BRIEF.md, ARCHITECTURE.md, DECISIONS.md and DEVELOPMENT_PLAN.md; historical docs are retained separately.
