# Unravel architectural motion study

Local-only TypeScript/Vite study of the approved Figma doorway, crimson threshold and atrium hero. This does not choose the product framework or implement signup, the SDK, dashboard or diagnostic zoom.

## Run

Node 22.18.0 and npm 10.9.3 were used. From this directory:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:4174. Scroll approximately two viewport heights, use Skip Intro, or enable your operating system's reduced-motion setting. Pause motion freezes the environment while leaving scroll navigation usable. Both CTAs lead to an explicitly labelled prototype-information section.

```powershell
npm run typecheck
npm test
npm run build
npm run preview
```

Stop the dev server before using preview on the same port. There is no separate lint configuration in this bounded study. No backend, credentials, Docker, database or external runtime service is needed.

## Structure and decisions

- `src/scene.ts`: stable public facade; `src/asset-scene.ts` renders the scene and handles camera, lights, reflection, ambient motion and disposal. src/side-rays.ts integrates the depth-aware ray pass; src/ray-motion.ts owns pointer mapping/damping. `src/architecture.ts` loads the Blender GLB, PBR maps and indirect/AO atlases. Asset-source instructions are in design/assets/architecture-v1/README.md.
- `src/choreography.ts`: pure, reversible camera and HTML presentation progress. Ambient time does not move the camera.
- `src/main.ts`: GSAP ScrollTrigger observes native scrolling; CSS sticky positioning bounds the entrance. HTML owns text, buttons and focus. Rendering stops offscreen/when hidden and while paused except for necessary redraws.
- `src/quality.ts`: provisional sustained-frame-time guard. Three 120-sample windows averaging above 48ms reduce rendering quality; a further three poor windows choose the static hero. Samples are capped at 250ms so isolated extreme stalls do not dominate, while sustained very slow rendering still triggers fallback. These are tuning defaults, not validated device budgets.

Desktop pixel density is capped at 1.25, mobile at 1. Low quality uses 0.75, disables ceiling rays, the reflection, live ray pass and bloom, and retains the camera journey. Reduced motion, renderer download failure, missing WebGL and context loss immediately use the poster. Narrow viewports have a reframed entrance and wider camera field of view.

Scene API: asynchronous initialize (waits for model/bakes), updateProgress, resize, pauseAmbient, reduceQuality, render, metrics and dispose. `window.__unravelStudy()` exposes read-only snapshots for verification; no product API is implemented.

## Verification and review

`npm test` runs seven dependency-free tests covering camera bounds/order/reversibility, softened glow, sustained-performance detection and shared desktop/mobile framing. Typecheck and production build pass. Vite warns about the renderer chunk above 500kB; it is dynamically loaded and is approximately 268kB gzip after adding native GLTFLoader and area-light support. It is not downloaded in reduced-motion mode.

`tests/browser-checks.js` is a Playwright MCP function, executed with `browser_run_code_unsafe` using its repository-relative filename. It requires the dev server on 4174 and an existing browser connection; it is not part of `npm test` and installs no browser dependency. Seven browser scenario groups passed, including keyboard skip/focus, reveal ordering, offscreen pause, idle-camera stability, pause/resume, reverse/rapid scroll, mobile overflow/quality, live reduced-motion changes, context loss, unavailable WebGL and failed renderer loading.

Desktop/390px mobile screenshots were inspected. A production traversal was recorded under ignored `.playwright-mcp/landing-motion.webm`, using a 1280×720 viewport and 960×540 video. It reached the live 3D hero with ambient motion, no fallback and no page errors. Playwright's missing FFmpeg 1013 recorder binary was downloaded to the ignored cache and copied to its expected browser cache; it is not an application dependency.

One 180-frame desktop sample at 1440×900, device pixel ratio 1, Chromium 156.0.8078.80 on Windows/ANGLE Intel Iris Xe measured mean 14.6ms, median 12.8ms, p95 23.2ms. This is a short browser sample, not a sustained 60fps guarantee. The earlier high-resolution recording triggered the static fallback; the subsequent lower-resolution recording passed after adding an intermediate quality tier. Actual phones, Safari and Firefox remain untested.

Historically, the first prototype transferred approximately 2.74MB on a fresh production-context load, including its former 2MB artwork. That is not a measurement of the revised scene-derived previews. Current desktop opening/hero PNGs are approximately 575/513kB; mobile opening/hero are 140/102kB. Cached development timings are not a valid cold-load measurement. The procedural reconstruction is visually simpler than the approved artwork: no baked occlusion, physically simulated glass or volumetric light. Desktop now has a single cached overhead shadow map, world-scaled stone grain and blurred, surface-masked floor reflections. Final visual acceptance requires user review of the live experience before extending the landing page.

## Asset provenance

The independent generated artwork remains a design reference and is no longer used by the page. Active opening and fallback images are the four scene-start/scene-hero PNGs captured directly from the current Three.js renderer. The trace mark is the approved SVG downloaded from the Figma asset response; it remains an external SVG file with its original geometry. No complete Figma screenshot is used as UI. Runtime assets are all local.

Fonts are Manrope SemiBold, Inter Regular and IBM Plex Mono Regular from Google Fonts, self-hosted as TTF files with their SIL Open Font Licenses beside them. Google Fonts CSS download metadata is retained in `public/fonts/source.css` for provenance and is not loaded by the application. No paid asset or uploaded private reference was needed.


## First-frame continuity and poster maintenance

The opening preview and live canvas share camera, scene, light, material, fog, bloom and reflection state at ambient time zero. Both use identical intrinsic framing (desktop 1440x900, mobile 390x844) and CSS cover cropping. The canvas is revealed only after rendering; there is no opacity crossfade. The first live frame is drawn at time zero before exposure; ambient time then advances even before scrolling. The capture entry freezes time zero. Delayed-load pixel checks use Pause through the handoff, then verify that resuming animates the opening without camera drift. The desktop raster is intentionally capped rather than rendering an unlimited viewport resolution; large displays can appear softer. GPU/browser and DPR differences can still affect edge antialiasing.

CSS loads directly from the HTML head, independently of JavaScript. Reduced motion and no-JavaScript show a hero capture from this same scene. The hero keeps stable architecture/camera while crimson light position/intensity, atmospheric layers, architectural-edge emission and reflection strength change slowly. Pause freezes these values; no particles or moving structural geometry were added.

After changing scene, camera or dependency-lock inputs:

1. Start the dev server on 4174. Run Playwright MCP `browser_run_code_unsafe` with filename `prototypes/landing-motion/tests/capture-posters.js`. This opens the maintenance-only capture.html at DPR1, freezes ambient time and saves the four renderer-only PNGs. This entry is not included in the production build.
2. Run `npm run posters:stamp` only after those captures complete. The manifest records source hashes, image hashes and dimensions.
3. Run `npm run build`, which checks poster freshness and fails for stale scene inputs or changed images.
4. Run the Playwright MCP function `tests/handoff-checks.js` using its full repository-relative filename, then `node scripts/compare-handoff.mjs` from this directory. It holds the renderer download for 1.2 seconds and saves environment-only before/after images at 1440x900, 1280x720 and 390x844. HTML is masked for numeric comparison because Chromium changes text antialiasing when an opaque GPU layer appears; full UI is inspected separately.

Latest delayed-load checks passed for all three sizes. Mean environmental RGB differences were 0.194, 0.219 and 0.202 on the 0?255 channel scale; desktop/mobile maximum differences were 1, while the wider resampled crop reached 17 on a very small number of pixels. This verifies this browser/GPU at DPR1, not every device. Hero light/haze/edge values changed with a stationary camera and froze correctly when paused.

The seven regression scenario groups passed again. A fresh 180-frame 1440x900/DPR1 Intel Iris Xe/Chromium 156 sample measured mean 13.36ms, median 13.1ms, p95 17.4ms and 35 draw calls; this is a short sample, not sustained-device certification. `.playwright-mcp/landing-continuity.webm` records the revised delayed-load opening, journey and idle hero without fallback or page errors. The earlier landing-motion.webm belongs to the first revision. Final material/lighting fidelity and user aesthetic acceptance remain open.


## Blender/PBR asset study and native hero hold (current)

The user approved local Blender and free CC0 textures, plus native hold before considering snap. The procedural architectural shell is replaced with a reproducible Blender-authored GLB with distinct scanned wall/floor materials, normal/roughness maps, a second light/AO UV set, static indirect lighting and a separate AO atlas. Broad area lights and a filtered local softbox environment illuminate the PBR surfaces; one moving overhead source updates its shadow at a bounded cadence. Runtime posters were regenerated from this actual WebGL scene. Earlier measurements/screenshots above belong to prior revisions.

Current timing: the camera completes around 1.5 viewport heights; text and CTAs are fully revealed by 1.8. The sticky stage releases at 2.55, giving 0.75 viewport of fully revealed reading space. The whole wrapper is 3.55 small viewports high. There is no snap, timer lock, scroll smoothing or wheel cancellation. Further native scrolling exits normally; an extreme fling can still overshoot. Skip Intro goes to the complete hero within that hold. Short laptop viewports use smaller type to avoid CTA/workflow overlap.

Verification: typecheck, seven unit tests, poster freshness/integrity and production build passed. Eight browser regression groups passed, including missing GLB/bake files and prior keyboard/reduced-motion/graphics failures. `tests/hero-hold-checks.js` verifies full readable controls, ordinary overrun, stable scroll after input stops and native exit at 1440x900, 1440x700 and 390x844. The delayed-load environment checks still pass: mean channel differences 0.222/0.266/0.201 on a 0?255 scale; desktop/mobile max 1, with isolated wide-crop resampling differences up to 23. The comparison is environment-only, not a claim of cross-GPU pixel identity.

The current 180-frame Intel Iris Xe/Chromium 156 1440x900/DPR1 sample measured mean 16.16ms, median 15.6ms and p95 19.8ms. Hero render calls were 30 in the sampled frame; frames refreshing the moving shadow can add work. This is not sustained 60fps certification. The renderer chunk increased to about 899kB raw/268kB gzip because native glTF/area-light support is now included; Vite's chunk warning remains. No npm dependency was added. The GLB is about 1.98MB, indirect bake 454kB and AO bake 513kB; no new cold-transfer total is claimed.

`.playwright-mcp/blender-hero-arrival.webm` records the current journey, readable held hero, ambient motion and normal exit, without fallback or page errors. Offline Blender renders and the browser opening/hero were visually inspected. This is an asset-study review gate: final reference-level lighting/composition, real phones and Safari/Firefox remain unverified. Do not expand the landing page until user review.


## Final lighting and ceiling-ray polish (2026-11-10)

Current implementation adds src/ceiling-rays.ts: feathered, depth-tested light fans in the entrance and atrium, with slowly shifting beam bands and atmospheric density. Ambient animation begins before scrolling; architecture and idle camera remain stable. The low tier omits rays. This is an economical scattering approximation, not physically simulated volumetrics.

The doorway uses a tall area source. Reflections no longer distort UVs or use overlay coloring/discrete offset taps; the 640x400 target generates mip levels and samples them according to floor roughness to avoid replicated strip-light streaks. A tuned Three.js FXAA pass handles higher-contrast edges after tone/output conversion. A soft HTML-layer radial shade preserves hero text contrast. Composition, camera, reveal timing, focus and native hold are unchanged. No dependency or asset installation.

Run tests/polish-review.js through the existing Playwright MCP to record the idle opening, continuous crossing, held hero and pause. It writes .playwright-mcp/unravel-final-polish.webm and review frames, checks stationary idle camera/advancing ambient time, pause, complete hero and browser errors. It does not automate aesthetic approval. The normal browser/hero-hold/handoff checks remain separate. All screenshot/video artifacts are ignored local QA files.

Latest 180-frame warm hero sample at 1440x900, DPR1, Chromium 156, Windows ANGLE/Intel Iris Xe: mean 19.83ms, median 19.5ms, p95 24.6ms; 32 calls in the sampled frame, with shadow refreshes adding work. This falls short of the 60fps target and is not a sustained benchmark. Earlier 22?34ms samples used more expensive filtering; recording/compiler contention can also introduce stalls. Actual phones and other browsers remain unverified. Latest production renderer is approximately 904kB raw/270kB gzip; the chunk warning remains.


## Current: depth-aware interactive SideRays replacement (2026-11-10)

The flat ceiling-rays.ts component has been removed. src/side-rays.ts adapts the user-supplied React Bits SideRays noise/shafts into a Three.js composer pass, using world-space ceiling sources, the camera projection and opaque scene depth. Both composer targets carry depth textures so occlusion remains valid after buffer swaps. Scattering runs at quarter width/height on desktop and half on mobile, with 8/6 samples and depth-aware upsampling. Sources stay fixed during camera travel. There is no second rendering context or React dependency.

Pointer coordinates account for object-fit cover cropping. Bounded aim/focus values use frame-rate-independent damping; the same values influence actual room lights and a soft CSS text-gradient tint. Time/aim freeze during Pause, leave settles toward neutral, and no mouse interaction is required on touch. Reduced motion, fallback, offscreen/hidden rendering and disposal remain intact. Camera/reveal/native hero hold are unchanged.

The old punctual shadow map caused hard floor stripes; a VSM filtering trial introduced ribbing. The current implementation uses the existing authored indirect/AO shading with moving surface illumination, without live shadow mapping. View-depth occlusion does not model shadows cast into the volume from the light source. Atmospheric shafts themselves are not included in the planar reflection; illuminated surfaces are. These are explicit prototype limitations.

Attribution: SideRays shader behavior adapted from React Bits by David Haz, supplied by the user. The complete upstream MIT + Commons Clause notice is retained in public/licenses/react-bits.txt, with upstream source at https://github.com/DavidHDev/react-bits. This is integrated application code, not a standalone component distribution. No package installation was needed.

Verification additions:

- npm test now runs 10 tests, including bounded/damped pointer movement, frame-rate independence, pause and cover-crop coordinates.
- tests/ray-depth-fixture.ts is a Vite-served, browser-only controlled fixture: run page.evaluate(async () => (await import('/tests/ray-depth-fixture.ts')).checkRayDepth()) on the local preview. A wall in front of the volume blocks every lit pixel; hiding it lights the fixture; restoring it verifies depth after a buffer swap. The module is excluded from production entries.
- Run tests/side-rays-review.js with the existing Playwright MCP. It records left/right pointer response, slow forward/reverse threshold crossing, live hero, CSS headline wash, pause and neutral-on-exit; camera stability and absence of errors/fallback are checked. Current movie: .playwright-mcp/unravel-side-rays.webm. Corresponding opening/crossing/hero frames were inspected.
- The existing eight browser scenario groups, three-size hero hold, regenerated posters and delayed-load checks remain applicable. Aesthetic judgment is not automated.

Final short 180-frame warm hero sample: 1440x900, DPR1, Windows ANGLE/Intel Iris Xe, Chromium 156; mean 24.57ms, median 24.3ms, p95 29ms, 32 calls in the sampled frame. This is approximately 41fps and falls short of 60fps. An unsettled sample reached 45ms; a later foreground-DOM throttling trial showed 55?89ms means with large stalls and was reverted. The stall cause was not isolated; sustained smoothness remains unresolved. Renderer chunk is approximately 908kB raw/272kB gzip; Vite's chunk warning remains. Real phones and other browsers remain unverified. Previous sections/recordings describe historical revisions.


## Hero-only UI ray correction ? 2026-11-10

Supersedes the preceding depth-aware ray implementation, which the user rejected visually. The approved correction is a clearly visible screen-space light effect across the hero typography. src/hero-rays.ts retains the supplied SideRays vertex/fragment shaders and uses a small TypeScript WebGL lifecycle wrapper, rose/cool-white colors and damped pointer aiming. A transparent canvas sits above the headline, below navigation/CTAs, and ignores pointer events. It fades in with the hero reveal; the entrance has no ray overlay. This is intentionally a UI effect, not physical lighting or shadows.

Removed the volumetric composer pass, its depth targets and added room lights, plus the substitute CSS text tint. The background returns to cool/crimson illumination without the amber scattering treatment. Camera, reveal/hold timing, reduced motion and pause controls are preserved. The overlay shares the existing render lifecycle, caps its raster at 700,000 pixels, pauses offscreen/hidden, and is hidden for reduced motion/fallback. Source license remains under public/licenses/react-bits.txt. No dependency installation.

Browser checks verified live pointer response with a stationary camera, pause, mobile layout and reduced-motion hiding. Source changes required new background captures; all four were regenerated. Current overlay screenshot: .playwright-mcp/hero-ui-rays.png. Earlier depth/SideRays recordings and performance measurements describe rejected revisions; no fresh performance claim is made here. User review of the actual hero is the next checkpoint.


## Opening text rays and stable architectural strips ? 2026-11-10

The user requested the same UI ray effect over the opening copy, slightly stronger and from above, plus a fix for strip flicker/late appearance. One existing overlay now switches profiles: a stronger top-down source focused on the opening copy, and the existing side source for the hero. Each follows its copy's opacity; the middle of the passage stays clear. Pointer response, pause, reduced motion, control stacking and the same canvas/render loop are retained. These remain UI effects rather than physical room lights.

The imported atrium emitters were only 0.06 scene units wide/deep, so distant strips could cover less than a pixel. No distance-based reveal was present. architecture.ts now corrects only the named edge-emitter mesh at load: vertical boxes are widened to 0.16 by at least 0.12, shifted 0.025 toward the room, and bounds are refreshed. The original GLB/Blender source remains unchanged. The import correction is specific to this authored axis-aligned asset; revisit it if replacing the model. Existing wall occlusion remains. The strip emission pulse was reduced from +/-0.15 at 0.38 rad/s to +/-0.035 at 0.18 rad/s; ambient room motion continues.

Verification: typecheck, 9 unit tests, production build/poster integrity and eight browser regression groups passed. tests/entrance-polish-checks.js samples the projected furthest strip through eight small desktop camera moves (progress 0 through 0.12); it retained 123?180 red pixels in the test region, including 180 at the starting view. This checks sampled coverage rather than guaranteeing every GPU/viewport. Opening pause, clear middle transition, hero profile and reverse behavior passed; desktop/mobile images were inspected. All four environment posters were regenerated. Handoff comparisons mask the separate UI-ray canvas as well as text so they compare environmental pixels only.

Current movie: .playwright-mcp/opening-rays-strip-fix.webm; the opening-to-hero traversal reached the live desktop hero without page errors or fallback. No dependency, infrastructure or camera/scroll choreography changes. No new sustained frame-rate claim. User visual review remains the next checkpoint.
