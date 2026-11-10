# Unravel project brief

## Product goal

Build a complete, reusable browser bug-reporting, session-replay, and regression-test generation product for an SDE internship portfolio. Prioritize working behavior, clean engineering, visual quality, and reasonable development time over commercial-scale infrastructure.

The agreed intended release is a hosted portfolio product with controlled synthetic demonstrations and documented limitations. Unravel's end-to-end recording-to-test workflow is not implemented. Developer authentication/private project onboarding and local in-memory SDK recording are implemented. The independent `fixtures/test-site` integrates the SDK; it does not prove report ingestion, replay or test generation. Approved milestones and decisions live in DEVELOPMENT_PLAN.md and DECISIONS.md; actual verification lives in PROJECT_STATUS.md.

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
- Sensitive information, page text and input values are masked by default; passwords are always blocked. The approved initial policy omits network bodies/headers/query/fragment and redacts paths/error text unless explicitly allowlisted. Only synthetic fixture content, known paths and its intentional error message are opted in. See SDK.md for implementation and limitations. Persistence/retention policy remains future work.

## Product and engineering boundaries

- Recording begins only through explicit visitor action; no silent or continuous capture.
- Never collect passwords, cookies, tokens, or request/response bodies. The approved masking policy is documented in SDK.md; persistence/retention requires discussion before implementation.
- Replay reconstructs DOM activity; it is not a literal video. Diagnostics provide evidence, not guaranteed backend root causes.
- Observed failure does not establish intended behavior. Developers must supply meaningful expected outcomes.
- JSON is the central test representation; Playwright is the first export target. Other adapters are future possibilities, not current scope.
- The initial interaction boundary is confirmed above. Browser coverage, recording limits, payload storage, and bundle budgets still require agreement and measurement.
- Authentication, authorization, privacy controls, and public-ingestion protections are mandatory before public deployment.
- No commercial-scale architecture, automatic cloud test execution, or unnecessary AI dependencies are assumed.

## Agreed architecture and current implementation

Next.js App Router + TypeScript with pnpm workspaces, retained vanilla Three.js and a standalone TypeScript recording SDK. Clerk + Neon PostgreSQL/Drizzle are used for developer access and project metadata; the user created the provider projects and entered credentials locally. Detailed boundaries and future-versus-current status live in ARCHITECTURE.md and PROJECT_STATUS.md.

The approved opening/hero has been migrated from the unchanged Vite reference into apps/web. Recording, report/replay and test-generation functionality remain unimplemented. Follow the separately authorized milestones in DEVELOPMENT_PLAN.md; no automatic return to the deleted foundation.
