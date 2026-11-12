# Performance pass ? 2026-11-12

## Scope and verdict

Three measured/confirmed waste sources are corrected. This is not certification of a smooth complete application. Authenticated navigation, real replay latency and generator browser execution could not be freshly verified: Clerk testing-token retrieval failed (`fetch failed`), and the anonymous sign-in form did not become available. No provider settings, infrastructure, database, privacy policy or replay isolation changed. No dependencies, scene/artwork changes, commit or publication.

Read current PROJECT_STATUS for product facts. Previous completion results remain historical.

## Evidence

Chromium 158, headless Windows, SwiftShader software WebGL, development app on localhost3000. Separate fresh pages at 1440x900 and 390x844, six-second initial dwell then four-second rAF/layout-read/long-task observation. Instrumentation adds overhead. These are short diagnostic samples, not hardware GPU benchmarks or statistically established speedups.

| Measurement | Before | After |
| --- | --- | --- |
| Desktop steady-state bounding-rect reads | 6 in 6 sampled frames | 0 in 6 frames |
| Mobile steady-state bounding-rect reads | 21 in 21 sampled frames | 0 in 21 frames |
| Desktop frame interval p95 | 999.9 ms | 866.6 ms |
| Mobile frame interval p95 | 233.2 ms | 233.4 ms |
| Desktop long tasks in sample | 5, 812?922 ms | 6, 782?856 ms |
| Evidence labels during 2s of 10 Hz clock messages / 1,000 events | 40,000 evaluations | 0 evaluations |

Frame timing remains poor in software rendering; no causal FPS improvement is claimed. Mobile reached the existing low-quality tier during the after sample, so timings also differ in quality. Ray CPU/layout waste is removed, not the underlying software fragment-shading cost. GPU utilization and real-phone thermal/memory behavior were not measured.

The evidence profile bundles the actual ReportViewer with production React and synthetic events. A stub router, mocked fetch and separate-origin synthetic bridge isolate clock-driven React work. Baseline disables the new list memo boundary. This does not run rrweb, authentication, database access or production CSS; its screenshot is not visual acceptance. Selecting an event remains interactive. No report data is changed.

The existing guard previously needed three 120-frame windows: 360 seconds at 1 fps, before even trying lower quality. It now closes a window after 120 frames OR two seconds with at least 12 samples; three poor windows still required. Deterministic tests establish 36 seconds at sustained 1 fps and 6.105 seconds at 55ms/frame, versus 360 seconds and 19.8 seconds previously. This is guard logic evidence, not a measured hardware startup time. Controller diagnostics now retain actual frame intervals rather than clipping them to 250ms; simulation deltas remain bounded.

Observed local asset transfers: GLB ~1.80 MB, indirect map ~454 KB, AO ~513 KB, desktop poster ~1.12 MB / mobile ~265 KB. Scene asset requests completed in roughly 10?276ms across these local samples. No network-loading bottleneck was established under real network throttling, so assets were preserved. Normal-quality scene remains 32 desktop draw calls / 6,801 triangles; mobile baseline 23 / 3,407. High GPU cost remains a real-hardware profiling question.

## Implementation ownership

- `hero-rays.ts`: initialize size once, resize through a disconnectable ResizeObserver, reuse aspect in pointer handling; no per-frame bounding-rect query or backing-store size test. Shader/uniform treatment unchanged.
- `controller.ts`: measure raw frame time independently of simulation clamping and feed it to the guard.
- `quality.ts`: elapsed-time-bounded sustained-poor-frame windows. Existing lower-quality/static policy remains; it now activates sooner on persistently slow devices. This can affect their visual quality earlier. Normal-performing devices retain the cinematic effects.
- `ReportViewer.tsx`: memoize filtered entries and isolate evidence-list rendering behind stable selection callbacks. Playback time updates no longer recreate the evidence rows. Grouping, selection, ARIA, seek and isolation remain.
- `choreography.test.ts`: guard expectations for sustained stalls/reset updated.
- `scripts/profile-landing.mjs` and `scripts/profile-evidence.mjs`: reproducible diagnostic probes using installed dependencies. Run from repository root against the existing app; ignored outputs under `.cache/performance-*.json`. Evidence probe uses routed synthetic documents and does not start a service. Landing probe is software WebGL and must not run concurrently with latency checks.

## Verification and failures

- Lint, typecheck, 41 unit tests passed. Isolated `.next-perf` production build, poster integrity and 52-file reference integrity passed. Incidental generated type-path changes were removed without resetting other work.
- Five of seven focused landing cases passed initially: synthetic examples, ambient/pointer/pause/reverse, hero hold/exit at desktop1440x900 and mobile390x844, live reduced-motion switching.
- Short desktop1440x700 assertions completed but trace cleanup failed with ENOENT while SDK tests shared the artifact root. Isolated rerun with a separate output directory passed. No assertion was weakened.
- Navigation cleanup asserted zero pending landing frames after exit, then failed waiting for Clerk's Email address form. Full repeated authenticated navigation remains unverified.
- SDK run reported all 25 Chromium test cases passing, including privacy, record/submit/retry, React/Next lifecycle, mobile/widget movement, reduced motion and teardown. The runner did not exit after reporting those cases; it was interrupted. No clean suite completion is claimed. Controlled SDK sample: 200 interactions, 0.5ms baseline / 13.5ms recording, 71,766 bytes. Not a broad performance budget.
- Desktop/mobile reduced-motion landing screenshots were opened and inspected; mobile had no horizontal overflow. Reload remained usable. No new visual direction or CSS change.
- `git diff --check` passed with existing Windows line-ending warnings.

## Outstanding acceptance

Profile production on the user's accelerated GPU and an actual phone, including native scrolling, shader warm-up, GPU/memory traces, long sessions and throttled cold load. Retry Clerk-backed navigation/replay/generator/recovery/unchanged export execution when connectivity works. Measure replay latency in isolation against the unchanged500ms target. No authenticated speedup, leak-free whole application, universal60fps, or premium-feel acceptance is claimed by this pass.
