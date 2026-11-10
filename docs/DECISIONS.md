# Current technical decisions

Updated 2026-11-10. Earlier rationale and superseded experiments are preserved unchanged in [DECISIONS_HISTORY.md](DECISIONS_HISTORY.md).

## Application boundary and packaging

**Decision:** One Next.js App Router + TypeScript application for marketing, future authentication/dashboard and initial Node APIs. pnpm workspaces; no Turborepo/Nx or separate Express server. Create SDK/contracts/test-plan packages only when used.

**Why:** Minimize deployment/integration boundaries while keeping server services modular. The removed application did not survive; reuse the accepted scene instead of rebuilding it. Existing Node 22.18.0 satisfies verified Next 16.4.6 and pnpm 10.34.9 engine ranges.

## Motion reuse and lifecycle

**Decision:** Retain vanilla Three.js 0.187.0, GSAP 3.15.1 and the exact accepted shaders/assets/choreography. An effect imports a root-scoped mountLandingMotion controller returning cleanup. No React Three Fiber migration.

**Why:** A new rendering abstraction adds rewrite risk without solving a current requirement. Root scoping, async cancellation, proper disposal and route-isolation tests address the real integration work. The original Vite study remains unchanged as the comparison reference; retirement requires a later explicit decision and asset-pipeline migration.

## Managed services - configured for Milestone 2

**Decision:** Clerk for developer authentication and Neon PostgreSQL with Drizzle/node-postgres. The user created the development provider projects; Milestone 2 connects them and applies reviewed schema migrations. No Docker or agent-provisioned provider project.

**Why:** User selected managed services to prioritize completion. The application still owns authorization, validation, privacy and anonymous-ingestion protections. Keep credentials local and review provider limits/costs before any upgrade or deployment.

## Testing and supported tooling

**Decision:** Preserve the nine pure behavior tests using Node's runner; add pinned Playwright Test 1.65.0 for repository-run browser checks. ESLint 10.14.0 with maintained TypeScript ESLint 8.72.2 and official Next/React Hooks plugins; TypeScript 5.9.3 remains compatible with their peer ranges.

**Why:** Connected browser tools are useful for inspection but must not be a test-runner prerequisite. Registry installation flagged ESLint 9 unsupported; use the compatible direct plugins instead of carrying the broader preset's legacy peer dependencies. All commands are centralized in README.md. No framework or motion dependency upgrade is hidden in the migration.

## Product and design direction

**Decision:** Preserve explicit visitor recording, masking by default and an editable framework-independent JSON plan. Deterministic generation initially; Playwright is the first export. Preserve the approved Interior Architecture and UI ray treatment. Core product milestones precede full marketing completion.

**Why:** The internship portfolio needs an end-to-end regression proof. A recording supplies evidence, not intended behavior or guaranteed root cause. Figma covers consequential compositions; browser code proves motion. No LLM keys, hosted execution or new design exploration is needed now.

## Developer sign-in - 2026-11-10

**Decision:** Email verification codes and Google through the existing user-created Clerk development application. Visitors remain account-free. Use maintained Clerk components inside the approved application layout, rather than a custom authentication state machine.

**Why:** The user selected passwordless email and Google. Provider components handle verification/resend/OAuth states while Unravel owns server-side authorization. Do not run accountless setup or create a duplicate application. Development Google uses shared provider credentials; production setup is a separate release task. See SERVICE_SETUP.md. Reject copied masked/mixed-environment keys before Clerk handshakes. Live verification outcomes are recorded in PROJECT_STATUS.md.

## Project onboarding and persistence - 2026-11-10

**Decision:** Start with one owner and one registered origin per project; derive ownership from the verified Clerk subject. Store no duplicate user email/password records. Use stable Drizzle 0.45.4 / Drizzle Kit 0.31.11 with node-postgres 8.23.1, avoiding release candidates for this bounded schema. Clerk Next.js 7.9.25 satisfies the installed Next/React/Node peer ranges.

**Why:** A private project workspace does not need teams, role systems, user-sync webhooks or an independent website entity yet. Atomic owner/origin uniqueness handles concurrent duplicate submissions. The beginner-friendly form previews a normalized origin before submission and leads straight to SDK setup; it never invents SDK availability. Authentication/migrations require local configuration, with no Docker or automatic provisioning.

## Canonical local origin - 2026-11-10

**Decision:** Bind the Next.js development/production preview to localhost and use http://localhost:3000 consistently in tests/capture tools and instructions. Preserve the independent Vite reference address.

**Why:** With valid keys, the 127.0.0.1 preview stalled while Next forwarded requests to localhost. The same sign-in route and real-session tests work with matching localhost origins. Avoid framework upgrades or custom authentication rewrites when a consistent local origin solves the observed problem. This does not choose a deployment domain.

## Recording implementation and approved privacy - 2026-11-10

**Decision:** Standalone TypeScript package with a small initialize/start/stop/destroy controller. @rrweb/record 2.2.2 provides recording; @rrweb/types 2.2.2 supplies event discriminants. esbuild 0.28.2 emits ESM with a lazy recording chunk and a standalone script. Zod 4.6.7 Mini owns shared runtime contracts. No React runtime, playback library, new server or LLM dependency in the SDK.

**Why:** Reuse maintained DOM capture while keeping Unravel lifecycle, semantic events and privacy explicit. ESM supports framework consumers; a standalone script proves independence with the existing vanilla fixture. Mini avoids shipping unused schema-building APIs. Vite/another application framework is unnecessary for packaging a small library. Dependencies were verified against the installed Node/TypeScript toolchain through builds and browser tests.

**User-approved privacy:** Mask page text/input values, always block passwords, omit bodies/headers/query/fragments and redact paths/error text unless explicitly allowlisted. Only synthetic fixture content/known paths/intentional error are opted in. Rebuild replay fields with strict attribute filtering before in-memory storage; checked/selected states also require opt-in. Default CSS/image/attribute removal sacrifices fidelity instead of silently accepting sensitive raw content. Exact trusted stylesheet paths are an explicit resource opt-in, not a general safe-resource guarantee. More permissive capture requires a later reviewed decision.

**Consequences:** Results remain local and may have unresolved locators/redacted values. Full playback, upload validation, retention and public-ingestion protections remain unimplemented. Limits (120 seconds / 5 MB / 5,000 events) are provisional configurable stop guardrails, not established product budgets. Keep measurements and compatibility limits in SDK.md/PROJECT_STATUS.md. No deployment, provider provisioning or package publication is authorized by this milestone.

## Entry template

Date; decision; context/rationale; alternatives actually considered; consequences. Keep active choices here and implementation outcomes in PROJECT_STATUS.md/PROMPT_LOG.md.
