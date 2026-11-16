# Engineering decisions, performance and evidence

## Optimize a measured cause

“The page feels slow” can mean slow HTML delivery, hydration, database access, a repeated fetch, excessive React work, GPU rendering or an animation that responds too late. These require different fixes.

For example, repeatedly fetching a report list is not solved by lowering 3D scene quality. A camera hitch is not solved by adding a global cache. Measure the stage, change one mechanism and rerun the relevant user journey.

## Navigation and data work

- Persistent layouts retain the workspace shell across route changes.
- Selected links prefetch route data using Next's navigation machinery; intent/idle preparation avoids eagerly preparing everything.
- A report-scoped plan loader shares an in-flight/briefly retained read between anticipation and the opened tab; it clears failures and supports explicit refresh.
- Report lists avoid replay payloads. Pagination and a bounded timeline view limit visible work.
- A bounded database pool reuses connections rather than creating a new connection for every query.
- Private reads remain authenticated and API responses remain `no-store`; this is not a global shared cache of private reports.

**Prefetching** starts likely-needed work before navigation. **Request deduplication** shares equivalent in-flight work. **Caching** reuses a result for some lifetime. They can cooperate, but they are not identical and do not remove authorization requirements. See [Next.js prefetching](https://nextjs.org/docs/app/guides/prefetching).

A cold first visit, invalidation, expired preparation or slow provider can still need a fallback. Development compilation can add latency, but production still has real network/service work. Do not promise that SSR or prefetching makes every interaction instant.

## React rendering and editor continuity

**Memoization** reuses a calculation or component result when relevant inputs are unchanged. The report viewer memoizes its evidence list and displays a bounded slice rather than rendering every event on every playback tick. A useful optimization avoids measured repeated work; wrapping every function in a hook is not a strategy.

The editor separates applied plan changes from staged field/JSON edits. It supports undo/redo, explicit save, conflict recovery and leave warnings. Some SPA draft recovery is bounded and memory-only; it is not crash-proof, cross-device persistence or a promise to recover data after every reload.

Server timing records numeric stage durations without logging evidence. A reported database delay may include connection establishment, query work and serialization; separate them before changing SQL.

## The cinematic landing

Three.js owns rendering; GSAP coordinates camera/scroll choreography. The React adapter loads the controller from a browser lifecycle. Heavy graphics stay out of the normal workspace route. Useful HTML, artwork and controls exist before the scene is ready.

Rendering is paused when unnecessary, resources are disposed on teardown, and quality can fall back when sustained performance is poor. Reduced motion and static artwork keep the page usable when animation is inappropriate or unavailable.

A **frame budget** is the time available to prepare one frame: approximately 16.7 ms at 60 Hz. CPU work, GPU work, layout/paint, shader cost, allocations and competing tabs can cause hitches. An average can hide a few very slow frames, so sustained scrolling and direction changes matter.

Lighting/edge flicker can come from overlapping surfaces, aliasing, depth precision or reflection/shadow behavior. Those are diagnostic possibilities, not a claim that every observed pole had the same cause. Inspect the scene and targeted evidence before naming a root cause. Lowering resolution alone can conceal rather than resolve an artifact.

Committed posters are checked against renderer source/assets. They are generated from the active renderer, not a dependency on the retained old prototype. Scene authoring and browser rendering are separate activities.

## Test layers and what each proves

| Layer                       | Useful proof                                                                               | What it cannot establish alone                                  |
| --------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Formatting/lint/types       | Consistent source and certain static mistakes.                                             | Correct runtime behavior or visual quality.                     |
| Unit tests                  | Deterministic validation, normalization, state and policy cases.                           | Real provider/database/browser integration.                     |
| SDK browser tests           | Actual DOM instrumentation, modes, teardown and widget interactions.                       | Every arbitrary website or a public deployment.                 |
| Database/integration tests  | Queries, ownership and transactional behavior in configured services.                      | A fresh service setup unless explicitly tested from empty.      |
| Application browser tests   | Full user flows, navigation, recovery and layouts in the selected environment.             | All devices/browsers or all future deployments.                 |
| Actual export execution     | Downloaded code runs and, with appropriate assertions, distinguishes buggy/fixed behavior. | Universal locator stability.                                    |
| Clean-checkout verification | Required tracked inputs regenerate the app without private artifacts.                      | Credential-dependent behavior when no services were configured. |

## What has actually been verified

**Hosted portfolio update (2026-11-16):** signed-in React and Next demos submitted fresh masked/full recordings in all four combinations. Each saved report loaded the isolated player, advanced playback and showed the intentional failed request. Masked/full dummy-value behavior and refresh were checked. A lost-response retry returned the same report with `duplicate: true`. Both actual downloaded reproduction tests ran unchanged against the hosted targets and passed, with zero retries. Anonymous demo submission returned 401, a mismatched project origin returned 403, and general public intake remained disabled (503). This is a controlled portfolio release using existing development Clerk identities; it is not unrestricted production SDK intake. Later tests do not erase the earlier clean-service acceptance limitation.

As of 2026-11-16, distinguish these environments:

**Earlier configured local workspace:** report/replay/ownership/retry/editor/export browser checks passed. The published SDK was installed into independent React/Next consumers. Controlled exported-test proof recorded 8 reproduction passes, 8 intended buggy assertion failures and 8 fixed passes with unchanged regression files, no retries or locator corrections. These are bounded local results, not production-scale claims.

**New tracked-files-only export:** made outside the original workspace, with a fresh dependency store and sanitized environment. Installation, formatting/lint/types, 50 unit tests, production build and SDK packaging passed. SDK browser checks passed 65 cases with one existing Chromium-only touch-test skip in Firefox. Three credential-free app browser checks and both independent example install/build/browser flows passed. Public environment injection was tested with synthetic settings, and an unrelated fake secret stayed out of the React bundle.

**Still pending:** initializing an explicitly approved empty database and completing the workflow with separately configured Clerk services in that new checkout; public hosting and production acceptance. Earlier configured successes cannot be relabelled as that missing test. GitHub CI configuration exists; consult actual remote runs before claiming a successful run for a particular commit.

These dated facts should be refreshed when new evidence exists; do not let them become evergreen performance marketing.

## Practical debugging stories to understand

**Lost response:** the visitor sees a delivery error although the database may have committed. Frozen retry plus server idempotency addresses duplicate risk. Explain both halves.

**Unreadable replay:** overly broad masking or unsupported presentation can erase useful structure. Current modes preserve ordinary text, while supported styles/sanitization have explicit limits. Test a changing page, not just one snapshot.

**Stale editing tab:** revision comparison rejects a conflicting save. Keeping the local draft is recovery; silently overwriting the newer row is not.

**Fresh clone fails:** owner-specific IDs, an ignored local tarball or a prebuilt bundle can hide a missing setup step. The independent examples now use environment configuration; normal builds generate outputs from public source.

These are documented project mechanisms. When describing your personal contribution, explain what you actually investigated and can demonstrate; do not invent sole authorship or a debugging chronology.

## Production and future changes

Local development needs the app/player and configured Clerk/PostgreSQL services. Public release adds separate HTTPS origins, production authentication/redirects, signed account-deletion webhook delivery, actual edge controls, retention/backup decisions and hosted end-to-end verification. Setting environment acknowledgement flags does not implement those controls.

Possible future work, **not current functionality**, includes broader replay support, more export adapters or different payload storage. Choose these only after a demonstrated need. Object storage could reduce database payload pressure but introduces storage/access/lifecycle complexity. A hosted runner would add execution isolation and resource-control requirements.

## Code stops and teach-back

Inspect [intent links](../../apps/web/src/features/workspace/IntentLink.tsx), [plan loader](../../apps/web/src/features/reports/plan-loader.ts), [database connections](../../apps/web/src/server/db/connection.ts), [numeric timings](../../apps/web/src/server/timed-private-read.ts) and the [scene controller](../../apps/web/src/features/landing/motion/controller.ts).

For proof, open [SDK tests](../../tests/sdk), [application tests](../../apps/web/tests), [clean-checkout smoke tests](../../tests/e2e/clone-smoke.spec.ts) and [export verification](../../scripts/verify-standard-generated.mjs). Operational commands belong in [SETUP.md](../SETUP.md).

Explain: How would you distinguish an API delay from an animation hitch? Which private data is cached, where and for how long? Which successful test result would you refuse to call production-ready?
