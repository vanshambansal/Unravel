# Development plan

Approved direction: Next.js + TypeScript, pnpm workspaces, retained vanilla Three.js, core-product priority, Clerk + Neon/Drizzle for developer access and metadata. Each milestone is a separate authorized implementation task.

## 1. Application foundation and motion migration - complete (2026-11-10)

- Next.js dev/build, preserved scene/rays/fonts/posters/timing, component-scoped lifecycle and CSS.
- Repeatable lint/typecheck/unit/build/Playwright commands; Strict Mode, navigation, stale async setup and fallback checks.
- Keep the Vite reference/fixture unchanged. No services, authentication, SDK or remaining landing sections.
- Verification recorded in PROJECT_STATUS.md. Visual parity and production smoke passed; no commit/push.

## 2. Developer access and onboarding - complete (2026-11-10)

- Email-code and Google sign-in using the user's existing Clerk application; both manually confirmed by the user.
- Approved desktop/mobile auth/project/registration UI implemented, with private project APIs and direct SDK setup.
- Reviewed migrations applied to the empty development/test Neon databases. Actual PostgreSQL and two-user auth/ownership browser tests passed, including production mode and restart persistence.
- Two explicitly approved synthetic Clerk users and their E2E-labelled project rows remain for repeatable tests. No Docker, paid upgrade, commit or push. Recording SDK and later landing sections remain out of scope.
- Commands and detailed actual verification/limitations are owned by README.md and PROJECT_STATUS.md.

## 3. Standalone recording SDK - implementation complete (2026-11-10)

- Standalone browser TypeScript SDK with version 1 runtime contracts; explicit lifecycle and sanitized rrweb/action/error/fetch/XHR capture to local memory.
- Approved conservative privacy defaults and synthetic fixture opt-ins. Passwords remain blocked after reveal; checked/selected states require opt-in too. Teardown restores owned instrumentation.
- SSR-safe import, privacy sentinels, correct HTTP-error classification, plain React Strict Mode/Next.js integration, provisional limits and measured bundle/recording size. Actual outcomes are in PROJECT_STATUS.md.
- No upload, report persistence, replay player, test plan or exporter. Conservative replay sanitization limits styling fidelity; full replay/resource policy is Milestone 4 work. No marketing redesign or new service.

## 4. Report submission and replay - complete locally (2026-11-10)

- Versioned validation, retry/idempotency, persistence, metadata list, replay/detail and aligned timeline.
- Prove restart persistence, duplicate suppression and rejection without partial writes. Test against real PostgreSQL.
- Approved: self-contained masked replay, owner-controlled deletion/no automatic expiry, provisional 5 MB cap and a separate local replay host. Versioned server validation, transactional persistence, retry/deduplication, actual replay/timeline seeking and deletion passed real PostgreSQL/production browser checks. A previously retained recording survived a full server restart. Origin/script/resource isolation and responsive fit/100% view were tested. Detailed outcomes/limits live in PROJECT_STATUS.md and operation in REPORTS.md; public deployment remains out of scope.

## V2 product corrections - complete locally (2026-11-10)

- Approved V2 projects, onboarding, investigation and floating recorder implemented; V1 retained in Figma and cinematic renderer preserved.
- Complete mountWidget workflow, isolated styles, privacy exclusion, framework instructions and portable local SDK package. Real browser submission/retry/replay and responsive/keyboard checks passed; exact evidence and remaining limitations are in PROJECT_STATUS.md.
- No generation or public deployment added. Next milestone still needs its separate implementation task.

## Product completion roadmap (approved after V2)

1. Project management and onboarding: complete locally. Rename/origin settings, typed permanent deletion, owner/same-origin/stale-edit checks and visible fixture setup passed production browser and database checks. No new migration or automatic changes to existing data. Actual outcomes are in PROJECT_STATUS.md.
2. Report management: implemented and browser-verified locally (2026-11-12): Open/Resolved, editable title/description, URL-preserved server search/pagination and display-only typing groups. See REPORTS.md.
3. Styled replay: bounded sanitized layout/CSS, preserved masking and separate-origin isolation; fresh recordings required for new fidelity. Images/fonts deferred.
4. Regression workflow is implemented locally; follow the current audit for remaining reliability gaps, then release preparation.

Each implementation task stops after actual checks and documentation. Current outcomes live in PROJECT_STATUS.md.

## 5. Editable plan and regression proof - complete for the bounded local workflow (2026-11-11)

- Readable deterministic steps, persisted editable version 1 JSON plan, explicit developer-confirmed expected behavior and validated standalone Playwright export are implemented. See TEST_PLANS.md.
- Actual downloaded export: five expected assertion failures against the HTTP-500 fixture, then five passes against the isolated source-patched HTTP-200 fixture, retries disabled and file SHA-256 unchanged. Artifacts retained; current outcomes live in PROJECT_STATUS.md.

## 6. Presentation implemented; operator release preparation remains

- Hybrid Figma/code process; storytelling and diagnostic zoom are implemented using the same readable request element, then sequence/plan/export.
- Maintain honest previews. Verify responsive/accessibility, supported browsers, deployment limits, privacy and public-ingestion protections.

Keep marketing work bounded. No milestone authorizes the next one implicitly.

Internal UI completion work uses the compositions and browser review criteria in INTERNAL_UI.md. Settings, registration and resource-list recipes are implemented; reuse them as report management and plan editing are added, without treating a presentation refactor as a completed product milestone.

Report triage is now implemented locally. Public preparation has code/configuration safeguards, but hosted acceptance remains blocked; see DEPLOYMENT.md and the current audit. Historical milestone exclusions describe their original boundaries, not missing current features.


## Internal product direction and motion implementation (2026-11-11)

Previous preparation produced two independent Figma directions covering authentication, projects/settings, investigation, recorder, mobile and workflow patterns. That design-only task did not change application behavior. The subsequent approval and runtime implementation are described below; DESIGN.md owns the composition references.

The user selected B authentication and A product compositions and approved coordinated motion. Shell/auth, investigation and recorder motion are implemented; see PROJECT_STATUS for current checks and artifacts. Next gate: review actual browser behavior and aesthetics, then address only consequential findings. Report management controls are implemented; current verification is in PROJECT_STATUS.md. Public release remains separate from local landing completion.

## Review-first generator - implementation 2026-11-11

Readable steps, contextual technical editing, reversible inclusion/reorder, Steps/Playwright/JSON preview and assertion-free reproduction export are implemented. Regression checks require confirmed intended outcomes. Version 2 remains compatible with old saved plans; original evidence and ownership/revision checks remain unchanged. No LLM or second adapter. PROJECT_STATUS owns actual checks and remaining limits; user runtime/aesthetic review is a separate gate.

Next bounded completion choice: report triage/metadata/search/pagination, then remaining presentation and release protections. Do not start these automatically or claim public readiness.

## Current authorized task - functional completion then independent audit

The user authorized report/release preparation followed automatically by a broad independent audit, with no intervening approval gate. Local report workflows and release safeguards are implemented. Provider/domain/edge/privacy decisions remain explicit deployment blockers, not completed services. Audit the current code and actual browser workflows; test counts support, but never establish, user-facing completion. Do not begin a major redesign, push or deploy after the audit. Current outcomes are in PROJECT_STATUS.md; release commitments are in DEPLOYMENT.md.

## Latest authorized completion - 2026-11-12

The user authorized audit-defect corrections followed by the complete landing story. Ordinary-control capture, account intake closure, investigation clarity and onboarding refinements are implemented. The owner reconciled Clerk development signup. The approved cinematic scene/reference remains unchanged. Current verification and open operator/device limits live in PROJECT_STATUS.md; do not infer public readiness from local completion or start deployment/publication automatically.
