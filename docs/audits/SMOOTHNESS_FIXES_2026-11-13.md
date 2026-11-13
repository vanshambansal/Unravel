# Implemented responsiveness and cinematic performance fixes

Updated 2026-11-13. The user requested implementation beyond the Antigravity review. Work builds on checkpoint 5a0c28b and preserves the accumulated Antigravity changes. The earlier review records the starting defects. This document owns the implementation results and measured limits.

## Antigravity review outcome

The shared header's hydration repair, route loading states, server-filtered search, concurrent plan reads, lightweight ownership checks and retained replay instance were useful and are preserved. The review reproduced stale navigation, hidden playback, invisible late-host recovery and undersized mobile input. The claimed dock-Stop behavior had been documented without the corresponding SDK change. Those defects are now implemented and covered through the real workflows. Valid ownership/revision checks remain enforced.

## Interaction and correctness work

- **Live search** cancels pending work on link navigation, Back and unmount. Input versions and pending query intent keep an older server response from replacing newer typing. URL search, server filtering, pagination and existing history behavior continue through the normal route. Duplicate requests for an already-applied query are skipped while outstanding navigation can still be cancelled.
- **Mobile search** has a 44px input within a 46px bordered container. Clear controls grew from 20px to 28px. Tested 320px and 390px widths retain usable bounds.
- **Replay retention** now pauses the inactive investigation panel and backgrounded page explicitly while retaining the iframe/channel, selection and position. Repeated requests to inspect the same evidence timestamp have distinct request identity.
- **Replay recovery** restores the frame and clears its loading error when a delayed host initializes. Retry disposes the previous frame/channel and aborts its request. Slow loading has accurate waiting feedback. Recording retrieval has a 60-second bound to accommodate bounded 5MB payloads on slower networks. Timeline access remains available while waiting.
- **Trusted replay host** runs its clock during playback and stops it on pause, finish and teardown. ResizeObserver and resize events replace paused fit polling. Seeking updates fit explicitly. Fractional viewport dimensions receive a 1px rounding allowance, and the recorded iframe's browser border is removed. This corrected a measured 1.3px mobile overflow while keeping the full-viewport fit assertion and 500ms seek budget.
- **Report dialog** opens through a layout effect, allowing the native modal to enter the top layer before the paint following its state change.
- **Code editor** gives its preparing state a paint opportunity before lazy initialization. Document and language/read-only/label changes dispatch together before paint. Keystrokes that already changed CodeMirror avoid reconfiguration. JSON history, staged Apply/Discard and generated-code read-only behavior remain covered by the generator workflow. Code text returns to 14px and comment/gutter contrast is increased.
- **Recording widget** opens the details form when a stopped recording has a full snapshot, including Stop from the minimized dock. Recording and explicit submission retain their separate steps.
- **Diagnostics** time the concurrent evidence and draft reads independently. The overlapping durations describe each operation's wall time. They should not be added as sequential latency. Existing lightweight ownership saves and parallel reads from Antigravity remain in use.
- **Control transitions** list the intended properties explicitly, avoiding accidental layout-property animation through transition:all.

## Cinematic work beyond Antigravity

### Continuous camera movement

The native scroll position remains the presentation target. Camera progress follows it on animation frames with exponential interpolation at 18/s. This distributes discrete wheel updates across frames and keeps the existing choreography path. Skip and Replay snap to their endpoints. Pausing ambient motion still permits camera settlement after scrolling. Reduced motion uses the existing static route.

A paired wheel test at 1440x900 recorded 173 baseline and 163 updated moving samples. Stationary samples within the moving section fell 84.4% to 10.4%. The p95 change in camera speed fell 137.2 to 55.2 world-units/s, approximately 60%. These trajectory diagnostics measure movement continuity. Their sample counts and scheduling differ slightly.

### Ray shader work

Shape/color constants upload on initialization or size/opening changes. Time, aim and focus are the three per-frame uniform uploads. The previous loop uploaded 21 uniforms and allocated a settings object and entries each frame. Shader formulas, visual parameters and ray raster budget remain the same.

### Adaptive GPU resolution

The 90Hz panel has about 11.1ms per refresh. GPU timer probes found scene frame medians around 8.5-9.2ms and entrance p95 around 11.7ms in the tested configuration. Individual samples identified PBR shading and full-screen passes as contributors. CPU submission and compositing consume additional budget.

A new ResolutionGuard ignores 30 warmup samples and requires two consecutive 60-frame windows with p75 above 20ms before reducing resolution one step. Steps reduce the scale by 0.1 of the original ratio and stop at an absolute 0.8 pixel ratio. Fast devices keep the original ratio. Each mounted scene retains its selected tier to avoid oscillation. The existing severe-stall fallback remains available. Intermediate tiers retain bloom, planar reflections, rays, geometry, materials, camera and lighting. Interface typography and controls remain at browser resolution.

Standard-DPI alternating runs gave full-resolution medians 22.2/22.0ms and adaptive medians 12.8/11.5ms. Their p95 values were 36.2/42.6ms and 44.6/44.7ms respectively. The median improved while tail-frame delays persisted.

At 150% device scaling, the final paired sample improved median 33.3 to 22.2ms and p95 33.7 to 22.6ms. The original pixel ratio was 1.25 and the adaptive ratio reached 0.8, a 0.64 linear scale relative to that original raster. Bloom remained 0.24 and reflection strength remained active. This is a measured visual-quality tradeoff on repeatedly slow devices. Standard-DPI 0.8 ratio renders 36% fewer scene pixels than 1.0. High-DPI 1.25 to 0.8 renders about 59% fewer scene pixels. These are raster counts rather than measured total VRAM savings.

Full-resolution start/hero captures at 1440x900 and 390x844 were byte-identical to the frozen baseline in all four comparisons. Approved PNG assets were preserved. Their renderer-source provenance hash was refreshed after this equivalence check. The original prototype's 52 files passed integrity checks.

### Poster delivery

The marketing server supplies optimized poster URLs through the existing Next image service and CSS variables, including responsive, reduced-motion and no-JavaScript styles. Quality 90 was added to the optimizer allowlist. Source PNGs remain unchanged. Chrome received the desktop hero as 45,804 bytes of WebP from a 977,088-byte PNG, and the mobile hero as 11,492 bytes from 218,622. Each is about 95% smaller. Four final desktop/mobile reduced-motion/no-JavaScript cases loaded the optimized background with zero raw poster requests and no overflow. Rendered desktop and mobile results were visually inspected. This is a high-quality lossy delivery format and has no effect on live 3D rendering. Compression and immutable script caching were already working before this change.

## Changed component map

| Area | Files and purpose |
|---|---|
| Camera and GPU tier | `motion/controller.ts`, new `motion/scroll-motion.ts`, `motion/quality.ts`, `motion/asset-scene.ts` implement continuous scroll following and measured resolution adaptation. |
| Ray shaders | `motion/hero-rays.ts` uploads constants on change and dynamic values per frame. |
| Poster delivery | Marketing `page.tsx`, `Landing.tsx`, `landing.css`, `next.config.ts` supply optimized responsive backgrounds and fallback styles. |
| Search | `ReportSearchForm.tsx`, report-list page and `report-management.css` handle navigation races, URL state and usable control bounds. |
| Replay | `ReportViewer.tsx`, `ReportWorkspace.tsx`, `player-host.ts` own active state, cursor requests, recovery, timers and fitting. |
| Dialog/editor | `ReportHeader.tsx`, `PlanCode.tsx`, report/test-plan CSS improve modal timing, editor transactions and control transitions/readability. |
| Widget | `packages/sdk/src/widget.ts` opens details on Stop. SDK and report workflow tests use the actual Stop-to-description contract. |
| Server timing | `server/reports/plans.ts` measures each concurrent read independently. |
| Regression coverage | New report `responsiveness.spec.ts` and unit `scroll-motion.test.ts`, plus focused existing workflow tests. |
| Documentation | Current status, handoff, architecture, decisions, SDK/replay contracts and this evidence record. |

Paths under `motion` refer to `apps/web/src/features/landing/motion`. Report component paths refer to `apps/web/src/features/reports`. The total Git diff also contains Antigravity's pre-existing changes. It should not be attributed entirely to this implementation.

## Browser measurements

Installed headed Chrome used Intel Iris Xe/D3D11. Windows reported a 2880x1800 panel at 90Hz and the Balanced power scheme. The standard viewport measurements use device scale 1. A separate high-DPI experiment used 1.5. No device or power settings were changed.

The initial click samples and the final controlled repeat use the same original synthetic report. Click capture to DOM condition plus requestAnimationFrame is a response proxy. Server/cache warmth and browser scheduling affect these small samples.

| Action | Starting ms | Final controlled ms |
|---|---:|---:|
| Reports navigation |258|220|
| Navigation pending feedback |20|53|
| Report dialog |428|184|
| Generator opening |497|476|
| Step editor |160|111|
| View code |85|151|
| JSON editor |195|107|

The final View code and pending-feedback samples were slower than their starting samples. Generator opening improved only modestly. These results do not establish an across-the-board click-latency improvement. Warm plan API time was 135ms in the final controlled sample.

An intermediate run recorded report dialog 83ms and generator 353ms, with JSON 317ms. That slower editor result led to the batched update change. An earlier post-change sample used a different first report after synthetic fixtures were created. It is excluded from the final controlled table. Historical cold generator waits of about 4s remain relevant to backend variability.

Production scripts were verified gzip-compressed with public,max-age=31536000,immutable caching. Existing image optimization and lazy CodeMirror/landing boundaries remain in use. Measured local rendering and interaction work drove this implementation. Hosted CDN/Brotli and additional geometry/texture codecs remain options for measured delivery constraints under the release plan.

## Verification

- Complete production build, repository TypeScript, lint and 45 unit cases passed during implementation. Final check outcomes are recorded in PROJECT_STATUS.
- A single final-delivery focused run passed report management/search/pagination/recovery, private recording/retry/dedup/replay/seek/deletion, responsiveness and full generator recovery/export, 4/4 in 6.1m. These are workflow durations.
- Later focused verification covers the final editor batching, concurrent typing and 17-second delayed replay request. Both cases passed in a single 2/2 run in 2m, including the generator export/recovery workflow.
- Six final hardware-Chrome landing cases passed keyboard Skip, scene-before-text ordering, ambient/pointer/pause/reverse, reduced motion, model/context-loss fallback, interrupted initialization cleanup, unsupported WebGL and JavaScript-disabled content.
- Three standalone hardware-Chrome widget cases passed movement/reset/draft retention, complete Stop/details/submit/identical retry and mobile close/discard/reduced motion.
- Fresh exported regression execution failed on the intended assertion 5/5 against the buggy local fixture and passed 5/5 against the fixed copy, retries 0 and unchanged export hash.
- Session, refresh, mobile navigation, logout, protected redirect, private API 401 and absence of private content after Back passed on 3020. The user's earlier manual Google/email-code confirmation remains the first-factor evidence. The final repeat also passed all session/logout assertions. Clerk testing emitted pending-request warnings after the browser context was closed during teardown.
- SaveData mode requested zero architecture assets. Explicit Enable3D loaded the scene. Live reduced motion disposed it. Mobile bounds and reload passed. Constrained-device results are recorded below.

## Constrained configurations

CPU/network emulation runs use the laptop's real Iris Xe GPU. The final isolated repeat gave the following results. Readiness is the rendering/static flag, so these values are separate from complete poster paint or field LCP.

| Configuration | Ready | Frame median / p95 | JS heap |
|---|---:|---:|---:|
| Desktop 1280×800, CPU 4× |5.2s|22.3 / 44.7ms|7.8MB|
| Mobile 390×844, CPU 6×, 150ms latency, 1.5Mbps |25.1s|22.2 / 33.6ms|9.7MB|
| Same mobile, SaveData |7.9s static|scene inactive|4.2MB|

All configurations had no document overflow. The full scene still transfers about 2.77MB of architecture assets. SaveData requested zero architecture assets. The earlier repeat measured 5.6s / 24.9s / 5.5s readiness respectively, showing startup variability. Smaller posters do not remove the full-scene network cost. One attempted repeat overlapped build/test work and was interrupted, so its partial timings were excluded. Physical GPU/RAM limits remain unverified.

## Intermediate failures and decisions

The initial lint errors were fixed. A test measured seek acknowledgements against a hardcoded 4191 while the candidate used 4193. It now reads the configured frame origin. New synthetic-project cleanup initially omitted the API's expected project snapshot and confirmation. Its final cleanup uses the full contract. A replay runtime had to be restarted after rebuilding because its daemon loads assets at startup. A delayed-host assertion initially counted Next's empty route-announcement alert. It now checks replay errors and the fallback directly.

Removing idle fit polling exposed the fractional viewport/default-border overflow. The application fix retains the original complete-viewport assertion. A temporary depth prepass reduced some GPU draws but gave inconsistent end-to-end timing and small desktop pixel changes, so it was removed. A blur-off comparison was confounded by first-use order and caching. The material design was retained.

## Remaining limits

Tail-frame spikes remain in the measured distributions. Consistent 60fps across every interaction and device is still an acceptance limit. Cold database/provider waits can exceed warm results. Physical low-end GPU/RAM/thermal behavior, Safari and software keyboards require real-device coverage. Browser CPU/network simulation supplies constrained evidence. Public deployment, independent human SDK installation and release/provider decisions remain in HANDOFF.

The application source, tests and docs are uncommitted. Original evidence, existing user reports, scene assets and privacy/authentication boundaries were preserved. Browser tests created synthetic fixtures and cleaned only their own explicitly identified test projects/reports.
