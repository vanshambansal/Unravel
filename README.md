# Unravel

A browser bug-reporting, session-replay and regression-test generation project for an SDE portfolio.

**Current:** The local recording-to-test workflow is implemented: cinematic landing, authenticated projects, standalone visitor widget, persistent reports, isolated replay, readable steps and reviewed reproduction/regression Playwright exports. See [project status](docs/PROJECT_STATUS.md) for actual checks and limitations; public deployment is not ready.

## Development

Use Node 22.18.0 (see .node-version) and the pinned pnpm 10.34.9 through Corepack. The landing page needs no services. Authentication/project features need the local Clerk/Neon configuration in [SERVICE_SETUP.md](docs/SERVICE_SETUP.md). No Docker is used.

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open http://localhost:3000. Use this address consistently: the 127.0.0.1 binding caused an observed authentication rewrite failure in Next.js. The /app route redirects to the protected project workspace. Without configured Clerk keys, it redirects to the honest sign-in setup-pending screen. The original Vite study remains unchanged at prototypes/landing-motion, independently runnable with its existing npm commands. The Question Submission fixture remains independent under fixtures/test-site.

## Checks

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm browsers:install
corepack pnpm test:e2e --project=chromium
corepack pnpm test:sdk
corepack pnpm test:reports
corepack pnpm test:plans
corepack pnpm test:standard
node scripts/verify-plan-adapters.mjs
corepack pnpm test:generated
corepack pnpm test:projects
corepack pnpm sdk:measure
corepack pnpm sdk:pack
corepack pnpm start
```

Playwright starts a local development server if port 3000 is free. Set PLAYWRIGHT_BASE_URL to target another running server. Browser tests run sequentially with retries disabled; traces/snapshots are retained on failures. Browser installation preserves older tool caches. CI hardware/software rendering is not a visual-performance benchmark.

For a production preview, stop the development server before running start on the same port. /motion-capture is development-only unless explicitly enabled with MOTION_CAPTURE=1; it returns 404 in normal production.

## Local recording SDK

See [SDK.md](docs/SDK.md) for lifecycle, React/Next.js integration, approved privacy opt-ins and limitations. `dev`, `test`, `typecheck` and `build` build the local contracts/SDK first. Nothing is published to npm.

```powershell
corepack pnpm build:packages
node fixtures/test-site/server.mjs
```

Configure `fixtures/test-site/.env.local` as the website developer, using its `.env.example` and the exact registered origin/public project ID. Restart the fixture and open its printed URL (configured example: http://127.0.0.1:4184): the floating widget appears immediately, without visitor setup. Real React/Next.js integrations call `mountWidget` in a client effect. See [fixture setup](fixtures/test-site/README.md) and [SDK.md](docs/SDK.md). Drag the launcher/timer or panel grip; arrow keys move it, Home resets. The panel is compact and description is optional. Capture stays local until explicit Send. Start the isolated player with `corepack pnpm replay:dev`, then open Reports. [REPORTS.md](docs/REPORTS.md) owns the full workflow. Debug/URL overrides require an explicitly enabled automated fixture; /sdk-lab stays development-only.

SDK tests normally use fixture 4183 / Next 3013. If the application already runs in development, set `SDK_LAB_BASE_URL=http://localhost:3000` rather than starting a competing Next.js dev process. Report tests normally use fixture 4185 / Next 3015 / isolated player 4191; set `REPORTS_BASE_URL` to an existing app/production preview as needed. Auth traces/storage are disabled. `test:standard` adds independent React 4194 and Next.js 3017 sites and runs actual downloaded scripts; use the same REPORTS_BASE_URL convention. See [standard-site verification](fixtures/standard-sites/README.md). SDK checks need no credentials; report tests use the existing synthetic Clerk users and development database. `sdk:measure` reports build sizes and a timestamped sample, not a performance guarantee.

## Authentication and project persistence

Configure apps/web/.env.local using apps/web/.env.example and [SERVICE_SETUP.md](docs/SERVICE_SETUP.md). Never paste or commit secrets. Review generated SQL in apps/web/drizzle before applying it.

```powershell
corepack pnpm db:check
corepack pnpm db:migrate
corepack pnpm test:integration
corepack pnpm test:auth
corepack pnpm test:motion
```

The database and real-session suites fail explicitly when required configuration is absent. Integration tests require a separate test database; auth tests require two existing synthetic Clerk development users and leave E2E-labelled project rows. Auth traces/storage files are disabled. These sessions test authorization; actual email-code delivery and Google OAuth still need separate user-assisted verification. No automatic database creation/migration occurs at app startup. Use db:generate only after an intentional schema change.

## Poster and parity maintenance

The existing architecture, shaders, fonts and cameras are preserved. Application assets live under apps/web/public/landing. After renderer/asset/dependency changes, with the development server running:

```powershell
corepack pnpm posters:capture
corepack pnpm posters:stamp
corepack pnpm build
```

Stamp only after all four captures complete. The build verifies source/image hashes and PNG dimensions. Captures are renderer-only at time zero; UI rays are a separate overlay. See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for lifecycle ownership.

An optional local comparison runs node scripts/compare-reference.mjs with both the original Vite server on 4174 and Next.js on 3000. It captures paused desktop/mobile opening, crossing and hero states in the same browser/GPU. It requires no connected agent tool. corepack pnpm reference:check compares the retained prototype against the pre-migration manifest in tests/fixtures/prototype-manifest.json. It is reproducible after cloning; update that manifest only for an explicitly approved reference change.

## Documentation

- [Service setup](docs/SERVICE_SETUP.md): Milestone 2 local Clerk/Neon configuration.
- [Recording SDK](docs/SDK.md): current lifecycle, privacy and framework integration.
- [Test plans and export](docs/TEST_PLANS.md): plan editing, private persistence and unchanged fail/pass proof.
- [Reports and replay](docs/REPORTS.md): local operation, persistence, retention and isolation.
- [Agent guidelines](AGENTS.md): starting context and engineering rules.
- [Project status](docs/PROJECT_STATUS.md): actual state, verification and blockers.
- [Project brief](docs/PROJECT_BRIEF.md): users, product requirements and boundaries.
- [Architecture](docs/ARCHITECTURE.md): implementation boundaries and lifecycle.
- [Development plan](docs/DEVELOPMENT_PLAN.md): milestone acceptance criteria.
- [Design](docs/DESIGN.md): approved landing, B authentication / A product direction, motion language and Figma references.
- [Internal UI compositions](docs/INTERNAL_UI.md): implementation patterns, redesign boundary and browser review standards.
- [Design-tool product context](apps/web/PRODUCT.md): short entry point linking to the authoritative product brief and status.
- [Decisions](docs/DECISIONS.md): active rationale and tradeoffs.
- [Task log](docs/PROMPT_LOG.md): significant outcomes and historical record links.

Do not commit credentials or treat historical tests as current results. No automatic commits, pushes or deployments.

Project management: open a project, then Settings to rename it, change its exact submission origin, or permanently delete it with its reports. Origin changes require confirmation; stale edits require reload. `pnpm test:projects` uses newly created synthetic data and deletes only its own projects/reports. It starts a separate fixture on 4187 as well as the report-test services. To test an existing production preview, set `REPORTS_BASE_URL` and ensure its `REPLAY_ORIGIN` is `http://127.0.0.1:4191`. Do not stop unrelated servers.

Internal motion: B authentication and A product chrome share an ambient pause control and live reduced-motion support. `pnpm test:motion` uses the configured development Clerk user, creates a uniquely labelled synthetic project and deletes that project during cleanup. No auth state/traces are saved. The standalone widget uses native animation and retains explicit recording/submission. See [INTERNAL_UI.md](docs/INTERNAL_UI.md).
