# Local authentication and responsiveness continuation

Date: 2026-11-12. Scope: local production localhost:3020, existing development services and database. No hosted deployment, provider settings, schema changes, new services, commits or publication in this continuation. Earlier feature and shader results remain historical in their own audits.

## Authentication findings

The agent-started preview was inside restricted network execution: Clerk server handshake requests failed with EACCES. Restarting with normal outbound access resolved this operational failure. Matching development keys and relative sign-in/up/fallback paths were valid; no authentication bypass or provider security changes were made. The user explicitly confirmed Google and email-code first factors on3020. Earlier protect-subdomain DNS warnings were also observed while login worked: the earlier hardware report's attribution of the blocker to those warnings is superseded, not proof that those DNS warnings never happen.

Focused synthetic-account checks passed on development3000 and local production3020: session, refresh, mobile project navigation, logout, protected redirect, private API401 and no private projects heading after Back. These helper tests do not independently prove delivery of either first factor; the user's confirmation supplies that evidence. No Clerk Dashboard action is presently required for this local preview. Live keys/HTTPS domain/recovery/webhook configuration remain separate release gates.

The isolated replay process previously allowed only3000;3020 could not embed it. The local preview now uses its own4191 player allowing exactly localhost:3020. The recorded-document frame remains script-disabled and separate from the dashboard origin. The user's development4192 player is independent.

## Implemented changes

- `scripts/preview-local.mjs` and `preview:local`: validate isolated output/development keys, preflight existing Clerk HTTPS/database, start matched3020/4191 processes and clean up owned children. Replay inherits only runtime OS variables and its origin configuration, never Clerk/database credentials. No provisioning/migration occurs.
- `AuthAvailability.tsx` / `AuthScreen.tsx`: loading/failure feedback, bounded slow-loading notice and explicit retry. Timers clean up; no automatic identity retries.
- `IntentLink.tsx` and workspace/project links: replace automatic viewport prefetch of many owner-private routes with cancellable150ms pointer/focus intent. Click shows pending feedback. Keep native link behavior.
- Project service React cache deduplicates reads inside one server request, keyed by owner. No persistent or shared user cache.
- Report repository uses one SELECT for count and clamped page via totals/lateral query, retaining one statement snapshot, stable ordering, ownership and metadata-only selection. Reports page parallelizes independent project lookup/list reads.
- `PlanCode.tsx` separates content synchronization from language/read-only reconfiguration. `PlanEditor.tsx` memoizes applied-plan serialization and analysis. Staged edits, history, assertions and immutable evidence remain intact; editor preparation has visible feedback.
- Numeric-only authorized plan Server-Timing separates auth/evidence/draft/generation. Safe storage diagnostics emit only whitelisted codes, never query/URL/credential/message. No speculative retry or authentication weakening.
- Internal shell serves the existing atrium artwork via Next image optimization. Original PNG1997384 bytes; measured1920px WebP51262 bytes (97.4% less transfer). Same gradient, artwork and composition; compression is not a pixel-identity claim. Final rendered desktop1440x900/mobile390x844 inspected: optimized WebP200, no raw background download, no horizontal overflow.
- Conservative landing start honors SaveData/2g/slow-2g or combined <=2GB and <=2-core hints. Unknown/normal hints retain full rendering. Lightweight view offers explicit Enable3D. Reduced motion still wins. Existing runtime poor-frame guard and prior shader startup fixes remain; normal shaders, camera, bloom and resolution are unchanged. No additional dependency.

## Measurements

Installed headed Chrome, Intel Iris Xe/D3D11, production build; DOM click capture to condition plus requestAnimationFrame, not Playwright polling duration. These are small local samples, not population percentiles or isolated randomized benchmarks. Different database/network warmth affects results. Ignored .cache artifacts are local evidence, not tracked reproducibility tooling.

| Action | Before ms | Later ms |
|---|---:|---:|
| Projects to reports |2191|1393|
| Navigation pending feedback |not captured|5.2|
| Edit report dialog |125|28|
| Edit step dialog |222|74|
| View code |248|186|
| JSON editor |1626|269|
| First generator |966|3996|

Intermediate generator runs measured574-611ms, but the later3996ms outlier must not be omitted. Relevant private/RSC requests fell16 to4 in this sampled journey. A prior baseline replay was unavailable because of origin configuration; it is not a fair replay-speed baseline. Later replay readiness passed. Five warm authorized plan reads measured230-346ms: auth1.4-2.7ms, evidence104-124ms, draft97-183ms, generation0.1-2.6ms. This identifies network/storage waits, not React or shader work, as the dominant warm plan cost. Earlier cold multi-second waits and intermittent storage503 are unresolved; newly added safe diagnostics have not yet captured a recurring error code. No claim of complete network resilience.

CPU/network simulation used the real GPU; this is not GPU/RAM throttling or a physical low-end-device test. Mobile390x844, CPU6x,150ms latency/1.5Mbps: full scene readiness25.7s before and27.6s later; simulated SaveData lightweight start6.6s, heap4.3MB versus9.3-9.6MB and zero architecture requests versus three totaling2.77MB. Lightweight readiness differs from full3D readiness; this is the cost of the chosen performance tier, not a same-quality acceleration. Desktop CPU4x readiness5.1s before/8.7s later; sampled frame p95 fell44.5 to33.5ms, but variable conditions preclude a causal FPS claim. No general full-scene startup improvement is established in this continuation.

Explicit Enable3D downloads assets and renders; live reduced motion disposes the scene; mobile bounds and reload passed. Full cinematic steady scrolling remains a separate unresolved acceptance point from the earlier hardware report.

## Verification and negative results

Lint and43 unit tests passed on final source. Final isolated production output `.next-responsive-complete` built and serves3020; final app TypeScript check passed. Final whitespace and poster integrity/freshness checks passed. Focused real PostgreSQL reports integration passed including clamped page999, empty results and Date representation. Project integration passed; initial account-closure setup hit a transient schema-creation error, then its focused rerun passed. A report rate-limit test crossed a fixed-window boundary; its synchronization was aligned to database time without raising limits.

Real headed Chrome workflow coverage across focused runs: report creation/retry/dedup/private ownership, management/search/status/23-row pagination/recovery, investigation and isolated replay,500ms seek, refresh/mobile fit, and complete generator edit/restore/cancel/apply/invalid-selector/JSON/history/conflict/recovery/download. The latest proper-cwd combined selection passed management and generator; pipeline initially failed its old child IntersectionObserver visibility check. Recorded-frame scripts are intentionally disabled and arbitrary fields may legitimately lie outside the recorded viewport. The corrected test checks the whole recorded viewport fits inside the trusted host and the host fits the screen; focused pipeline then passed unchanged500ms seek. This corrects a test contract, not replay rendering code. No single clean combined-suite claim. The fresh downloaded standalone regression was independently executed five times against the buggy fixture (all failed on the intended assertion), then five times against the fixed scratch copy (all passed), retries0 and export hash unchanged. This proof uses an isolated local fixture, not authenticated browser coverage.

Earlier wrong working-directory fixture startup and broad regex selection accidentally included project tests needing4187; connection-refused runs are retained as harness failures. A baseline typing profile timed out: no before/after typing latency claim. First-factor confirmation is from the user. Final screenshots are synthetic authenticated projects only; no auth traces/tokens retained. No original user report/evidence or prototype was deleted or rewritten.

## Remaining acceptance

Local login is verified. Local interactions and request pressure improved; a consistently delay-free entire application is not established. Data-backed navigation still takes around1.4s in the shown sample and cold generator outliers remain. Next bounded task: reproduce a slow request with numeric timing and safe database error classification, correlate it with connection acquisition/query waits, then fix only the demonstrated cause. Do not provision a database/pooler or alter authentication/provider security without discussion. Physical low-end phones, real memory pressure, Safari and production load remain unverified. User review of perceived smoothness is still required.

Final service health: preview3020, isolated replay4191, existing development3000 and fixture4184 returned200. Preview remains running for user review. No commit/push/deployment.
