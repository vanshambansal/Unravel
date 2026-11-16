# Current technical decisions

Updated 2026-11-12. Earlier rationale and superseded experiments are preserved unchanged in [DECISIONS_HISTORY.md](DECISIONS_HISTORY.md).

## 2026-11-14 - Posthero composition review

User feedback revises the preview: remove verification disclosure, make JSON a peer of Steps/Playwright, remove local-package/public-deployment marketing discussion without inventing publication, and replace the floating header with a consistent compact shell to carry through the entrance on integration. Permit preview diagnostic layout clearance adjustments for the header while preserving the original zoom controller. Use real elapsed manual timing and a visual/focused handoff to the failed request. Preview revisions are implemented; application port and full visual acceptance remain pending.

Approved direction: one requested synthetic recording journey, preserved hero/exact diagnostic zoom, connected evidence/reviewed steps/actual adapter-generated Playwright, compact honest local setup and privacy/FAQ/CTA. Expected behavior stays developer supplied; JSON and real recorded fail/pass proof are secondary. No autoplay recording, fake test execution or unpublished registry-install claim. The plan's desktop/mobile visual checkpoint is a separate interactive preview on3040 before application integration. User visual acceptance and React port remain pending. [Evidence and verification boundary](audits/LANDING_STORY_PREVIEW_2026-11-14.md).

## Application boundary and packaging

**Decision:** One Next.js App Router + TypeScript application for marketing, authentication/dashboard and initial Node APIs. pnpm workspaces; no Turborepo/Nx or separate Express server. Create SDK/contracts/test-plan packages only when used.

**Why:** Minimize deployment/integration boundaries while keeping server services modular. The removed application did not survive; reuse the accepted scene instead of rebuilding it. Existing Node 22.18.0 satisfies verified Next 16.4.6 and pnpm 10.34.9 engine ranges.

## Motion reuse and lifecycle

**Decision:** Retain vanilla Three.js 0.187.0, GSAP 3.15.1 and the exact accepted shaders/assets/choreography. An effect imports a root-scoped mountLandingMotion controller returning cleanup. No React Three Fiber migration.

**Why:** A new rendering abstraction adds rewrite risk without solving a current requirement. Root scoping, async cancellation, proper disposal and route-isolation tests address the real integration work. The original Vite study remains unchanged as the comparison reference; retirement requires a later explicit decision and asset-pipeline migration.

## Managed services - configured for Milestone 2

**Decision:** Clerk for developer authentication and Neon PostgreSQL with Drizzle/node-postgres. The user created the development provider projects; Milestone 2 connects them and applies reviewed schema migrations. No Docker or agent-provisioned provider project.

**Why:** User selected managed services to prioritize completion. The application still owns authorization, validation, privacy and anonymous-ingestion protections. Keep credentials local and review provider limits/costs before any upgrade or deployment.

## Testing and supported tooling

**Decision:** Keep Node's runner for pure behavior tests; add pinned Playwright Test 1.65.0 for repository-run browser checks. ESLint 10.14.0 with maintained TypeScript ESLint 8.72.2 and official Next/React Hooks plugins; TypeScript 5.9.3 remains compatible with their peer ranges.

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

## Report completion and release safeguards - 2026-11-12

**Decision:** Editable descriptive metadata and Open/Resolved use their own optimistic report revision; immutable recording/events/digest and test-plan revisions remain separate. Server search uses literal title/description matches and stable 20-row offset pages with count/rows from one snapshot. Adjacent known-target fill updates are grouped only for display and can be expanded to raw events.

**Why:** Complete everyday triage without inventing teams, assignments or analytics. Existing reports default Open through an additive migration. Offsets are sufficient for the bounded MVP; concurrent inserts between page visits can shift boundaries, so no cross-request snapshot guarantee is claimed.

**Decision:** Anonymous ingestion gets shared PostgreSQL fixed-window budgets (30/minute, 200/UTC day per project), bounded 1,000-report/100 MB project storage, read/upload deadlines and fail-closed public opt-in. Database time determines windows; project locking serializes storage/origin admission and preserves identical retries. Owner-managed retention remains unchanged; no destructive expiry job is introduced. HTTPS replay uses an explicitly separate trusted origin with exact parent/Host checks.

**Why:** Reuse existing persistence rather than add Redis/queues/providers, bound exposure, and avoid trusting per-process rate counters or forged forwarding headers. Edge/global abuse prevention, public certificates/proxy, live Clerk and privacy/retention approval remain release gates; config acknowledgements are not proof of infrastructure. See DEPLOYMENT.md.

**Decision:** Completed non-drag touch taps on launcher/move buttons are handled at pointer-up, with a delayed compatibility click suppressed. Start/Submit remain explicit separate controls. The observed failing Chromium gesture emitted pointer-up without click; the replacement must keep dragging capture-free and preserve keyboard/mouse behavior. Real devices remain unverified.

## 2026-11-12 - Capture corrections, account closure and landing extension

- **Ordinary controls:** retain SVG replay blocking but resolve semantic clicks to safe HTML controls. Add optional masked multi-value selects to existing versioned contracts/plans rather than silently exporting the first value. Missing fields preserve old scalar recordings; strict older servers reject newer fields. Native option-state mutations keep replay evidence self-contained. No privacy default is relaxed.
- **Account closure (explicit user approval):** disable intake and retain projects/reports/evidence. Use an idempotent owner block and signed Clerk `user.deleted` webhook, with project-lock ordering shared with admission. This avoids destructive retention decisions and per-upload Clerk lookups. Hosted delivery remains an operator gate; no automatic data deletion/recovery is implied.
- **Landing:** extend the accepted storyboard using HTML/CSS and existing GSAP. Scale the actual request badge in one bounded desktop native-scroll stage; mobile/reduced-motion remain consecutive sections. Reuse the actual plan adapter for synthetic code and preserve the cinematic renderer. A second WebGL scene, new motion library or replacement visual direction would add cost without solving this task.
- **Verification output:** support a constrained optional `.next-*` output directory so test/build processes can avoid the user's active development output. Transient Neon DNS failures required an ignored process-local DNS cache during verification; TLS remained verified and saved environment/production source were not changed for that workaround. It is not a deployed resilience guarantee.


## 2026-11-12 ? Performance without a visual rewrite

Use ResizeObserver-owned ray sizing, a memoized evidence list and elapsed-time-bounded existing quality adaptation. Separate simulation-delta clamping from actual frame diagnostics. These address observed repeated work and extreme-stall response without changing the camera, shader or artwork. Retain the existing adaptive degradation policy; on persistently slow devices it activates sooner. Do not claim FPS gains from short software-WebGL samples or replace effects for benchmark scores. Real-hardware and authenticated verification remain explicit gates; current evidence lives in the performance audit.


## 2026-11-12 - Prepare exact shader variants without reducing quality

Use Three compileAsync for the composer offscreen render target and KHR parallel ray-program completion before first-frame reveal. Default-framebuffer precompile prepared different color-space/tone-mapping variants and left first-use stalls. Preserve all visual parameters and generation/disposal boundaries. Measure startup and steady rendering separately; faster startup does not establish smoother scrolling. Keep Clerk DNS failures separate from frontend animation costs and do not bypass its protection. Hardware evidence and remaining acceptance live in the hardware performance audit.

## 2026-11-12 - Local authentication and measured responsiveness

Use a normal-network paired local preview with exact replay parent origin and no application credentials in the player environment. Keep Clerk security and owner enforcement unchanged. Bound private-route prefetch to actual intent and show immediate feedback. Deduplicate project reads only within a server request; use a single SQL snapshot for report count/page rather than persistent private caches. Separate editor document updates from configuration and cache applied-plan analysis. Deliver existing internal artwork through the established Next optimizer. On explicit constrained-resource hints, reuse the static landing with voluntary Enable3D; unknown/capable hardware keeps full quality and reduced motion takes precedence. Numeric timings and whitelisted storage codes support diagnosis without logging evidence or secrets. Cold database latency remains unaccepted; no speculative retries or new infrastructure. Evidence: audits/AUTH_RESPONSIVENESS_2026-11-12.md.

## 2026-11-13 - Phase 0: Bug fixes, database query optimization and replay state retention

- **Sticky footer clearance:** Added `padding-bottom: 96px;` to `.unravel-workspace .test-generator` so bottom step actions and editor lines scroll completely above `.generator-action-footer` (`position: sticky; bottom: 16px; height: 78px;`), eliminating click blocking.
- **SDK widget dock stop:** Transitioning to `describe` guarantees `opened = true` so stopping recording from the minimized dock displays the description/submission form rather than collapsing back to the launcher pill.
- **Database query optimization in `plans.ts`:** Created lightweight `assertOwned` check in `repository.ts` / `service.ts` to assert report ownership without downloading the heavy `events` JSONB column in `savePlan`. In `readPlan`, parallelized the report detail and test plan draft queries with `Promise.all`.
- **Replay player state retention and offline fallback:** Kept `ReportViewer` mounted in the DOM across `ReportWorkspace` tab switches (using CSS `display: none` when hidden) to preserve player scrub position and frame channel. Added a clean dark fallback UI with `pnpm replay:dev` guidance when `127.0.0.1:4192` is offline, hiding the raw Chromium connection-refused iframe.
- **Reports search soft navigation:** Created client search form `ReportSearchForm.tsx` using `useTransition` and `router.push`, preserving 100% server-side query execution and pagination while eliminating full-document browser reloads.

## 2026-11-13 - Phase 1: Translucent smoked glass, Raycast button craftsmanship & route skeletons

- **Reversion of rejected 3D mockup:** Reverted the experimental 3D deconstruction stage on `/sign-in` and landing louvers. Restored the authentic spacious two-column layout and architectural atrium background (`hero-atrium.png`).
- **Smoked glass depth & hairline borders:** Transformed `--ui-surface` to translucent smoked glass (`rgba(16, 18, 24, 0.68)`) with `backdrop-filter: blur(20px) saturate(160%)` and replaced heavy opaque borders with crisp hairline borders (`1px solid rgba(255, 255, 255, 0.08)` and `inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`). The architectural hallway and ambient `MaterialLight` now glow softly through surfaces without reducing text legibility.
- **Raycast-style interactive controls:** Solid pure white (`#ffffff`) primary action buttons with black text (`#0a0a0c`), 8px radius, subtle hover lift (`translateY(-1px)`), and soft depth shadow. Translucent smoked glass secondary buttons and non-underlined muted text links.
- **Route prefetching skeletons:** Created matching layout skeletons in `projects/loading.tsx` and `projects/[projectId]/reports/loading.tsx` with subtle shimmer animation (`@keyframes ui-skeleton-shimmer`) for instant visual feedback on navigation.

## 2026-11-13 - Phase 2: Investigation Workbench & Test Studio Polish (Options B & C Eliminated)

- **Permanent elimination of Options B & C:** Per user directive, Option B (landing hero lighting blades / louvers) and Option C (authentication 3D stack / contraptions) are permanently eliminated. The landing hero doorway and Three.js entrance sequence remain 100% original, and the sign-in screen remains authentic, calm, and spacious.
- **Replay player frame & obsidian background:** Replaced the unstyled `#eeeeeb` container in `.report-player` with deep obsidian `#08090d`, a 1px hairline border `rgba(255, 255, 255, 0.08)`, and a subtle inner shadow. When the isolated replay host (`127.0.0.1:4192`) is running, recorded DOM viewports render cleanly without white staging flashes.
- **Multi-track timeline & telemetry badges:** Refined `.report-timeline` and `.report-controls` with smoked glass background (`rgba(10, 12, 16, 0.70)`), warm crimson scrubber accent (`#ff4d61`), hairline borders, and Raycast-style segmented filter buttons (`All`, `Actions`, `Network`, `Errors`, `Navigation`). Telemetry badges use subtle semantic tints rather than heavy boxes.
- **Test Plan Studio & CodeMirror editor theme:** Refined `.report-workspace-tabs`, `.generator-sequence`, and `.generator-action-footer` with smoked glass containers and top specular edge highlights. Rebuilt the CodeMirror Playwright editor theme in `PlanCode.tsx` with translucent obsidian background (`rgba(10, 12, 16, 0.72)`), dark gutter strip (`rgba(8, 10, 14, 0.85)`), muted line numbers, pure white caret, clean selection background (`rgba(255, 255, 255, 0.12)`), and crisp syntax token coloring.
- **Verification:** Verified live in headless Chromium via Clerk authentication. All 43 unit tests and TypeScript typecheck passed with 0 errors. Captured live screenshots: `live-investigate-phase2.png`, `live-plan-phase2.png`, and `live-plan-code-phase2.png`.

## 2026-11-13 - Phase 3: Mobile viewport verification, CSS token consolidation & Tailwind decision

- **Mobile Viewport Verification (`390Ãƒâ€”844` on iPhone 14 Profile):** Completed end-to-end audit across all internal screens (`/app/projects`, `/app/projects/[projectId]/reports`, `/reports/[reportId]` Investigation & Test Plan steps/code, `/setup`, `/settings`). Verified `scrollWidth <= clientWidth` on every route with 0 horizontal overflow. Confirmed touch targets, CodeMirror scrolling, and sticky footer positioning on narrow screens.
- **CSS Token Consolidation:** Unified root `--product-*` and `--ui-*` tokens at `.unravel-workspace` in `workspace.css`. Replaced legacy opaque `#111318` surface and `#30343e` border defaults with authoritative translucent smoked glass (`rgba(16, 18, 24, 0.68)`), hairline border (`rgba(255, 255, 255, 0.08)`), and warm crimson highlight (`#ff4d61`).
- **Historical Tailwind & shadcn decision (superseded as a standing restriction on 2026-11-14):** This entry previously recorded a declined migration. Its dependency-count, build-speed and generic-design rationale is not a general basis for rejecting these tools. Current adoption guidance is recorded below; no migration is authorized merely by changing that guidance.
- **Verification:** `corepack pnpm test` (43/43 pass), `corepack pnpm typecheck` (0 errors), and `corepack pnpm build` (clean Turbopack production build in 1.6s).

## 2026-11-13 - Hydration Error Resolution & Raycast-Grade Search Bar Upgrade

- **Next.js Hydration Error Resolution:**
  - Resolved `In HTML, <div> cannot be a descendant of <p>` during client hydration at `reports/loading.tsx`.
  - Updated `PageHeader` in `apps/web/src/features/workspace/compositions.tsx` to conditionally render `<p>` only when `context` or `description` is a string, and `<div>` for arbitrary React nodes/JSX.
  - Updated `apps/web/src/app/(product)/app/projects/[projectId]/reports/loading.tsx` to use inline elements (`<span className="ui-skeleton" style={{ display: 'inline-block' }} />`) for text placeholders.
  - Verified 0 hydration errors in Chromium via live Playwright test.

- **Raycast / Linear-Grade Search Bar Upgrade:**
  - Upgraded `ReportSearchForm.tsx` from clunky static form inputs into a unified translucent smoked-glass command bar (`rgba(16, 18, 24, 0.68)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.08)`).
  - Integrated SVG magnifying glass icon, subtle placeholder (`Search reports by title or descriptionÃ¢â‚¬Â¦`), and `<kbd>/</kbd>` shortcut pill.
  - Implemented debounced live search (220ms) as the user types using React 19 `useTransition` and `router.push`, keeping the input focused and responsive without page reloads.
  - Implemented instant auto-filter on status dropdown change (`All statuses`, `Open`, `Resolved`).
  - Added quick clear button (`Ã¢Å“â€¢`) inside the search field to reset text and re-trigger search in one click.
  - Added global `/` keycap shortcut to focus search from anywhere on the page, and `Escape` to clear/blur.
  - Added active filter chips row (`Active: Query: "..." Ã¢Å“â€¢   Status: Open Ã¢Å“â€¢   Clear all`) with one-click individual filter removal and global reset.
  - Verified full responsive collapse on mobile (390Ãƒâ€”844) with zero horizontal overflow.
  - Verified `corepack pnpm test` (43/43 passing), `corepack pnpm typecheck` (0 errors), and `corepack pnpm build` (1.8s Turbopack build).

## 2026-11-13 - Interaction lifecycle and native-scroll camera motion

The user explicitly requested implementation beyond the Antigravity audit. Cancel debounced search when leaving, retain replay position while explicitly pausing the inactive panel, and provide delayed-host recovery and manual retry. The player clock runs during playback. Concurrent query timings measure each operation independently. Keep native scroll as the target and follow the existing camera path with refresh-rate-independent exponential interpolation. Skip and Replay snap immediately. Upload ray constants on initialization or shape/size changes and upload time/pointer values per frame. These changes address reproduced navigation, idle work and uneven movement. A depth-prepass experiment was removed after inconsistent end-to-end timing. The approved scene and posters keep their existing renderer output. No dependency or infrastructure change.

## 2026-11-13 - Measured intermediate GPU tier

Keep full rendering on fast devices. After warmup and two sustained poor-frame windows, reduce scene resolution gradually toward an absolute0.8 pixel ratio while retaining cinematic effects. The90Hz panel and GPU probes justified testing this tradeoff. Standard-DPI alternating samples improved median cadence and high-DPI samples improved median and p95. Tail spikes remain documented. Four full-resolution captures matched the baseline byte-for-byte, and existing poster binaries were retained with refreshed provenance. Live search also tracks request intent and local edit versions to protect concurrent typing. Replay loading feedback appears promptly and its60-second retrieval bound allows slow bounded recordings to recover.

## 2026-11-13 - Optimized fallback-image delivery

Use the existing Next image optimizer at quality90 for desktop/mobile scene posters, including reduced-motion and JavaScript-disabled views. Hardware Chrome measured about95% lower hero transfer sizes. Preserve original PNG reference assets and native UI/3D rendering. Rendered fallback images were visually inspected. No codec dependency or hosted CDN setup was added.

## 2026-11-13 - Approved native-like responsiveness and entrance fidelity

The user approved the complete performance discussion and implementation. Retain the architectural scene and product identity while repairing motion, light and edge consistency; this supersedes earlier literal entrance-preservation wording. No new infrastructure, provider, dependency, replacement scene, deployment or commit is selected.

Stream authorized workspace chrome independently of project navigation data. Share bounded route-preparation readiness inside one authorized workspace; Next owns its authenticated browser-memory payload cache. Prepare one likely project destination at idle and other destinations on shorter hover/focus/touch intent, respecting resource hints. Use Next's invalidation callback; successful report edits refresh the router cache. One report instance may anticipate and share a plan read for10s; explicit reload, expiry, failure and teardown discard it. No private evidence/draft storage or persistent server data cache is added.

Read owner-joined evidence and the optional saved plan in one database snapshot/lease. Numeric connection/query/generation timings distinguish acquisition from execution without SQL or identities. Observed reconnects near560ms versus warm query90ms justify extending the same maximum-five-client pool's idle reuse from30s to120s, with a300s connection lifetime and no background keepalive query. Truly cold acquisition remains a network cost.

Camera following uses48/s and presentation follows the same visual progress. Keep Skip/Replay immediate and native reverse scrolling. Anchor fixture lighting and reflection strength, slow and neutralize the pale procedural shafts, retain moving haze, restore full FXAA edge search and improve reflection sampling. Render fresh reflections on every camera change; at rest reuse them for at most100ms of ambient time. Allocate65% linear raster size to broad bloom independently of the main scene. A full-scene multisampling trial showed no speed advantage and was removed. Regenerate the four scene-derived fallback posters; preserve the original Vite reference. Verification and limits belong to the implementation audit/status.

A controlled same-page compositor comparison isolated the two intersecting ray-canvas CSS masks: normal median22.2ms versus11.4ms with masking removed, reproduced when masks were restored; removing navigation blur had little effect. Preserve the aperture by applying equivalent CSS-coordinate alpha ramps in the existing ray fragment shader, updated only on shape/font/size changes. This removes compositor mask surfaces without removing the light or its framing. Measure the shipped shader implementation separately from this diagnostic ablation.

## 2026-11-13 - Search simplicity, cached primary navigation and steady architecture

The user requested concrete search/loading/flicker fixes, more convincing entrance materials and sustained/reverse-motion investigation, with later landing changes limited to ideas. Remove nested search borders and duplicate browser/custom clear controls; retain URL-based server search and keyboard/race behavior. Honor explicit full prefetch on the two primary sidebar routes using stable Next Link behavior rather than enabling experimental staleTimes globally. Check cached revisits and logout isolation; preserve explicit refresh after mutations.

Anchor pale light time/sway and opening pointer illumination, align narrowed emitters to authored boundaries/depth, reduce excessive bloom/spill and use bounded anisotropic PBR filtering. Normal scene resolution now floors at1.0 for stable edges; this supersedes the earlier0.8 normal tier, while severe fallback remains. Replace drifting haze with fixed architectural atmosphere and reuse the completed room image when camera/viewport/quality are unchanged. Rays repaint on shape/pointer changes only. This directly removes stationary GPU work without a new renderer or dependency; ambient bookkeeping/pause remains separate from drawing. Record moving-frame costs honestly rather than equating idle rAF cadence with rendered FPS. No replacement scene or landing copy redesign is selected.

## 2026-11-13 - Keep completed collections visible while navigating

Production full prefetch already reused collection data, but development does not run that prefetch and per-collection loading boundaries replaced completed views with skeletons. Retain the skeleton components as reusable feature code and remove their automatic route registration. Keep the first-workspace/auth loading and error boundaries. The existing transition now holds useful content until destination data is ready, with immediate link pending feedback. Preserve stable full prefetch and refresh-on-mutation; do not introduce experimental global cache settings or an additional private-data cache merely to mimic production prefetch in development. Real delayed-response and repeated-navigation tests own acceptance.

## 2026-11-14 - Research components and evaluate adoption on merit

The user explicitly adopted the component-research guidance now in AGENTS.md. Agents should discover, recommend and adapt suitable components rather than requiring the user to select each one. Existing CSS and earlier no-migration wording are not blanket restrictions on library use. Evaluate concrete benefits and costs, including compatibility, accessibility, performance and maintenance. Discuss major visual or stack changes before implementation. This supersedes the standing restriction implied by the Nov13 Tailwind/shadcn entry. This discussion authorizes guidance updates only, not a UI redesign, dependency installation or stack migration.

## 2026-11-14 - Landing composition integrated

User approved revised preview and application integration. apps/web now renders the approved story with one fixed nav spanning entrance/footer, scoped CSS and a disposable vanilla interaction controller, consistent with the existing motion architecture. Synthetic markup is a trusted build-time constant; actual example data remains server supplied. Retain architecture motion controls separately. Preview-stage approval gate is satisfied; integration on original3000 is implemented. Prior preview-only notes are historical.

## 2026-11-14 - Preserve cinematic DOM and ownership

The rejected shared-header integration removed a required replay element and broke initialization. Restore the exact original Landing.tsx and cinematic header/control placement; keep posthero navigation inside its own section. Preserve stable nodes used by the cinematic controller, including #replay, rather than replacing DOM after mount. Avoid page-wide anchor offsets that leave the scene visible after entering product content. This supersedes the earlier fixed-header integration decision after the user's rejection.

## 2026-11-14 - Independent rays and emitter depth

Start independent rays before architectural initialization completes, retaining poster until the first scene frame. Guard preload behind reduced-motion/resource decisions. Use reference rose/cool hero colors and a steady opening; preserve cached ray drawing buffer. Separate flush emitters through polygon depth offset. Reject expensive multisampled composer targets after local motion measurements; retain FXAA and stationary caching. [Evidence](audits/RAYS_STABILITY_2026-11-14.md).

## 2026-11-14 - User-operated independent SDK demos

Use two projects outside the workspace membership, with actual local tarball installation and the same mountWidget effect/cleanup as website SdkSetup. Next uses root layout/client reporter; React uses root component and a small esbuild-based local server. Exact origins4200/4201 need separate user-created project registrations. Leave public-ID placeholders so the user tests setup manually; never imply synthetic-ID smoke validates ingestion. Existing replay4192 is reused locally; no backend/database change.

## 2026-11-14 - Explicit static text onboarding

Keep mask-by-default policy. After user approval, expose an optional SDK setup toggle for `[data-unravel-safe-text]` using existing allowTextSelectors. Describe narrowly marked public text and warn against broad/user-content selectors. Keep values masked/passwords blocked and old evidence immutable. Add contextual report explanation and require fresh capture. No automatic static-text classification or default capture expansion.


## 2026-11-14 - Visitor-selected recording modes (approved)

User explicitly approved two simple modes after clarifying that ordinary rendered page text, including echoed names/values, should stay visible without private-text inference. Widget defaults to Mask entered values; visitor may choose Full-content recording to include sensitive entered values. Mode is chosen before Start, frozen through review/retry, and reset after discard/Done. Exclude SDK UI, developer-blocked sections and hidden/unsupported resources in both modes; do not relax replay script/resource isolation. Preserve legacy low-level selector behavior when no explicit mode is supplied. New optional captureMode metadata in existing recording JSON controls server password-attribute retention. No DB migration or old-evidence rewrite. This supersedes prior always-blocked visible password controls and static-marker-only widget policy.

## 2026-11-14 - Readable actions and replay input timing

Record optional public targetLabel metadata only for the explicit visitor modes, without reading control values; preserve legacy strict behavior. Keep selectors as the technical execution identity. Existing reports derive labels from their sanitized initial snapshot only; missing/dynamic labels fall back to a generic control. Original evidence remains immutable. Record rrweb inputs immediately rather than on delayed last sampling. Historical action selection can seek to a same-node, same-value input within two seconds; show that captured-state timestamp separately and keep the action timestamp unchanged. Put static recording-mode copy in the server page to avoid adding another hydrated viewer branch. No suppression of hydration diagnostics or relaxation of replay isolation.

## 2026-11-15 - Approved internal performance pass

The user approved the revised measured plan after comparing Antigravity's diagnosis. Remove private pointer gradients, nested blur and layout/entrance motion, retaining static hierarchy and immediate button/selection feedback. Separate sign-in atmosphere from authenticated runtime imports. Keep Next.js and native route caching, use public prefetch APIs and avoid duplicate manual preparation for full-prefetch Links. Keep the static template wrapper because tested deeper navigation retained it. Instance-specific control IDs handle Next Activity-retained DOM. Add numeric private-read timing and an owner-filtered setup EXISTS query. Lazy-load/prepare the generator while preserving drafts and paused replay. A125s idle experiment measured 575ms reconnect with the old limit versus 0.7ms reuse with a300s candidate, so extend app pool idle/lifetime to 300s/1800s at max 5. No provider setup, migration, persistent private cache or new runtime dependency. Physical-device and remaining cold-network acceptance stays explicit.

## 2026-11-15 - Large evidence follow-up

Bound rendered evidence at100 rows per page after a valid4MB recording produced85k DOM nodes. All events remain available through direct page selection and native controls. Preserve external/repeated evidence selection and immutable recordings. Static crimson tint remains a proposal pending visual implementation.

## Static workspace brand accent - 2026-11-15

User approved a faint static crimson glow based on the existing landing reference, subject to performance verification. Use a single radial background on the existing opaque workspace frame. Keep task surfaces readable and preserve the landing. No pointer tracking, animation, backdrop blur, whole-page opacity or dependency is required. Three user-requested checkpoint commits precede this visual change.

## Workspace menu and interaction cleanup - 2026-11-15

User requested an opaque project menu matching the application, a chevron closer to its label and removal/cleanup of warm click highlights. Use solid charcoal for the menu, a content-sized trigger with bounded label truncation, neutral keyboard focus and pending-link feedback, and immediate readable button presses. Preserve native popover keyboard/dismissal behavior and explicitly close on destination selection. No blur or animation is added.

## 2026-11-15 - React uses the shared recording SDK

The two recording modes and action-label fixes belong to the framework-independent SDK. React's discrepancy was an outdated independent tarball installation, not a separate React privacy implementation. Preserve the user's copied reporter/project configuration; refresh the installed artifact and browser bundle. Replacing the same local archive name/version may require forced reinstall because a normal add can reuse stale contents. Document this local-only distribution limitation; do not introduce a second React implementation or claim npm publication. Keep real report submission manual during synthetic integration checks.

## One persistent landing navigation - 2026-11-15

User approved a complete fixed header from the entrance onward, rather than revealing links at the hero. Consolidate the stage and story headers into LandingNavigation outside the stage. Keep destination links available immediately; move Skip intro outside the navbar and motion controls into Display options. Preserve native section anchors, reduced motion and renderer resource/lifecycle behavior. Keep the public landing statically generated rather than adding session/provider work for this visual task.

## 2026-11-15 - Diagnostic visibility and native replay correction

User explicitly requested readable networks/errors in both visitor modes. Include bounded URL paths and error messages in those modes; retain legacy low-level opt-ins and exclude network bodies/headers/cookies/query/fragment. Explain that messages/paths may contain user text. Preserve native details/dialog open state and the rrweb modal marker through closed validation. Serialize open as empty-string/null for rrweb, accepting and normalizing earlier boolean forms only at intake. Retain auto/percentage dimensions through available Typed OM without allowing arbitrary CSS or external resources. Keep original saved evidence immutable, replay scripts disabled and existing isolated topology. Add a retry discard exit with a truthful already-delivered warning, repair source mojibake and use hash-suffixed local archives to prevent stale independent installations. Restore the existing3033 service rather than changing the user's reporter to another origin. No public readiness/publication claim.

## Cinematic-first staged navigation - 2026-11-15

The user rejected the full fixed landing navbar after viewing it, then approved minimal brand/Skip intro over the architecture and practical navigation only in the product section. Supersedes the earlier fixed-header direction. Use absolute positioning within the existing cinematic stage and section-scoped sticky product navigation, without a new scroll animation. Remove the pause menu; preserve reduced motion and resource fallback. Resolve session awareness through a lazy boolean-only no-store endpoint using existing Clerk middleware, keeping public HTML static and avoiding a landing Clerk provider/database read. Private authorization remains unchanged.

## Single continuous header correction - 2026-11-15

User clarified that hero and content must share one navbar, with no second bar below the hero. Implemented one LandingNavigation instance outside the scene: transparent gradient backing, brand/Skip intro during the entrance, full links from hero onward, same position through content. The existing choreography toggles navigation-ready; no extra scroll listener. Session awareness and removed pause menu remain. Supersedes the two-header staged approach. Final `.next-single-nav15` build, focused lint and six headed-Chrome tests passed; desktop/mobile hero renders inspected. Preview remains3038/player4210; changes uncommitted.

## 2026-11-15 - Entrance/detail UI corrections

User asked for steadier third-pole/left-rim lights, reduced doorway spill, visible demo recorder, balanced FAQ, brand-to-hero navigation and readable account UI. Correct narrow geometry/depth separation and light-source bounds without adding render passes or changing the original GLB/reference. Make the demo action directly available and keep a restart; remove hover displacement that oscillates after text/layout changes. FAQ uses one reading column instead of filling a left rail. Brand goes to hero; only explicit Back to entrance restarts. Use per-UserButton/UserProfile appearance overrides so auth-page translucency cannot leak into account portals. No account behavior/provider change, new UI dependency or visual-world replacement.

## 2026-11-15 - Floating recorder and paired replay startup

User clarified that the synthetic recorder must overlap the example website like the real SDK, not sit below it. Move the recorder inside the example browser and use absolute bottom-right positioning with explicit dark-widget foreground, responsive bounds and measured page clearance. Keep controls accessible through ready/recording/completed states; no real landing capture/upload is introduced.

The repeated replay failure was the stopped development4192 service. Root dev now starts/checks the existing isolated-player topology alongside Next rather than relying on a forgotten second terminal. Reuse only a healthy player with the expected exact parent, pass no app/provider environment into an owned player, and stop only owned child processes. DEV_PORT/DEV_REPLAY_PORT permit isolated lifecycle verification; normal defaults remain3000/4192. App-only development still needs manual replay:dev. No proxying under the dashboard or sandbox relaxation.

## 2026-11-15 - Restore the intended edge overlap

User clarified that the synthetic recorder must straddle the example browser's lower edge, half inside and half outside. This supersedes the fully-inside and fully-below interpretations. A positioned wrapper owns the browser and recorder as siblings; translateY(50%) anchors the card midpoint to the browser bottom. Reserve only half its measured height inside the page and half below before the caption. Preserve form access, full card visibility and ready/completed restart behavior at desktop and narrow widths.

## 2026-11-15 - Universal brand destination

User clarified that the top-left logo/name must open the hero from anywhere. Workspace and authentication brands now link to /#hero with framework scrolling disabled so the scene controller owns positioning. Landing brands retain #hero. Controller handles initial fragments before scene loading, fragment changes and pending renderer preparation; the story font-ready correction no longer scrolls #hero back to the entrance. Explicit Back to entrance still restarts and clears the hero fragment. No route/auth/data or visual-design replacement.

## 2026-11-15 - Brand behavior during the initial entrance

User clarified an exception to universal hero navigation: the top-left landing brand must not bypass the initial entrance. During entrance it stays at the current entrance and Skip intro remains the explicit shortcut. Once the hero/navigation is available, its target becomes #hero. Workspace/auth brands remain /#hero. The scene presentation owns the brand target/label and restores them on teardown; the default SSR target is #journey so an early click cannot accidentally skip before the controller loads.


## 2026-11-16 - Complete the portfolio project without feature expansion

The owner approved the completion roadmap: stabilize the supported recording-to-test workflow, make important code understandable, prepare/publish the SDK, verify a hosted deployment, and prepare the demonstration. Preserve the existing architecture, current two capture modes, immutable evidence, developer-confirmed assertions and separate script-disabled replay topology. No new AI service, hosted runner or scene redesign is selected. Public API/plan versions remain compatible; generator internals are separated by responsibility.

The owner selected MIT for Unravel code and approved excluding784 tracked local agent-tool files while keeping local copies. Their Git exclusions are staged; do not delete the local libraries or rewrite history. Other design/data removals remain unapproved. Core formatting is deliberately scoped, and credential-free CI does not replace provider/browser/hosted acceptance.

The owner chose free hosting tiers and accepts cold starts/quotas. The provider proposal is reviewable in RELEASE_CHECKLIST.md; no provider is provisioned or public-ingestion flag enabled. npm identity/scope and exact publication authorization remain gates; package private status stays enabled. E404 for a preferred package is not scope ownership. PROJECT_STATUS.md and the completion audit own actual verification; public readiness must follow real registry/HTTPS/provider acceptance.


## 2026-11-16 - Owner-controlled SDK scope and publication candidate

The owner authenticated as vansham and selected @vansham/unravel-sdk. Update active imports, installation snippets and independent examples together; keep public project IDs/origins unchanged. The workspace SDK stays private to prevent accidental recursive publication. Packing creates a clean public-ready tarball manifest without workspace devDependencies or scripts and with registry-ready README; only that exact reviewed artifact may be published after explicit approval. Historical @unravel/sdk references remain historical, not a second supported package. Independent example installs must use --ignore-workspace and their own lockfiles; the root lockfile must not depend on ignored local archives. Scope choice did not itself authorize publication.


## 2026-11-16 - Approved npm publication completed

The owner explicitly approved public MIT publication of @vansham/unravel-sdk@0.1.0, enabled account 2FA and completed npm browser confirmation locally. npm accepted the unchanged approved archive. Public registry metadata and downloaded SHA256 match ccd4a70bbe2c68f286a8f61521784b49f3531ba441291e7079057d3b50fc5e1e. Use the pinned registry version in active website setup and independent manual examples; preserve their existing project IDs/origins. No additional publication, application deployment, provider setup, Git commit or push is authorized by this release.


## 2026-11-16 - Interview demo routes and application readability

The owner approved application-wide readability cleanup, a concrete clutter review and an in-app /demo entry point. Preserve cinematic identity and independent integration examples. Use a normal Next route plus a standalone React build served by the main app; share only ordinary React scenario presentation. Both integrate immutable npm SDK0.1.0 through an explicit alias so a workspace build cannot masquerade as the published release. The React document imports no Next runtime. Generated bundles are ignored and built by normal development/production commands.

Use existing developer authentication and owner-authorized project APIs. Reuse the exact-origin project or create it only on an explicit click. No shared inbox, auth bypass, new database migration or provider provisioning. Anonymous users can explore the synthetic failures; saved reports remain private. Dispose local capture on route/document exit and reload restored BFCache documents rather than leave a destroyed reporter. Deliberate failure endpoint never reads/stores/logs its body.

Format maintained application/landing/example source with established Prettier settings; retain prototype/history. Add comments at engineering boundaries instead of narrating JSX or rewriting working architecture. Archive/removal candidates are reviewed in CLEANUP_REVIEW.md and remain pending specific approval. No commit/push/deployment was performed.


## 2026-11-16 - Owner-authorized GitHub publication

The owner explicitly requested logical commits and a push to the existing GitHub remote to inspect the repository structure. Use the current main branch after checking it matches origin/main; no force push, reset, history rewrite or new file removal is authorized. Commit the previously approved local-tool exclusions, tested implementation/fixtures and current documentation. Keep local tool copies and ignored build/cache/credential files. Document tracked folders versus local-only artifacts in REPOSITORY_MAP.md. This authorization does not deploy the application or provision services.
