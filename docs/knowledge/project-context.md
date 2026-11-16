# Unravel: portable project briefing

Reviewed against repository source on 2026-11-16. This is a briefing you can copy into a conversation or prompt. It describes the current project, not a future product specification.

## Problem and users

Unravel helps developers investigate browser bugs that are difficult to reproduce from a short description. A report can show what happened on the page, which actions occurred and which requests or JavaScript errors appeared nearby. The goal is a reliable software engineering project with a demonstrable workflow, not a commercial monitoring platform.

There are two roles. A developer signs in, registers a website/project and installs the SDK. A visitor to that website explicitly starts recording, reproduces a problem, stops and submits a report. Ordinary visitors do not need an Unravel account. The in-app demonstration requires developer sign-in to prepare a private recording destination; that is demo setup, not a requirement imposed on all external visitors.

## What has been built

The project includes a cinematic landing, authenticated project/report workspace, a standalone browser SDK with a floating widget, two recording modes, bounded DOM replay, readable actions, JavaScript errors and fetch/XHR metadata. Reports persist in PostgreSQL and are owner-protected. Submission supports unchanged retry after a lost response. Developers can review/edit a versioned test plan and download Playwright reproduction or regression tests.

The npm package is **@vansham/unravel-sdk@0.1.0**, published under MIT. The package can be imported safely during server rendering, but mounting and recording require a browser lifecycle. React and Next.js integrations mount it once in an effect and destroy it on cleanup. Importing or mounting it does not silently start capture.

## Stack and organization

Next.js App Router contains the web UI and Node Route Handlers; there is no separate Express backend. React manages interactive UI, and TypeScript helps keep interfaces consistent. Runtime schemas validate data crossing boundaries, because TypeScript alone cannot validate incoming JSON.

Clerk handles developer authentication. PostgreSQL stores related project/report data and JSON evidence, accessed through Drizzle and node-postgres. rrweb supplies DOM recording/reconstruction primitives. Unravel supplies the widget, lifecycle, privacy/sanitization, semantic instrumentation, persistence, authorization, replay bridge and test-plan workflow. Three.js renders the cinematic scene; GSAP coordinates its choreography. CodeMirror supplies the JSON/code editor, and Playwright tests real browser behavior and is the generated test target.

The repository separates apps/web, packages/sdk, packages/contracts and packages/test-plan. Examples test npm installation in independent React/Next applications. Fixtures contain controlled failures. Tests and scripts provide reproducible checks. Required source, configuration, migrations, licenses and environment templates remain public; credentials and generated outputs do not.

## How one report moves through the system

The SDK gathers two streams: sanitized DOM evidence for replay, and semantic events for actions, errors, navigation and network metadata. It uses relative timing to correlate them. Default widget limits are 120 seconds, 5,000 combined events and about 5 MB of recording data; the complete submission has its own 5 MB cap.

Masked mode hides field values while keeping ordinary displayed text visible. Full-content mode explicitly includes entered and sensitive values where supported. Both exclude hidden inputs, SDK UI, blocked sections, network bodies, headers, cookies and URL queries/fragments. Displayed text and diagnostic messages can still contain private information. This is a defined capture policy, not automatic detection of every secret.

Submission goes to a registered-origin endpoint without visitor authentication cookies. The server independently validates bounded, inert evidence. Metadata is stored separately from replay/events. A frozen submission envelope, recording identifier, digest, transaction and unique constraint make an identical retry return the existing report; changed content with that identity conflicts. This is scoped idempotency, not a universal exactly-once guarantee.

Private reads check the developer's ownership. Replay data goes through an origin/source/channel-checked bridge to a separate trusted player host. Its inner recorded-document frame cannot execute recorded scripts or submit forms. The player receives no database or Clerk credentials.

The deterministic generator sorts and folds observed actions into an editable JSON plan. Developers review structural locators, replace masked values with safe inputs and define expected correctness. Reproduction export repeats actions. Regression export requires confirmed intended assertions. Export does not run the test; there is no LLM generation, hosted runner or automatic root-cause diagnosis.

## Database and engineering boundaries

There are six application tables: projects, reports, report_payloads, report_test_plans, ingestion_budgets and account_intake_blocks. Clerk owns accounts, so the application stores owner identifiers rather than passwords. Foreign keys link evidence/plans to reports, with cascading deletion. Revision checks prevent silent overwrites of stale edits. Account closure blocks future intake without automatically erasing retained evidence.

Performance work includes route prefetch/retained navigation, scoped request sharing, payload separation, connection reuse, bounded data and lazy graphics loading. Private API responses remain no-store. The scene pauses unnecessary rendering and adapts quality. Faster averages do not prove hitch-free behavior on every device.

## Verification and remaining work

Earlier configured-workspace tests covered real persistence, ownership, retry, replay and reviewed exports, including unchanged tests failing before a controlled fix and passing afterward. A separate tracked-files-only checkout with no original credentials passed installation, lint/types, 50 unit tests, production build, SDK browser checks and anonymous/integration-example browser flows.

The newer clean checkout has **not** yet passed initialization against separately configured empty PostgreSQL/Clerk services. Public application deployment is also pending. Replay remains a restricted DOM/CSS reconstruction, not video or arbitrary-site visual equivalence. Full-page navigation, canvas, Shadow DOM and complex cross-origin content have limits.

When using this briefing as a prompt: explain these mechanisms in plain language, distinguish implementation from verified behavior and future ideas, ask for source when a precise claim is missing, and do not invent deployment results, scale, users, benchmarks or personal ownership stories.
