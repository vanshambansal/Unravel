# Current technical decisions

Updated 2026-11-10. Earlier rationale and superseded experiments are preserved unchanged in [DECISIONS_HISTORY.md](DECISIONS_HISTORY.md).

## Application boundary and packaging

**Decision:** One Next.js App Router + TypeScript application for marketing, future authentication/dashboard and initial Node APIs. pnpm workspaces; no Turborepo/Nx or separate Express server. Create SDK/contracts/test-plan packages only when used.

**Why:** Minimize deployment/integration boundaries while keeping server services modular. The removed application did not survive; reuse the accepted scene instead of rebuilding it. Existing Node 22.18.0 satisfies verified Next 16.4.6 and pnpm 10.34.9 engine ranges.

## Motion reuse and lifecycle

**Decision:** Retain vanilla Three.js 0.187.0, GSAP 3.15.1 and the exact accepted shaders/assets/choreography. An effect imports a root-scoped mountLandingMotion controller returning cleanup. No React Three Fiber migration.

**Why:** A new rendering abstraction adds rewrite risk without solving a current requirement. Root scoping, async cancellation, proper disposal and route-isolation tests address the real integration work. The original Vite study remains unchanged as the comparison reference; retirement requires a later explicit decision and asset-pipeline migration.

## Managed services - approved for later, not provisioned

**Decision:** Clerk for developer authentication and Neon PostgreSQL with Drizzle/node-postgres. No provider dependency, account or database setup in Milestone 1.

**Why:** User selected managed services to prioritize completion. The application still owns authorization, validation, privacy and anonymous-ingestion protections. Review provider limits/costs and credentials locally before Milestone 2.

## Testing and supported tooling

**Decision:** Preserve the nine pure behavior tests using Node's runner; add pinned Playwright Test 1.65.0 for repository-run browser checks. ESLint 10.14.0 with maintained TypeScript ESLint 8.72.2 and official Next/React Hooks plugins; TypeScript 5.9.3 remains compatible with their peer ranges.

**Why:** Connected browser tools are useful for inspection but must not be a test-runner prerequisite. Registry installation flagged ESLint 9 unsupported; use the compatible direct plugins instead of carrying the broader preset's legacy peer dependencies. All commands are centralized in README.md. No framework or motion dependency upgrade is hidden in the migration.

## Product and design direction

**Decision:** Preserve explicit visitor recording, masking by default and an editable framework-independent JSON plan. Deterministic generation initially; Playwright is the first export. Preserve the approved Interior Architecture and UI ray treatment. Core product milestones precede full marketing completion.

**Why:** The internship portfolio needs an end-to-end regression proof. A recording supplies evidence, not intended behavior or guaranteed root cause. Figma covers consequential compositions; browser code proves motion. No LLM keys, hosted execution or new design exploration is needed now.

## Entry template

Date; decision; context/rationale; alternatives actually considered; consequences. Keep active choices here and implementation outcomes in PROJECT_STATUS.md/PROMPT_LOG.md.
