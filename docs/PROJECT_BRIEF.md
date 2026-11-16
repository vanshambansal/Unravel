# Unravel project brief

## Product goal

Build a complete, reusable browser bug-reporting, session-replay, and regression-test generation product for an SDE internship portfolio. Prioritize working behavior, clean engineering, visual quality, and reasonable development time over commercial-scale infrastructure.

The intended release is a hosted portfolio product with controlled synthetic demonstrations and documented limitations. The bounded recording-to-test pipeline is implemented locally: developer access/onboarding, standalone visitor widget, safe capture, persistent reports, masked bounded styled replay, correlated evidence, deterministic reproduction steps, persisted editable JSON plans and standalone Playwright export. A controlled unchanged-test fail-before/pass-after proof is verified. This does not establish arbitrary-site compatibility or public deployment readiness. Approved scope lives in DEVELOPMENT_PLAN.md/DECISIONS.md; actual outcomes and remaining gaps live in PROJECT_STATUS.md.

## Users and intended workflow

1. A developer signs up, creates a project, and registers a website.
2. The developer receives framework-specific SDK integration instructions, initially for React and Next.js.
3. A framework-independent browser SDK supplies a reporting widget. A visitor explicitly starts recording, reproduces the issue, stops, describes it, and submits a report.
4. The system captures reconstructed session replay, meaningful actions, JavaScript errors/unhandled rejections, and safe network metadata.
5. The developer opens the dashboard to review reports, replay the session, and inspect a correlated diagnostic timeline.
6. Recorded actions become readable reproduction steps and an editable framework-independent JSON test plan.
7. The developer reviews locators, supplies safe values, defines expected behavior, and validates the plan.
8. The developer exports a readable Playwright test and runs it locally. Demonstrate the same generated test failing before a fix and passing after it.

The SDK and pipeline must remain reusable across supported sites; a demonstration website is only an integration target.

## Confirmed initial behavior

- Website developers authenticate; visitors do not need an Unravel account to record and submit a report through the installed widget. Anonymous submission still requires ingestion abuse protections before hosting.
- Initial interaction support focuses on ordinary form input/submission, clicks, native selections, and navigation within a single-page application.
- Full document reloads, cross-origin navigation/iframes, file uploads, drag-and-drop, canvas, and complex custom controls are outside the initial supported interaction set. Unsupported cases must be documented and surfaced rather than presented as successfully captured/testable.
- The widget defaults to masking entered field values while retaining page text and structure. Visitors can select full-content recording; both modes include diagnostic messages and URL paths. [SDK.md](SDK.md#approved-privacy-policy) owns the approved policy and exclusions. Local reports have owner-controlled deletion/no automatic expiry; complete submissions are provisionally capped at 5 MB. Hosted retention/security remains future work.

## Product and engineering boundaries

- Recording begins only through explicit visitor action; no silent or continuous capture.
- Never collect cookies, hidden inputs or network bodies/headers. Visible field values follow the visitor-selected policy in SDK.md; full mode can include sensitive values. Public deployment requires a separate privacy/retention review and accurate disclosure.
- Replay reconstructs DOM activity; it is not a literal video. Diagnostics provide evidence, not guaranteed backend root causes.
- Observed failure does not establish intended behavior. Developers must supply meaningful expected outcomes.
- JSON is the central test representation; Playwright is the first export target. Other adapters are future possibilities, not current scope.
- The initial interaction boundary is confirmed above. Browser coverage, recording limits, payload storage, and bundle budgets still require agreement and measurement.
- Authentication, authorization, privacy controls, and public-ingestion protections are mandatory before public deployment.
- No commercial-scale architecture, automatic cloud test execution, or unnecessary AI dependencies are assumed.

## Agreed architecture and current implementation

Next.js App Router + TypeScript with pnpm workspaces, retained vanilla Three.js and a standalone TypeScript recording SDK. Clerk + Neon PostgreSQL/Drizzle are used for developer access and project metadata; the user created the provider projects and entered credentials locally. Detailed boundaries and future-versus-current status live in ARCHITECTURE.md and PROJECT_STATUS.md.

The approved opening/hero has been migrated from the unchanged Vite reference into apps/web. Local recording-to-report/replay is verified using the explicitly approved separate player origin. Deterministic plan generation/editing/export is described in TEST_PLANS.md. Actual verification lives in PROJECT_STATUS.md; no automatic return to the deleted foundation.

Approved V2 product UI and the SDK's complete floating visitor workflow are implemented locally. Integrators mount/configure the widget; visitors do not build controls or need an Unravel account. The independent fixture demonstrates Start, reproduce, Stop, describe, submit/retry, then developer investigation. SDK setup documents the published `@vansham/unravel-sdk@0.1.0` npm installation. Public application hosting is pending. See SDK.md and PROJECT_STATUS.md for operation and actual verification.

Direction B authentication and Direction A internal product presentation are approved and implemented locally. The compact SDK widget is supplied out of the box; integrators configure it once, and visitors never enter a project ID. DESIGN.md owns visual intent; PROJECT_STATUS.md owns verification and remaining work.
