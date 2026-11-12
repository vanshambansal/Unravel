# Hardware Chrome performance investigation - 2026-11-12

## Verdict

Real GPU access succeeded. A targeted shader-startup fix is implemented and measured on this machine. Consistently smooth scrolling and the complete authenticated workflow have NOT met acceptance. This supersedes the earlier software-only investigation for hardware findings; it does not replace its historical results.

## Environment and method

Installed Google Chrome, headed, clean temporary browser context, Intel Iris Xe Graphics (device0x46A6), driver31.0.101.4575, ANGLE D3D11. CDP SystemInfo reported GPU compositing/WebGL enabled; the page's actual unmasked renderer also reported Intel/D3D11, not SwiftShader. OS GPU enumeration was denied, so Chrome's own GPU information was used. No browser GPU settings or driver settings were changed. Desktop viewport1440x900/DPR1; mobile390x844 is viewport emulation, not a phone.

Development app3000 compared with a frozen local production build3016. Candidate builds3018/3019 and final3020 used isolated Next output. All used the same artwork, shaders, camera, reflection, bloom and normal desktop quality. No render resolution or fallback threshold was reduced in this task. Existing services/settings and original evidence were preserved.

CDP CPU sampling and Performance metrics, rAF intervals, long tasks, scripted native wheel input, example button interactions and actual lifecycle checks were used. Startup measurements below use three separate headed-Chrome launches per version, without CPU sampling or overlapping browser workloads. They are repeat observations on this machine, not population statistics; OS/driver caches and power state were not reset. A preliminary run overlapped poster checks and is excluded. One initial full-profile run overlapped an authentication diagnostic; the isolated rerun owns the dev/production comparison below. CPU sampling adds overhead to the phase profiles.

## Findings and measured fix

Three.js synchronous shader first-use is a confirmed startup blocker. A development CPU profile attributed about1.66s of self samples to `onFirstUse`; the rays also synchronously checked shader compile status. Production did not eliminate startup stalls.

`asset-scene.ts` now calls Three's `compileAsync` against the actual composer read-buffer target before handing over the scene. This uses `KHR_parallel_shader_compile` where supported. Compiling for the default framebuffer was tested and left a0.93-1.04s gap: it prepares different tone-mapping/color-space variants, which are compiled again for the offscreen RenderPass. Matching the actual target addresses that mismatch.

`hero-rays.ts` now waits for parallel link completion before querying link status, instead of forcing synchronous compile-status reads. The same link validation and exact shader remain. `controller.ts` awaits the rays, checks its generation before adoption and disposes late results. A cancellation callback ends polling when navigation/preference changes invalidate initialization. Browsers without the parallel extension retain synchronous validation. The poster/HTML remain visible until the actual first rendered frame; preparation does not guarantee that all driver/upload work is asynchronous.

| Production startup, three launches | Before | After |
| --- | --- | --- |
| Time to rendered scene, individual runs | 2132 / 2144 / 2386ms | 1686 / 1671 / 1816ms |
| Median time to rendered scene | 2144ms | 1686ms |
| Largest rAF gap, individual runs | 1444.5 / 1466.6 / 1600.1ms | 288.8 / 288.8 / 411.3ms |
| Median largest rAF gap | 1466.6ms | 288.8ms |
| Largest long task, individual runs | 1441 / 1472 / 1603ms | 284 / 301 / 411ms |

Startup is materially less blocking, but remaining250-411ms tasks are still noticeable. This is not a claim of instantaneous or fully stutter-free initialization. The final cancellation-only follow-up preserves the normal compile path; final build and lifecycle checks were repeated after it.

## Development overhead versus persistent rendering cost

Isolated pre-fix phase profile (p50 / p95 frame intervals):

| Phase | Development3000 | Production3016 |
| --- | --- | --- |
| Entrance | 33.4 / 44.6ms | 22.2 / 33.2ms |
| Camera scroll | 33.3 / 77.6ms | 22.1 / 44.5ms |
| Hero | 33.1 / 33.7ms | 22.1 / 22.5ms |
| Ordinary story scroll | 11.1 / 22.1ms | 11.1 / 11.4ms |

Production helps in this run, but the cinematic stage still misses the observed11.1ms browser cadence. Most phase time was not spent running JavaScript: e.g. production entrance ScriptDuration~0.94s / TaskDuration~1.22s during a5s sample, no long tasks and no layout work. This makes JavaScript long tasks an insufficient explanation for persistent cadence misses. GPU submission/compositing/frame scheduling remain suspects, not proven GPU saturation. An exploratory per-draw GPU query was not used for acceptance because it did not capture total compositor cost or validate disjoint state. No GPU-utilization percentage or memory-leak diagnosis is claimed.

Paired production profile after the startup change confirms no consistent steady-state improvement:

| Phase p95 | Before3016 | After3020 |
| --- | --- | --- |
| Entrance | 33.4ms | 43.8ms |
| Camera scroll | 44.6ms | 55.5ms |
| Hero | 33.3ms | 22.6ms |
| Ordinary story | 11.3ms | 11.4ms |
| Diagnostic scroll | 11.3ms | 11.3ms |
| Synthetic plan tabs | 11.3ms | 11.2ms |

No long tasks occurred in those final phase samples. The samples are variable and do not justify claiming a scroll speedup; the after entrance/scroll tails were worse. The synthetic tab interaction is marketing content, not the authenticated generator. The diagnostic sample covers its scripted scroll segment, not exhaustive visual acceptance of the entire transition.

## Additional compositor trace

A final public-landing CDP trace narrowed the steady-frame issue. CrRendererMain FireAnimationFrame events peaked at9.112ms and FunctionCall at9.126ms. On CrGpuMain, DXGISwapChainImageBacking::Present had171 events over1ms, total2380.8ms and maximum33.589ms; SwapBuffers peaked34.22ms and a GPU command flush peaked43.685ms. These are nested trace durations and must not be summed or interpreted as GPU utilization. The presentation path is a stronger lead than React/layout long tasks, but waiting there can reflect downstream GPU/display scheduling; this is not proof of a driver defect or a reason to remove effects. Trace: ignored `.cache/hardware-compositor-trace.json`.

A temporary launch-only DirectComposition A/B was also tested and NOT retained: default Chrome reported DirectComposition=true with22.1/22.5ms p50/p95; a fresh diagnostic launch reported false with22.2/44.4ms. It did not improve cadence, so no browser flag or application workaround was recommended. Both diagnostic browsers were closed; normal Chrome settings remain untouched.

## Authentication is a separate network blocker

A normal headed-Chrome sign-in check outside the sandbox still rendered zero email inputs. Requests to the Clerk `client.protect.clerk.com` probe domain repeatedly failed with `net::ERR_NAME_NOT_RESOLVED`, including fallback attempts. A sandboxed check had additionally returned `ERR_NETWORK_ACCESS_DENIED`; that was not treated as application behavior. No auth headers, cookies, handshake query strings or reusable sessions were recorded. Protection was not bypassed and provider settings were not changed.

Because login could not complete, actual private navigation, report fetch, rrweb playback/seek and test-generator editing/export could not be profiled. The evidence-list synthetic measurements from the previous pass do not fill that gap. No private replay-origin configuration was relaxed for alternate preview ports.

## Verification and visual preservation

Lint and typecheck passed; isolated production builds passed. Five focused motion unit cases, poster integrity and52-file prototype integrity passed. Six headed hardware-Chrome browser cases passed on the target-corrected production build: scene-before-text/keyboard skip; ambient/pointer/pause/reverse; mobile hero hold/exit; live reduced-motion; model-failure/context-loss fallback; interrupted-initialization navigation. The cancellation-only follow-up was rebuilt and these cases rerun; all six final cases passed (27.5s).

All four capture-route images were rendered to ignored scratch paths and compared byte-for-byte with the approved start/hero desktop/mobile PNGs: identical. No approved raster was overwritten. Only the source freshness hash in `scene-posters.json` was updated after verification. No camera, shader code, bloom, reflection, material, texture or CSS effect was changed. No dependency, provider, database, publication or commit operation.

## Reproduction and user handoff

- Development: existing http://localhost:3000. Final production landing review: http://localhost:3020. This preview is for cinematic/landing comparison; alternate-origin authenticated replay has not been configured or verified. Temporary baseline/intermediate3016/3018/3019 processes were stopped; development/fixture services were not stopped.
- Reproduce startup: `node scripts/profile-startup-chrome.mjs 3020 review`. It writes `.cache/startup-review.json` and uses installed Chrome with hardware defaults.
- Reproduce phases: `node scripts/profile-hardware-chrome.mjs review 3000 3020`. It writes ignored phase and public-landing CPU profiles. Run sequentially, without other profiling/browser workloads. These probes deliberately stop at public landing content and contain no auth capture.
- Build/start after this session using `UNRAVEL_NEXT_OUTPUT=.next-hardware-target` consistently for both commands. Root README owns normal pnpm commands. No production public ingestion opt-in is needed to review the landing.
- Open http://localhost:3000/sign-in in your usual Chrome. If the form is absent, inspect DevTools Network for `client.protect.clerk.com` and its DNS failure. Check whether the same URL works on another trusted network; investigate VPN/DNS/filtering with your network administrator rather than disabling Clerk protection or weakening application security. No DNS settings were changed here.
- Once the form works, sign in locally and indicate readiness without sharing credentials or tokens. Continue authenticated navigation/replay/generator profiling with the normal isolated replay origin, using synthetic reports. If the usual browser works but the automated clean browser does not, compare those network environments instead of redesigning authentication.

Remaining acceptance: compositor/GPU frame scheduling on the cinematic stage, residual startup tasks, user-observed feel, authenticated workflows, longer memory/lifecycle traces and actual phone measurements. The website is NOT declared consistently smooth by this work.
