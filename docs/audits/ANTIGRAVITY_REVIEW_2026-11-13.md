# Antigravity change review and smoothness plan

Implementation continued after this point-in-time review. Current fixes and verification are owned by [the implementation record](SMOOTHNESS_FIXES_2026-11-13.md).

Reviewed 2026-11-13 against checkpoint5a0c28b. Scope: verify the accumulated uncommitted Antigravity source, current docs, production UI and hardware rendering; prioritize the next fixes before independent SDK installation work. This review changes documentation only. It does not approve another redesign, dependency migration, provisioning, deployment, commit or publication.

## Verdict

The changes contain useful improvements, but are not regression-free and do not establish a consistently smooth application. Search/replay lifecycle defects were reproduced. The cinematic source has not changed since the checkpoint and remains slow on the actual integrated GPU. Passing build/unit tests and overflow screenshots do not establish clickability or smoothness.

## Verified source changes and positives

- Search retains server filtering, ownership and pagination, with soft URL navigation and loading feedback; sampled submit/clear/Back synchronized correctly without document reload.
- Plan detail/draft reads now run concurrently; save uses a lightweight ownership SELECT rather than loading evidence. Existing ownership rejection and revision predicates remain in source. No schema/authentication/SDK capture-contract changes are present in this diff.
- Replay stays mounted between tabs, preserving its instance and selection; this introduces the hidden-work issue below.
- Shared header accepts skeleton nodes without invalid paragraph nesting. Sampled authenticated screens emitted zero page errors/hydration exceptions.
- Existing optimized architectural background, shader precompile, project request cache, bounded prefetch and script-disabled recorded-document isolation remain.
- Current source still imports the five workspace stylesheets. Tokens were revised, not migrated to one stylesheet. Tailwind/shadcn were not introduced. The docs' claimed widget dock-stop change is not present: SDK source is unchanged and its stop/describe path still does not set opened=true. Treat that as a documentation/implementation discrepancy, not a newly verified fix.

## Findings, ordered by impact

1. **P1: pending live search overrides later navigation.** `ReportSearchForm.tsx:53` schedules a220ms callback without unmount cleanup. In headed Chrome, type a query then immediately follow SDK setup: the timer navigates back to Reports with the query. This makes a successful click appear ignored. Cancel pending timers on unmount/navigation and prevent stale navigation. Use deliberate history policy for live typing (replace versus a push for every debounce); explicit submitted-search history can remain separately deliberate. Add a browser regression for typing then leaving.
2. **P1: delayed replay host becomes ready but stays invisible.** `ReportViewer.tsx:48` hides the frame after4s. The ready/initialized paths never restore display or clear the offline error. Delaying only the trusted host document5.5s produced state Replay ready with iframe display:none and stale offline alerts. Model pending/slow/ready/host-error/payload-error separately, restore on recovery, and provide a real retry. A payload error is not proof the host is offline. Do not weaken origin/channel/sandbox checks. Local production3020 uses configured4191; generic replay:dev may start a differently configured4192 and is not always the right remedy.
3. **P1/P2: playback continues after hiding Investigation.** `ReportWorkspace.tsx:14` retains ReportViewer without an activity prop/pause transition. Observed replay time advanced0.38s to0.93s while the plan tab was selected; hidden-frame browser throttling is not an application lifecycle policy. Pause explicitly on tab exit while retaining position, make repeated evidence selection reliable, and verify no clock/work continues while inactive. Do not just re-add initialOffset to the mounting effect: that can recreate the frame and undo retention.
4. **P2: mobile search hit target collapses.** At390x844 the input measured223.4x16.5px, while the status select was303x40px. The row's flex:1 competes with height after switching its parent to column layout. Fix its mobile flex basis/min-height; make the whole intended field area focus the input. Verify input, clear/chip buttons, keyboard and software-keyboard behavior. Screenshot/no-overflow alone missed this. No physical-phone claim.
5. **P2: current lint fails.** ReportSearchForm has unused page; ReportViewer's mounting effect omits initialOffset. Correct the state/effect design rather than suppressing the dependency rule. Build TypeScript succeeds, which does not negate lint failure.
6. **P2: timing labels no longer isolate draft latency.** In plans.ts, evidence timing now covers Promise.all for both reads and draft timing measures the tiny gap afterward. Time each concurrent promise independently and also report total wall time; do not sum overlapping durations or infer that the draft query is now free.
7. **P2: cold local dialog paint and weak visual accessibility need attention.** First Edit details measured428ms in the journey and360ms in a separate first-open test; later repeats were70-149ms. Code comments/gutters now use35% white on dark surfaces and text links50%; perform actual composited contrast checks before declaring accessibility. Mobile clear controls and code labels deserve explicit hit-target/contrast tests. No universal contrast failure is asserted from token values alone.
8. **P2: footer correction is only partially evidenced.** The footer remains sticky and the generator gained96px bottom padding. Two sampled Edit targets passed center hit-testing after scrolling, including the current short plan. This is not proof for long lists, short screens, every scroll position or code selection. Keep the overlap regression and test the last step, code lines and320px/short-height cases before closing the original report.

No critical security regression was found in the inspected diff, but this is not a comprehensive security audit or new cross-owner database integration pass.

## Fresh checks

- Full isolated production build `.next-review13` passed, including package/replay builds, poster integrity, TypeScript and route generation. This run reported22.5s compile and26.4s TypeScript; prior1.8s cached-build notes are not interaction benchmarks.
- Unit43/43 passed. Lint failed the two findings above. Whitespace check passed. Generated isolated-output type-path edits were removed after verification; Antigravity changes were preserved.
- Headed installed Chrome on Intel Iris Xe/D3D11, not SwiftShader. Desktop1440x900 and mobile390x844: setup/settings/reports had no document overflow; investigation mobile had none. Projects, reports, investigation, plan, setup and settings screenshots were opened and inspected in the bounded review. Search field size defect was measured separately.
- Search soft navigation, clear and Back, authenticated route loads, replay readiness, generator/code/JSON opens and sampled Edit hit tests passed. A harness attempt to create a second page from browser.newPage's owned context failed after the main checks; late-host recovery was then reproduced in a separate focused run. Do not call the first run a clean full pass.
- Existing synthetic account authentication helper used normal provider connectivity. Initial preview preflight timed out; subsequent DNS/HTTPS succeeded. No fresh real Google/email first factor was manually performed; prior user's confirmation remains historical. No provider settings or authentication bypass.
- No fresh complete save/conflict/download/SDK-integration suite or physical device test in this review. Those prior results remain historical. Original report/evidence data were not edited, deleted or submitted by these read-only probes.

### Current interaction samples

Click capture to DOM-ready condition plus requestAnimationFrame; a next-frame proxy, not field INP or a guaranteed physical presentation timestamp. Local production, synthetic existing data, small samples; prefetch/cache warmth matters.

| Interaction | Current ms |
|---|---:|
| Projects to reports |257.7|
| Pending navigation feedback |20.4|
| First report-edit dialog |428.0|
| First generator |496.9|
| Step edit |159.7|
| View code |85.4|
| JSON editor |194.5|

The sampled plan API took169ms and replay API404ms. Historical generator4s outliers remain relevant; this warm169ms sample does not prove cold latency resolved. Browser-only blur-off ABBA dialog samples: normal360ms, no-blur149ms, no-blur70ms, normal85ms. First-use/order/cache confounds are substantial: no causal blur speedup established. Do not strip the visual design on that evidence.

### Current cinematic samples

Production1440x900, installed headed Chrome, CPU profiler enabled; instrumentation adds overhead. One run, no causal before/after optimization claim. Renderer explicitly reported Intel Iris Xe/D3D11; quality stayed desktop. Scene readiness4656ms in this run. No50ms+ main-thread long tasks in these steady phase samples.

| Phase | Frame interval median / p95 ms |
|---|---:|
| Entrance |33.4 /44.6|
| Native-wheel scroll |33.1 /88.9|
| Hero |32.4 /44.4|
| HTML story |11.1 /22.2|
| Diagnostic zoom |11.1 /11.3|
| Story plan tabs |11.1 /11.8|

Roughly33ms cadence is near30fps, not smooth60fps. Short wheel-generated samples are not physical touchpad tests. JS/layout timings and absent long tasks support a rendering/GPU-pipeline hypothesis, but do not identify one guilty pass or measure GPU utilization. Main scene includes planar reflection, bloom, output, FXAA and a separate ray canvas. Current PerformanceGuard triggers only after sustained mean>48ms, so a stable30fps scene may remain full quality indefinitely. This is a policy limitation, not proof to remove bloom. Profile pass GPU times before changing visual output.

## Techniques ranked for Unravel

### 1. Correctness and immediate feedback first

Cancel stale async navigation, pause inactive replay, recover delayed hosts, repair mobile hit areas, verify overlay hit-testing and resolve lint. Give immediate pressed/pending feedback without waiting for network, fonts or transitions. Separate input delay, handler duration and presentation delay using Event Timing/Chrome traces; separately measure click-to-completed-data. Avoid transition:all where it animates unintended properties. Preserve keyboard/focus and reduced motion.

### 2. Backend and navigation latency

Measure pool acquisition, TCP/TLS/cold wake, owner lookup, query and serialization independently; correct concurrent timing first. Confirm region proximity and configured pooled connection reuse before proposing infrastructure changes. Retain per-request owner-keyed caching; never share private response caches across users. Inspect query plans/indexes only for demonstrated slow queries. Keep bounded intent prefetch; route skeletons make waiting visible but do not shorten the database operation. Evaluate deduplication/cancellation of220ms live-search requests. Do not add blind retries to writes or disable auth to make timings look better.

### 3. GPU/frame budget

Use disjoint GPU timer queries where supported and short traces, then reversible per-pass experiments for reflection, bloom, rays, shadows and render-target resolution. Measure visual output as well as time. First attempt equivalent-output shader/pass/work reuse, avoiding needless redraws and GPU allocations; evaluate reflection update frequency and targeted effect-resolution changes only if timing identifies them. Keep warmup for exact render-target shader variants and stage remaining first-use uploads/compiles. Inspect both canvases and compositor cost. If needed, introduce gradual measured performance tiers with hysteresis rather than the present coarse full-to-low jump; preserve full quality on capable devices and discuss visible tradeoffs before shipping. Do not change camera/geometry/artwork or remove effects as a default fix.

### 4. Internal rendering

Trace main-thread and paint cost of material lights, pointer springs, large blur regions, shadows and retained hidden trees. Use compositor-friendly transforms/opacity, explicit read/write scheduling and scoped updates; memoize only measured expensive work. Cache static atmosphere where visually equivalent. Virtualize/window only genuinely long evidence lists, preserving selection/keyboard accessibility. Lazy-load the unopened PlanEditor if bundle evidence shows a worthwhile gain; CodeMirror and landing renderer already have dynamic loading boundaries. Avoid delaying critical button behavior behind lazy initialization.

### 5. Assets, compression and delivery

Current Next production scripts were verified gzip-compressed with public,max-age=31536000,immutable. Compression is already present. Audit actual transferred/decoded JS bytes, duplicates and CPU parse/execute time before removing packages. Keep tree shaking/route splitting; downloading fewer bytes does not automatically reduce recurring GPU work. Brotli at the eventual approved host/CDN can reduce transfer further. Existing internal background already uses Next's optimized image delivery: do not revert to the raw2MB PNG. For3D, consider Meshopt/Draco geometry and KTX2/Basis textures only after measuring asset composition, decoder overhead, GPU residency and visual fidelity; do not add all codecs indiscriminately. Correct responsive image dimensions, texture sizes, mipmaps, compression/caching headers and preload critical resources selectively. Lazy-load below-fold/noncritical media; do not lazy-load the primary visible content merely for a score.

A CDN helps geographically distant users fetch public static assets after an approved deployment. It will not fix a local33ms render loop or remote private database waits; never publicly cache private replay/auth/report payloads. A service worker/offline private-data cache introduces privacy/invalidation decisions and is not a first-line fix. HTTP2/3, preconnect and fewer request waterfalls are delivery options for measured hosted network bottlenecks, not a reason to provision now. No infrastructure was changed.

### 6. Verification budgets

Set scoped acceptance before implementation: local control feedback generally within100ms, navigation feedback within100ms while measuring completion separately, no stale search navigation, preserved paused replay position/no hidden clock work, late-host recovery, reachable controls at320/390px and short desktop heights. Aim for60fps (16.7ms budget) on agreed capable hardware, inspect p95/jank distribution, and retain visual comparisons; do not promise arbitrary devices60fps. Test cold/warm caches, production/dev, CPU/network throttles, actual low-end GPU/RAM/thermal conditions, reduced motion and background/tab cleanup. Run complete save/recovery/export and auth workflows after fixes. Freeze comparison conditions; do not profile during builds or concurrent headed GPU runs.

## Recommended execution order

1. Bounded lifecycle/clickability repair covering findings1-6, mobile hit areas and footer verification. Keep the current design; add focused browser regressions and rerun lint/build/relevant workflows. This is the highest-value next task.
2. Correct timing attribution and reproduce cold backend delays; optimize the demonstrated cause.
3. Separate cinematic GPU pass investigation, with agreed visual comparisons and narrowly justified changes.
4. Optimize delivered bundles/assets only where measured, then test physical constrained devices and repeat full regression acceptance.
5. Resume independent SDK installation/release work after these checks. No Tailwind/shadcn rewrite is needed for this performance task.

Scoped technical review scores (0-4, provisional, not conformance certification): accessibility2 (measured undersized field, keyboard/contrast review incomplete), performance1 (3D misses frame budget and local first-use delays), theming2 (revised tokens but extensive hardcoded values/overrides), responsive2 (bounds pass but field collapses), implementation integrity2 (useful changes with reproduced lifecycle regressions and lint failure). Suggested skill passes: impeccable harden for lifecycle/recovery, adapt for hit areas, optimize for measured work, and polish last. Re-audit after fixes; no score implies whole-app acceptance.

Evidence artifacts remain ignored under .cache: review13-ux/late/controls.json, internal-antigravity13.json, hardware-review13.json, CPU profile and synthetic screenshots. Rebuild/source commands live in README. Local preview3020 and isolated4191 were started for review; inspect ownership/health on resume. No commit/push/deploy.
