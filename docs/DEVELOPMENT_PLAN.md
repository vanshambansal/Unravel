# Development plan

Approved direction: Next.js + TypeScript, pnpm workspaces, retained vanilla Three.js, core-product priority, Clerk + Neon/Drizzle later. Each milestone is a separate authorized implementation task.

## 1. Application foundation and motion migration - complete (2026-11-10)

- Next.js dev/build, preserved scene/rays/fonts/posters/timing, component-scoped lifecycle and CSS.
- Repeatable lint/typecheck/unit/build/Playwright commands; Strict Mode, navigation, stale async setup and fallback checks.
- Keep the Vite reference/fixture unchanged. No services, authentication, SDK or remaining landing sections.
- Verification recorded in PROJECT_STATUS.md. Visual parity and production smoke passed; no commit/push.

## 2. Developer access and onboarding - planned

- Explicitly provision approved Clerk/Neon development projects, reviewed Drizzle migrations, developer sign-in and project/website setup.
- Verify signed-out and cross-owner access denial at service/API boundaries. Clerk identity alone is not authorization.
- Provider limits/costs and local environment handling discussed first; no keys in chat or Git.

## 3. Standalone recording SDK - planned

- Explicit lifecycle and rrweb/action/error/safe-network capture. Mask before persistence/upload, stop/destroy fully restore instrumentation.
- Verify SSR-safe import, privacy sentinels, correct HTTP-error classification, React/Next.js integration and measured provisional limits.

## 4. Report submission and replay - planned

- Versioned validation, retry/idempotency, persistence, metadata list, replay/detail and aligned timeline.
- Prove restart persistence, duplicate suppression and rejection without partial writes. Test against real PostgreSQL.

## 5. Editable plan and regression proof - planned

- Readable steps and persisted editable JSON plan, explicit expected behavior and validated Playwright export.
- Export once; unchanged test fails against the fixture bug and passes after the fix. Preserve actual results/artifacts.

## 6. Finish presentation and release preparation - planned

- Hybrid Figma/code process; complete storytelling and diagnostic zoom using the same readable request element, then reveal sequence/plan/export.
- Maintain honest previews. Verify responsive/accessibility, supported browsers, deployment limits, privacy and public-ingestion protections.

Keep marketing work bounded. No milestone authorizes the next one implicitly.
