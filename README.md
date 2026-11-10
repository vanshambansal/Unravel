# Unravel

A browser bug-reporting, session-replay and regression-test generation project for an SDE portfolio.

**Current:** Approved cinematic landing, authenticated project onboarding, and a local standalone recording SDK. Email-code/Google authentication and private project onboarding were verified against Clerk/Neon. The SDK captures sanitized rrweb/actions/errors/network metadata in memory; report submission, replay UI and test generation are not implemented.

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
corepack pnpm sdk:measure
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

Open http://127.0.0.1:4173 and explicitly start recording before reproducing the intentional HTTP failure. Data stays in the tab. The development-only Next.js integration harness is /sdk-lab; it returns 404 in production. `test:sdk` uses its own fixture (4183) and Next.js (3013) servers; those ports must be free. Stop any other Next.js development instance for apps/web first (Next permits one dev process per app directory). No service credentials are required by SDK checks. Browser recordings use synthetic data only. `sdk:measure` requires a completed package build and reports actual raw/gzip bytes; it is not a performance guarantee.

## Authentication and project persistence

Configure apps/web/.env.local using apps/web/.env.example and [SERVICE_SETUP.md](docs/SERVICE_SETUP.md). Never paste or commit secrets. Review generated SQL in apps/web/drizzle before applying it.

```powershell
corepack pnpm db:check
corepack pnpm db:migrate
corepack pnpm test:integration
corepack pnpm test:auth
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
- [Agent guidelines](AGENTS.md): starting context and engineering rules.
- [Project status](docs/PROJECT_STATUS.md): actual state, verification and blockers.
- [Project brief](docs/PROJECT_BRIEF.md): users, product requirements and boundaries.
- [Architecture](docs/ARCHITECTURE.md): implementation boundaries and lifecycle.
- [Development plan](docs/DEVELOPMENT_PLAN.md): milestone acceptance criteria.
- [Design](docs/DESIGN.md): current approved visual behavior.
- [Decisions](docs/DECISIONS.md): active rationale and tradeoffs.
- [Task log](docs/PROMPT_LOG.md): significant outcomes and historical record links.

Do not commit credentials or treat historical tests as current results. No automatic commits, pushes or deployments.
