# Unravel

A browser bug-reporting, session-replay and regression-test generation project for an SDE portfolio.

**Current:** Next.js application foundation with the approved cinematic entrance/hero. Account access, SDK recording, report persistence, replay and test generation are not implemented yet. Clerk + Neon are approved for a later milestone; no service has been provisioned.

## Development

Use Node 22.18.0 (see .node-version) and the pinned pnpm 10.34.9 through Corepack. No Docker, database or API key is needed for this milestone.

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open http://127.0.0.1:3000. The /app route is an honest foundation shell, not an authenticated dashboard. The original Vite study remains unchanged at prototypes/landing-motion, independently runnable with its existing npm commands. The Question Submission fixture remains independent under fixtures/test-site.

## Checks

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm browsers:install
corepack pnpm test:e2e --project=chromium
corepack pnpm start
```

Playwright starts a local development server if port 3000 is free. Set PLAYWRIGHT_BASE_URL to target another running server. Browser tests run sequentially with retries disabled; traces/snapshots are retained on failures. Browser installation preserves older tool caches. CI hardware/software rendering is not a visual-performance benchmark.

For a production preview, stop the development server before running start on the same port. /motion-capture is development-only unless explicitly enabled with MOTION_CAPTURE=1; it returns 404 in normal production.

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

- [Agent guidelines](AGENTS.md): starting context and engineering rules.
- [Project status](docs/PROJECT_STATUS.md): actual state, verification and blockers.
- [Project brief](docs/PROJECT_BRIEF.md): users, product requirements and boundaries.
- [Architecture](docs/ARCHITECTURE.md): implementation boundaries and lifecycle.
- [Development plan](docs/DEVELOPMENT_PLAN.md): milestone acceptance criteria.
- [Design](docs/DESIGN.md): current approved visual behavior.
- [Decisions](docs/DECISIONS.md): active rationale and tradeoffs.
- [Task log](docs/PROMPT_LOG.md): significant outcomes and historical record links.

Do not commit credentials or treat historical tests as current results. No automatic commits, pushes or deployments.
