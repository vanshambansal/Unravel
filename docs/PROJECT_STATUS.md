# Project status

Last updated: 2026-11-10

## Overview and current milestone

Unravel is a browser bug-reporting, session-replay and regression-test generation portfolio project. **Milestone 1: Next.js foundation and accepted motion migration is complete.** The landing entrance/hero works in apps/web; /app is a clearly labelled shell. No authentication, project registration, SDK, report ingestion/persistence, replay dashboard, JSON-plan editor or exporter is implemented.

## Implemented and verified

- Next.js App Router with TypeScript, pnpm workspaces and separate marketing/product route groups. Vanilla Three.js/GSAP scene and shaders are reused, not translated to React Three Fiber.
- Root-scoped controller, styles and font families; cancelled async initialization and idempotent cleanup support React Strict Mode and client navigation.
- Preserved doorway/camera/rays/hero hold, keyboard skip/focus, pause, responsive framing, reduced motion and static/no-JavaScript/WebGL/loading/context-loss fallbacks.
- Repository browser tests, unit tests, lint/typecheck/build and renderer-poster/reference/parity tools. Four fallback images regenerated through the Next.js renderer. Development-only /motion-capture maintenance route returns 404 in ordinary production.
- Original 52-file prototype reference passes its pre-migration hash manifest; independent fixtures/test-site is retained. No automatic prototype retirement or Blender rebuild.
- Current documentation is concise; prior design, decision and task records remain in *_HISTORY.md documents.

## Stack and boundaries

Node 22.18.0; pnpm 10.34.9 via Corepack; Next.js 16.4.6; React 19.3.1; TypeScript 5.9.3; Three.js 0.187.0; GSAP 3.15.1; ESLint 10.14.0; Playwright Test 1.65.0. Exact dependencies are pinned in manifests/lockfile. Clerk + Neon PostgreSQL/Drizzle are approved future choices only: no provider dependency, credentials, service provisioning or Docker was added.

## Verification outcomes

Commands and setup are owned by [README.md](../README.md). Actual migration checks on Windows, Node 22.18.0:

| Check | Outcome |
| --- | --- |
| corepack pnpm lint | Passed |
| corepack pnpm typecheck | Passed, including Next route type generation |
| corepack pnpm test | 9 passed |
| corepack pnpm build | Production build passed |
| corepack pnpm test:e2e --project=chromium | 10 passed; sequential, retries disabled |
| corepack pnpm posters:capture / posters:stamp / posters:check | Four renderer captures completed; source/image integrity passed |
| corepack pnpm reference:check | 52 original prototype files unchanged |
| corepack pnpm parity:reference | Six desktop/mobile opening/crossing/hero pairs: zero pixel difference in the controlled paused comparison |
| Production browser smoke | Live render, skip/focus, pause, SPA cleanup, capture-route 404; no page errors |

Browser coverage includes forward/reverse/rapid scroll, native hero reading hold, three viewport sizes, pointer/ambient response, resize, live reduced-motion changes, failure fallback, three navigation cycles, cold application-route isolation and delayed initialization after unmount. Tests caught and fixed a global CSS-variable leak and fractional-pixel offscreen rendering. Poster capture exposed Next's private-underscore directory convention; the maintenance route was corrected and recaptured.

Visual evidence is ignored under .playwright-mcp/migration-parity and production-hero.png; browser failure artifacts use test-results. The controlled comparison used the same Chromium 158 browser/GPU, paused ambient time zero, desktop 1440x900 and mobile 390x844. It is parity evidence, not a cross-device performance guarantee. Production was also exercised independently of the development debug bridge.

## In progress, limitations and next actions

No implementation work remains in this milestone. User review remains valuable before retiring the original prototype, which is retained. Real-phone performance, sustained GPU benchmarks, Safari and Firefox remain unverified; emulation is not physical-device testing. Asset loading and GPU speed vary by machine. Browser tests allow software rendering and are not performance benchmarks.

Next: authorize Milestone 2 developer access/onboarding. Discuss Clerk and Neon development-project setup, provider limits/costs and local credential entry first. Do not paste secrets into chat. Core product work precedes remaining landing storytelling/diagnostic zoom. See DEVELOPMENT_PLAN.md for subsequent milestones.

## Git baseline

The user authorized the initial local baseline commit and branch rename to main on 2026-11-10. origin remains https://github.com/vanshambansal/Unravel.git. A fresh git ls-remote origin succeeded with no advertised refs before the commit. No push, history reset or global ownership-setting change is authorized or performed. Use git log/status for the actual commit identity and working-tree state.
