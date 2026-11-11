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

## Milestone 4 persistence and replay policy - approved 2026-11-10

**Decision:** Self-contained masked replay with original scripts/images/external stylesheet requests blocked; explicit owner-controlled report deletion and no automatic expiry during local development; provisional 5,000,000-byte complete submission limit. The user explicitly approved all three.

**Why:** Prove the reusable pipeline without silently broadening capture or resource access. Separate metadata from immutable replay payloads in PostgreSQL, atomically deduplicate by project/recording ID and compare canonical content on retries. Revalidate untrusted input on the server rather than trusting SDK sanitization. Local-only ingestion is intentionally not a public security design; CORS does not authenticate a visitor.

**Replay origin, explicitly approved:** rrweb requires access to its script-disabled inner replay document. Opaque-origin nesting prevented initialization; automatic review rejected the earlier same-origin permission combination, which was reverted. The user then approved a separate local replay-origin process. A Node-built-in server binds 127.0.0.1:4192, separate from the localhost dashboard, serves only trusted compiled assets and permits an explicit parent-origin list. Its trusted frame can access its own script-disabled child but cannot access the dashboard. Both ends validate message origin/source/channel; CSP blocks recorded resources. Browser isolation and full recording/replay tests passed; final outcomes live in PROJECT_STATUS.md. No new provider, API key, Docker, database service or deployment is required. A genuinely separate deployed origin remains a release requirement.

## Internal product direction and SDK delivery - confirmed 2026-11-10

**Decision:** Explore a spacious premium dark product identity with a compact global header/project switcher; preserve the approved cinematic landing and working backend. The SDK must provide the full floating reporting workflow, so integrators do not build buttons/forms/submission UI. Create three compositions in the existing Figma file and obtain design review before application UI changes.

**Rationale and alternatives:** Few destinations do not justify the previous wide sidebar. Borrow navigation/selection, readable code and resizing patterns where useful rather than importing complete SaaS templates or multiple animation libraries. Framework-independent widget delivery remains a boundary; React components may inspire its behavior without becoming SDK runtime dependencies. Existing privacy and isolated replay policies remain in force.

**Consequences:** The compositions are design proposals, not implementation or final visual approval. No dependency, backend rewrite, richer replay capture or public deployment is selected by this decision. See DESIGN.md for the current screens and PROJECT_STATUS.md for actual capability gaps.

## V2 approval and complete SDK widget - 2026-11-10

**Decision:** The user approved V2 for implementation, preserving V1 and the cinematic landing. Deliver the complete visitor workflow through standalone `mountWidget`, delegating to existing recording/submission logic. Use Shadow DOM styling and block the widget across shadow boundaries from recording. Keep React optional for integrators; no new component library/runtime is needed.

**Rationale and alternatives:** A separate React UI package or host-built forms would complicate the promised out-of-box integration. Existing CSS/native controls can reproduce approved proportions and accessible interactions. A keyboard/pointer divider stacks on mobile; recording can minimize without blocking the host page. Report reproduction/plan/export remain explicit future stages. Portable SDK packaging bundles shared contracts and includes local declarations, avoiding a dependency on unpublished private workspace packages. The package remains local, not published.

**Consequences:** Test widget drafts, unchanged retry, teardown/Strict Mode, privacy exclusion and real developer replay together. Default bare loopback URLs to HTTP while preserving explicit schemes and public HTTPS defaults; never silently alter saved projects. Actual checks and remaining limits live in PROJECT_STATUS.md.

## Product completion: project lifecycle - approved 2026-11-10

**Decision:** Complete workflows within V2 before another visual redesign. The first bounded task adds owner-managed rename/origin edits and permanent project deletion. Changing origin requires a UI confirmation; the stable ID and historical recordings remain. Deletion requires typing the current project name and removes its reports/payloads using existing foreign keys. No automatic repair/deletion of existing registrations is authorized.

**Rationale:** Creation without management is an incomplete lifecycle. Reuse the current validation, owner/origin uniqueness, thin handlers and same-origin bounded JSON boundary. Compare last-read name/origin in the write predicate to reject stale updates/deletions without a migration. Native modal dialogs provide keyboard focus confinement and Escape behavior without another UI dependency. Keep the fixture connection form visible until configured and report SDK load errors explicitly.

**Next approved direction, not implemented here:** Open/Resolved report triage, editable descriptive metadata, server search/pagination; then bounded styled replay with CSS/layout first while masking and disabling scripts; then JSON-plan/export. No assignments, comments, team system or image/font capture selected.

## Internal composition system - 2026-11-10

**Decision:** Following the user's request, use Raycast application UI as the primary craftsmanship reference and retain Unravel's approved V2 typography/crimson identity. Reuse page-level compositions for contained settings/forms, collections, empty states, native dialogs and investigation surfaces. Keep feature state/API behavior in feature modules; composition components contain presentation only. INTERNAL_UI.md owns the usage guide.

**Rationale:** Shared colors/buttons did not prevent disconnected page layouts. Group headers, aligned rows and contextual footers provide repeatable geometry; subtle inset surfaces and stronger floating shadows establish hierarchy without another visual-library dependency. Apply these patterns in current pages, rather than create an unused component gallery. The SDK keeps an equivalent standalone floating recipe without React or dashboard CSS dependencies. No theme switcher, sidebar destinations, new product feature or backend rewrite is selected.

## Styled replay and regression workflow - approved 2026-11-10, implemented 2026-11-11

**Decision:** The user prioritized fixing replay, a full internal-page material review and the actual reproduction/JSON-plan/Playwright milestone. Preserve existing identity/landing and masking/isolation. Use bounded computed presentation rather than loading original CSS or adding a general CSS parser/resource proxy. Only known numeric/layout/color/type values are accepted; original classes, generated content and URLs stay out. Old reports remain legacy structural replay, requiring fresh capture for styling.

**Rationale:** Restoring arbitrary stylesheets would expand resource/privacy risks and third-party asset dependencies. Computed presentation improves the supported DOM workflow while remaining self-contained, with explicit fidelity/performance limits. Synthetic fixture headings are deliberately allowed by its integration; SDK-wide masking is unchanged. Full-page compositor artifacts led to reserving actual blur for bounded floating surfaces rather than large scrolling cards.

**Regression architecture:** Add the pure local test-plan workspace using existing Zod/TypeScript, no new external library or LLM. Store one editable plan/revision per report in an additive table, cascade with report deletion and enforce owner authorization. Generation normalizes typing and click/submit pairs; unsupported actions/missing values stay review items. Assertions require developer confirmation. Server export validates stored plans and escapes literal strings. No backend execution of user code. An isolated source-patched fixed fixture preserves the original bug while proving the same downloaded file fails then passes locally. TEST_PLANS.md owns the recipe and limits.

## Decision entry format

Date; decision; context/rationale; alternatives actually considered; consequences. Keep active choices here and implementation outcomes in PROJECT_STATUS.md/PROMPT_LOG.md.


## Internal product A/B redesign - approved task, 2026-11-11

**Decision:** Treat prior V1/V2 approvals as historical design references rather than a freeze on weak presentation. Preserve product/security behavior and the approved landing. The user authorized documentation cleanup and exactly two new Figma directions; application implementation stops until visual review.

**Rationale:** Reusing a weak composition and adding surface overrides did not meet the desired quality. A framed glass workbench and an open replay-led canvas test meaningful structure, navigation and material choices. Functional verification and aesthetic acceptance are separate gates. No runtime library, CSS/Tailwind migration, API/schema change or provider setup is selected by this exploration.

**Status:** Both proposals and their responsive/state coverage exist in the original file. A is recommended, not yet user-approved. Product context for design tools links to the existing brief rather than duplicating requirements. DESIGN.md owns frame links; INTERNAL_UI.md owns the implementation boundary. Mobbin's paid-plan refusal remains a research limitation, not a claim that no relevant references exist.

## Internal composition and motion ? 2026-11-11

**Decision:** Use B authentication and A for the internal product. Add pinned Motion 14.12.0 to the web app for shared-layout selection and coordinated panel/feedback transitions. Use CSS for material light and native Web Animations for the standalone recorder.

**Why:** The user approved these compositions and expressive motion. Shared continuity needs deliberate lifecycle ownership; isolated hover/fade effects were insufficient. Keeping React/Motion out of the SDK preserves its portability. Stock multi-library effects and a React Three Fiber rewrite add cost without improving this workflow. The original landing renderer, shaders and choreography remain isolated and unchanged.

**Consequences:** Allow approved architectural artwork/light on authentication/product routes while excluding the landing renderer and 3D assets. Keep real authentication/provider configuration, server ownership checks, recording consent, original evidence and replay isolation unchanged. Use a persistent recorder material shell, unscaled text/controls, live reduced-motion support and interruptible cleanup. No public API, transport schema, database migration or provider setup change is required.

## Visitor-ready fixture and compact movable widget - 2026-11-11

**Decision:** Website developers configure project ID/application origin once. The normal Question desk fixture reads a gitignored local environment file and serves only allowlisted public SDK settings. Visitors never supply configuration. Dynamic URL/debug configuration is limited to explicitly opted-in automated test processes. No placeholder project is substituted when setup is missing.

**Why:** The previous default exposed engineering scaffolding as the product's visitor experience. SDK publication is unrelated to this configuration boundary. Existing real project/registered origin is reused; no database/provider change is needed.

**Presentation:** Keep the standalone SDK and persistent material morph. Reduce desktop width from 424 to 376px, simplify ready copy and collapse optional description. Native pointer capture and keyboard controls move launcher, recording dock and panel; reset is explicit, bounds follow the visual viewport, and session storage contains position only. No drag library or new dependency.

**Scope:** Preserve explicit Start/Send, privacy, immutable evidence, retry and teardown. The separately discussed review-first test-generator redesign is the next bounded task; no test-plan schema/export behavior is changed here.

## Review-first test generator - 2026-11-11

**Decision:** Keep the existing deterministic engine and private plan persistence. Show readable actions before technical fields; use a contextual native right-side editor, reversible exclusion/reorder, source-evidence links and a compact expected-result review. Reproduction exports validate included actions but omit assertions. Regression exports also require valid developer-confirmed expected checks. Portable JSON remains available as a labelled draft; no LLM or second test adapter.

**Compatibility:** Version 2 adds inclusion, nullable recorded source positions and typed text/visibility/URL/response/page-error outcomes. Accept version 1 through in-memory normalization without rewriting records or revisions. Existing JSONB storage and ownership/stale-save protections remain; no migration. Explicit save writes the current version. Export mode defaults to regression for compatibility with existing callers.

**Tradeoffs:** Expected outcomes cover a bounded set, not arbitrary assertion code. Response checks observe the first matching same-origin method/path before actions (query ignored). Page-error checks end with the reproduced action/check window; delayed errors need a separate completion condition. These are templates the developer confirms, not automatic diagnosis or business correctness. Unknown-target typing is no longer merged because identical tag names do not establish element identity.

## Recoverable generator and default identification - 2026-11-12

**Decision:** Use staged sheet edits, bounded in-memory undo/draft recovery and optimistic saved revisions. One lazy-loaded CodeMirror workspace owns editable JSON and read-only Playwright. css-what parses bounded supported CSS syntax in the shared plan engine before client/server export. Prepared for export always remains distinct from Not run.

**Why:** Silent field application, lost work, tiny code and syntactic false readiness were the audit's largest trust problems. A maintained editor/parser handles real history, highlighting and syntax without a new application framework. Browser storage/autosaving sensitive replacement data, a homegrown editor and treating export as execution were rejected. Current undo is bounded to 25 changes; unsaved recovery is memory-only for four reports, not durable history.

**Decision:** Prefer explicitly allowlisted test IDs, otherwise capture only bounded tag/ordinal structural paths. Preserve text/input masking; retain only the non-sensitive same-origin root by default. Omit unsupported Shadow-root hosts/subtrees instead of serializing them into rejected Next.js reports. Preserve server rejection of unsafe/unsupported replay content.

**Why:** Ordinary integrations should identify light-DOM controls without exposing arbitrary labels, IDs, user text or paths. Structural paths trade resilience for conservative privacy and need a real run after markup changes. Wider attribute/text collection or relaxed replay isolation was not selected. Shadow DOM fidelity remains unsupported. This additive recording-v1 locator and plan-v2 navigate/response-action support need no database migration; existing saved drafts/evidence remain intact.

**Decision:** Collapse focus/fill, native click/submit and bounded recent same-site SPA transition evidence only in generated plans. Keep pop navigation and original evidence. Arm response checks at their selected action, excluding older in-flight requests. Require a completion condition alongside no-page-errors.

**Why:** A duplicate navigation step should not block a usable recording. Chronology is still a heuristic, not proven causality. Controlled standard React/Next exports and positive/negative adapter execution provide stronger evidence than code inspection; they do not certify arbitrary sites or infer expected behavior.
