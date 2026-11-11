# Unravel visual design discussion

Last updated: 2026-11-10

## Status and scope

The user approved **Interior Architecture V2 as the visual foundation** and authorized an isolated doorway-to-hero browser prototype. The doorway leads to a new expansive architectural interior. Strong foreground typography, depth, atmospheric crimson lighting and restrained ambient movement guide the implementation. The prototype exists under `prototypes/landing-motion`; the full landing page and dashboard are not implemented. The user accepted the opening/hero prototype on 2026-11-10. Sustained performance budgets and production readiness remain unverified.

**Current state:** The user accepted the working opening/hero prototype and requested one final copy polish. Entrance rays retain a visible ceiling-to-copy shaft, feathering away below the supporting text; display text is larger, brighter and more tightly set using the existing Manrope 600. Desktop/mobile views were inspected. Treat the entrance as settled and discuss the normal product-story sections next; do not expand implementation without the next task.

Current creative scope is only the landing page: doorway, hero, normal product sections, the diagnostic section's hidden zoom transition, and its reveal. Dashboard/authentication/settings design is deferred. Reduced motion remains required but is an accessibility fallback, not another primary hero direction. Revise the existing Figma file after agreeing on a direction; do not create a separate exploration file or expand into dozens of screens.

## User's creative brief

- Act 1: monumental black architecture, a crimson-lit doorway, shadows/reflections and convincing depth. Forward camera movement should feel spatial rather than like a flat image zoom. A scale silhouette is optional.
- Act 2: entering the doorway reveals the hero: **Every bug has a story.** Supporting idea: **Untangle the sequence behind bugs.** Premium dark atmosphere, clear typography, restrained warmth, considered materials and motion.
- Later discovery: after the hero and normal product sections, a realistic diagnostic interface presents an HTTP failure in context. Continued ordinary scrolling progressively enlarges a meaningful detail inside that interface until it reveals actions, requests, replay, reproduction steps, and test generation; regular scrolling resumes afterward. A 500/final zero is a candidate anchor, not a mandatory standalone portal composition.
- Product sections should explain real capabilities with meaningful previews. Dashboard screens prioritize legibility, speed, navigation, and information hierarchy.
- Consider responsive layouts, ordinary-laptop performance, keyboard access, reduced motion, loading, and the ability to reach the product without completing a long cinematic sequence.

## Reference register

Reviewed on 2026-11-09 through live browser views and page content:

| Reference | Observed lessons | Original application to explore |
| --- | --- | --- |
| [Raycast](https://www.raycast.com/) | Dark hero, bold central typography, red atmospheric geometry, clear navigation and CTA | Strong type over restrained crimson-lit depth; avoid copying its diagonal forms |
| [Resend](https://resend.com/) | Spacious composition, material-rich dark object, clear separation of copy and visual | Make a small number of objects feel deliberate and substantial |
| [NullChat](https://nullchat.tech/) | Scroll enlarges typography into a transition with a strong color reveal; editorial spacing and numbered sections | Explore a 500/zero aperture reveal connected to Unravel's explanatory sequence |

The attachment directory contained only the text brief. The two supplied images were subsequently located in the workspace and visually inspected:

- [Doorway reference](../design/references/doorway-reference.webp): monumental cool-toned walls, overhead light, a narrow crimson seam, tiny human silhouette, and irregular reflections on a dark rough floor. The cold ambient/warm emissive contrast is important to its depth.
- [Hero reference](../design/references/hero-reference.png): Raycast screenshot with bold central white typography, restrained navigation, and concentrated red-lit diagonal background forms. Use its hierarchy/contrast as reference, not its exact geometry.

Preserve these user-provided reference files. Browser screenshots are temporary ignored research artifacts under `.playwright-mcp/`; neither website screenshots nor supplied references have been selected as production assets.

## Creative proposal awaiting feedback

### Approved opening behavior

The user selected a short cinematic entrance with a subtle Skip Intro control and an accessible reduced-motion alternative. Begin with roughly 1–2 viewport lengths of scrolling, but prioritize monumental scale, natural camera movement, and a seamless emergence of the hero through crimson light. This is not a fixed-distance budget: propose any additional scroll distance from evidence in a working prototype rather than silently stretching or rushing the sequence.

The previous continuous red-wave/trace proposal is not accepted as the hero background. Continuity should come from architecture, materials, camera direction, lighting, and later interface details rather than relying on a generic ribbon.

### Clarified landing-page journey

Doorway approach → cross the crimson threshold → hero in the same visual world → normal recording/integration/workflow sections → diagnostic interface showing a plausible failure → progressive zoom into a detail inside that interface → reveal the recorded sequence and test workflow → regular product sections and final CTA.

The diagnostic interface should be readable before zoom starts. Preserve its element as the same visual object during approach/reveal; do not insert an unrelated giant 500 scene. Use ordinary wheel/touch scrolling, with a bounded pinned transition only if it earns its place. The 500 denotes a controlled example, not an actual landing-page failure or guaranteed root-cause diagnosis.

### Selected primary direction and parked alternatives

1. **Interior architecture (selected):** pass through the doorway into a new expansive atrium with suspended lintels, staggered side walls, substantial depth and restrained crimson side lighting. Keep the typography readable against dark central negative space. Glass or sculptural details can enrich the architecture without becoming another independent theme. Subtle motion remains an intended treatment to validate later, not implemented animation.
2. **Obsidian lens:** a compact split smoked-glass/obsidian prism refracts the doorway light behind and beside the typography. Distinctive material-focused identity, but realistic transmission/refraction and caustics require a more careful asset/performance approach.
3. **Tension sculpture:** a suspended folded metallic membrane catches a moving crimson edge light behind the typography. More organic and expressive, but risks feeling unrelated to the doorway; prefer authored deformation over real fluid simulation.

The other alternatives are parked; do not develop all three. Prioritize materials and light over geometry alone; the old flat-vector doorway does not establish reference-level cinematic depth.

Prototype data must remain illustrative; chronology does not establish backend root cause and generated code previews do not establish a passing test.

## Rendering decision for the isolated prototype

Use Three.js for one continuous architectural environment, GSAP ScrollTrigger for native-scroll progress, CSS sticky positioning for the bounded entrance and HTML for type/controls. No Spline, React Three Fiber, smooth-scroll package or application framework is selected. Independent concept images are visual references only. Active previews/fallbacks are direct current-scene captures, not textured planes pretending to be a moving environment. Reconstruction differences from the generated artwork were explicitly accepted.

Travel initially spans two viewport heights. Approach the doorway, cross through crimson light, allow the atrium to become visible, then reveal the heading at 75–88%, supporting copy at 82–94%, and controls/workflow at 88–100%. These are tunable scroll-progress ranges, not elapsed-time durations. The camera settles before text completes. Reversing scrolling reverses the presentation.

Ambient light intensity/position, soft atmospheric layers and floor highlights continue while the hero is idle; structural geometry and camera remain stationary. Desktop uses a softened, surface-masked planar reflection and a single cached overhead shadow map; mobile uses a cheaper floor light treatment. Depth fog is not volumetric light. There are no moving shadow maps or physically simulated glass. The procedural materials and lighting remain simpler than the approved artwork; refinement depends on user review.

Reduced motion bypasses the entrance and ambient motion. Keyboard Skip Intro focuses the heading; the ambient control freezes the background. A lower-cost quality tier precedes static fallback under sustained poor performance. Missing WebGL, context loss and failed renderer loading preserve the static hero. Ordinary product sections and the diagnostic zoom remain deferred.

Initial prototype checks (historical): typecheck, four unit tests, production build and seven browser scenario groups passed. Desktop/mobile images were inspected, and a production traversal was recorded with no page errors or static fallback. A short 1440×900 Intel Iris Xe sample measured mean 14.6ms/p95 23.2ms frame intervals; this does not establish sustained performance or real-phone coverage. Vite reports the dynamically imported renderer chunk above 500kB raw (about 141kB gzip). Full details: [prototype README](../prototypes/landing-motion/README.md).

## Earlier technical candidates (historical)

- GSAP ScrollTrigger: coordinate bounded scroll scenes and progress; preserve native scrolling.
- Minimal Three.js scene: true camera movement and occlusion for architectural depth, with restrained materials, baked/simple lighting, and a fallback poster.
- Layered 2.5D composition: lower runtime complexity, but a constrained viewpoint and limited spatial movement.
- Pre-rendered frames/video: high visual control with asset-production, loading, memory, and seek tradeoffs. Not automatically the fastest approach.
- SVG/CSS: typography portal, ordinary transitions, and accessible interface layout.
- Do not add Spline, React Three Fiber, scroll-smoothing libraries, or other tools unless the chosen design justifies them.

Need a measured prototype before committing to scene complexity or promising performance. Reduce/remove camera travel and pinning for reduced motion; keep all product content accessible. Recompose for mobile rather than shrinking the desktop scene. No autoplay audio or flashing transition is proposed.

## Visual exploration workflow proposal

1. Develop the selected Interior Architecture direction; keep doorway/hero continuity and readability central.
2. Revise the existing file into a short continuous landing-page storyboard: threshold-to-hero, normal product-flow context, readable diagnostic interface, and its zoom/reveal. Annotate how normal scrolling connects the compositions.
3. Review spatial continuity, material/lighting quality, typography, and the surprise transition before expanding the page. Keep the old report-detail and fallback frames as historical work; do not expand them now.
4. The separately agreed doorway-to-hero browser study is now implemented. Review it before expanding scope. The later interface zoom remains deferred; static Figma frames cannot validate either motion sequence.
5. Record approved decisions here and update tokens/components as the direction stabilizes.

## Visual exploration 01

[Open Unravel — Visual Exploration](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4)

The user authorized a new Figma file. Account/file creation and edit access were verified. This is a set of static editable compositions, not a functioning camera/scroll prototype:

- [Crimson doorway](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-43): original vector architectural scene, entry copy, Skip Intro, and Reduce motion.
- [Hero](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-44): crimson trace, main tagline, supporting copy, actions, and workflow strip.
- [500 aperture](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-45): the final zero reveals illustrative request metadata.
- [Report detail](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-46): editable replay preview, synthetic event timeline, and safe request details.
- [Mobile](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-47): recomposed poster and hero at 390px width.
- [Reduced motion](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-48): direct hero with static artwork and no camera travel.

Exploration typography is Manrope for display, Inter for interface text, and IBM Plex Mono for technical labels. Colors, typography, and button components are linked to a small local concept foundation; these are proposals, not an approved production design system. Text, UI, and artwork are editable native/vector layers. No complete-UI screenshot is used as the deliverable.

Skip Intro links to the hero frame; Reduce motion links to the static alternative in Figma. These navigation reactions were read back, but do not establish runtime keyboard support, accessibility conformance, camera motion, or device performance. All six compositions were visually inspected; text-height, button-label, mobile-width, and aperture-alignment defects were corrected. Font families, editability counts, and absence of remaining placeholders were verified.

Automatic approval review blocked uploading the local doorway reference image to Figma because authorization to transfer the source image to that external service was not established. No reference image was uploaded and no workaround was attempted. Original vector artwork was created instead; the supplied reference remains local. No AI image generation/credits, new tool installation, Docker, or database setup was used.

The file/node state ledger is `design/figma/exploration-state.json`. This first pass is historical exploration awaiting the agreed revision; its red wave and standalone 500 are not approved directions. Resume edits in this file rather than creating a duplicate. No Figma frames were changed during the subsequent feedback discussion.

## Visual exploration 02 — static revision complete, awaiting review

Same Figma file; no duplicate exploration was created:

- [Doorway approach / revised](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-43): generated original background placed behind existing editable copy and controls. The earlier vector artwork is hidden, retained as history.
- [Crossing into the atrium / new keyframe](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=17-16): the same atrium background is visible through foreground jambs, expressing the intended spatial handoff.
- [Interior Architecture hero / revised](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-44): new atrium artwork, central tagline and editable actions. The old wave is hidden. Visually inspected with readable foreground typography.
- [Product-flow storyboard / revised](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=2-45): ordinary recording section, readable diagnostic panel, enlarged keyframe of the same failed-request component, sequence/test-plan reveal and final CTA. The old detached portal content is hidden. This long frame depicts successive scroll states, not a requirement to display the enlarged badge as an ordinary page section.

Report detail, mobile and reduced-motion concept frames were not edited. The new asset studies are saved under [interior-architecture-v2](../design/concepts/interior-architecture-v2/README.md), including exact prompts. They were generated through built-in ImageGen from original textual descriptions, without submitting the local reference image. Their upload into the requested Figma revision succeeded. No Figma AI credits were used.

Doorway, crossing, hero and full product flow were visually inspected, with additional readable diagnostic/reveal screenshots. Structural checks found no text-frame overflow or remaining placeholders in the revised compositions. These raster layers contain only scene artwork; text/interface elements remain native Figma layers. Report/mobile/fallback positions, sizes and descendant counts match the pre-revision baseline. Skip Intro, Reduce motion and See the workflow navigation destinations were read back successfully. Runtime motion and accessibility are unverified.

The applied product-flow specification and section IDs are retained in `design/figma/pending-landing-flow-v2.json`; its filename records the earlier checkpoint. Current validation and node metadata live in `design/figma/exploration-state.json`. The user approved this foundation and the isolated opening motion study. The later diagnostic transition remains unimplemented.

Historically, a Starter-plan call limit interrupted this revision. After the user upgraded, `whoami` reported a Full student seat and the pending work succeeded in the same file. No alternate-connector bypass or additional file was used. No application code, packages or infrastructure were introduced.


## Opening continuity revision

The user rejected the visible switch from generated artwork into simpler live geometry. Active previews now come from the renderer itself, with camera/light/material/fog/bloom/reflection state at ambient time zero. Both the preview and canvas use desktop 1440x900 or mobile 390x844 intrinsic compositions and the same cover crop. The first live draw does not advance ambient time; ambient motion begins after the visitor starts progressing through the entrance. This trades unrestricted render resolution for matching composition and bounded GPU cost. High-DPR/GPU differences can still affect fine edge antialiasing.

World-scaled multiscale stone grain, rougher material response, recessed crimson emitters, softer masked reflections and a cached overhead shadow improve the existing scene without changing the approved journey. The hero has slow crimson-light travel, haze drift, edge-emission variation and reflection changes; camera and architecture remain stable. Pause and reduced motion remain supported. No particles, moving structural forms or new runtime dependencies were added.

A deliberately delayed renderer-load comparison passed at desktop, wide desktop and mobile sizes. Environment-only mean channel differences were approximately 0.194/0.219/0.202 out of 255. Desktop/mobile maximum differences were 1; the wider crop had isolated resampling differences up to 17. Text is masked for numeric comparison because Chromium changes font antialiasing across compositing modes; full UI was inspected separately. Mobile no-JavaScript fallback also shows the same-scene hero with no horizontal overflow.

Six unit tests, poster hash/integrity verification and production build pass; the seven browser regression scenario groups passed again. The revised traversal video is `.playwright-mcp/landing-continuity.webm`. Current short desktop sample: mean 13.36ms, median 13.1ms, p95 17.4ms, 35 draw calls on Intel Iris Xe/Chromium 156 at 1440x900/DPR1. Earlier measurements above belong to the initial prototype. These checks establish continuity on the tested browser, not reference-image photorealism or real-phone performance. Review live before expanding scope.


## Creative/realism review ? historical proposal, subsequently approved

The user finds the current environment too artificial and the hero too easy to overshoot. First-frame continuity is a separate solved defect; it does not establish reference-level visual quality. The latest approved Figma artwork remains the quality target.

Browser comparison shows repetitive rounded-box columns, limited material separation and indirect illumination, broad uniform stone response, and a floor whose reflections lack the reference's spatially varied wet/dry detail. The scene uses a procedural color image for both albedo and bump, mostly constant roughness, no authored lightmap/environment map, and a cached shadow map. Current moving light does not produce correspondingly moving cached shadows. Additional screen-space decorations would not resolve these causes.

Scroll diagnosis from actual browser inspection: camera reaches its final pose at 75% of the 2-viewport trigger range, while CTA opacity reaches 1 only at 100%. The 300svh journey's sticky stage begins leaving at exactly that endpoint. At 1440x900, scrollY=1800 has stageTop=0; scrollY=1935 has stageTop=-135. After a 500px wheel input near completion, desktop/mobile stages moved about 360/331px above the viewport. Positions stayed unchanged after input stopped: no autonomous page-scroll tween was observed. The issue is missing fully revealed hero dwell space and late reveal timing, not ScrollTrigger pinning/snap/scrub lag; current code has no such pin/snap/scrub configuration.

Recommended asset workflow, not yet approved: use already installed Blender 4.2 for a composed architectural shell, material/lighting look development and a camera path. Import an optimized glTF/GLB and dedicated maps into the existing Three.js renderer. Use scanned PBR wall/floor maps, authored UVs, static indirect-light/AO baking and modest live lighting/reflections. A lightmap needs explicit UV/export/runtime integration; Blender beauty-render quality does not transfer automatically into glTF. First review a small opening/atrium asset study against the reference, then compare its actual WebGL rendering before widening implementation. Preserve same-renderer poster capture/freshness checks. No Blender process, texture download or asset build was started during this review.

Candidate free materials: [Concrete Wall 006](https://polyhaven.com/a/concrete_wall_006), [Concrete Floor Worn 02](https://polyhaven.com/a/concrete_floor_worn_02), with [Poly Haven's CC0 asset license](https://polyhaven.com/license). They are candidates to sample, not selected production assets. Begin with a small 1K/2K material set rather than indiscriminate high-resolution downloads. Existing Blender executable was found at C:/Program Files/Blender Foundation/Blender 4.2/blender.exe; render/bake capability and duration are not yet benchmarked.

Motion direction proposal: an authored camera/target path with a clear arrival, cold light entering through a real opening, crimson spill tied to recessed emitters, a spatially occluded light shaft, slowly shifting light/shadows and changing rough-floor reflections. Keep the headline region readable. A peripheral architectural detail can move if it supports the light story; no decorative-object collection is selected. Reuse the single renderer and HTML text layer. Do not add React, OGL or another full-screen WebGL context just to consume a component.

Resource findings:

- [Codrops cinematic scroll article](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) and [author companion source](https://github.com/JosephASG/codrops-cinematic-scroll-animations): camera/target timelines, coordinated text beats and shader uniforms are transferable. Its React/R3F/OGL wrappers, long scroll stages and ScrollSmoother settings should not be imported wholesale. Direct article fetch returned 403; indexed official article content and actual author source were inspected.
- [Blender camera-path tutorial](https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/): confirms a usable authoring/export concept. Our path should be open and finite; do not copy the demo's looping path or input-observer navigation.
- React Bits [Light Rays](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/LightRays/LightRays.tsx): React wrapper over a screen-space WebGL2 shader with depth disabled, not architectural volume lighting. Dark Veil and Threads likewise have independent WebGL2 canvases and abstract/2D fields. Source licensing is MIT plus Commons Clause; retain/check the exact license before any future adaptation.
- [Aceternity Spotlight source](https://ui.aceternity.com/registry/spotlight.json): React/SVG blurred ellipse with CSS keyframes. Useful UI lighting inspiration, not an architectural light/shadow solution.
- Three.js [PBR material](https://threejs.org/docs/pages/MeshStandardMaterial.html), [environment filtering](https://threejs.org/docs/pages/PMREMGenerator.html) and [glTF loader example](https://threejs.org/examples/webgl_loader_gltf.html) supply the required runtime building blocks without a framework migration.

Recommended scroll experiment, awaiting preference: finish camera/text reveals before the sticky release and provide a short, finite fully revealed interval, initially around 0.75 viewport of scroll, with native scrolling. No timer lock, wheel cancellation or forced delay. Extreme momentum cannot be guaranteed to stop exactly at the hero without input intervention; consider narrowly scoped proximity snapping only if natural hold testing is insufficient. Product scrolling must resume normally. This does not require Blender or asset downloads and can be a separate small implementation task.

Two questions were presented: approval to use installed Blender plus selected free CC0 downloads, and preference for native hold versus localized proximity snap. No answer is inferred from the proposal or preselected options. No application implementation, dependencies, installation, production-asset download, commit or push occurred in this review.


## Blender asset study and native hero arrival ? implemented, review pending

The user explicitly approved the installed Blender + free CC0 texture workflow and selected native hold before proximity snapping. Blender 4.2.1 generated a composed shell with unequal bays, deep threshold returns, suspended lintels/rods and a continuous floor, using scanned concrete wall/floor colour, normal and roughness maps. Source maps were checksum-verified. The editable source, reproducible script, CPU look-development renders and provenance live under design/assets/architecture-v1. Static indirect illumination and ambient occlusion use distinct 1K atlases and a second UV channel. The GLB is approximately 1.98MB. Source portability was verified with Blender process exit 0.

WebGL uses the existing Three.js runtime, native glTF loading, filtered local environment fill, broad rectangular lights and the baked maps. One slowly moving overhead spot updates its actual shadow at a bounded cadence; static indirect light stays baked. A depth-tested approximate light shaft, small haze movement and changing floor reflections provide ambient motion without moving the room or camera. This is not physically simulated volumetric scattering or real-time global illumination. No React, paid asset, new npm dependency or new MCP server was introduced.

Native scrolling remains unmodified. Camera travel finishes around 1.5 viewport heights, all text/controls by 1.8, and the sticky stage releases at 2.55. The 0.75-viewport reading interval absorbs the tested ordinary overrun; further input exits normally. No snap, timer lock, input cancellation or automatic page movement was added. Laptop-height typography was adjusted so controls do not collide with the workflow strip. An extreme fling can still overshoot, as discussed and accepted when choosing native hold.

Current checks: 7 unit tests, typecheck, poster freshness/integrity and production build passed. Eight browser regression groups passed, including missing model/bake assets. Hold/readability/normal-exit checks passed at 1440x900, 1440x700 and 390x844. Delayed-load environment differences averaged 0.222/0.266/0.201 out of 255; desktop/mobile maximum 1, isolated wide resampling maximum 23. Posters were recaptured from the actual WebGL asset, not the offline Cycles images. Current video: .playwright-mcp/blender-hero-arrival.webm, with no page errors or fallback in the recorded traversal.

A short 180-frame Intel Iris Xe/Chromium 156 1440x900/DPR1 sample measured mean 16.16ms, median 15.6ms and p95 19.8ms, with 30 draw calls in the sampled hero frame. Frames updating the shadow add work. The renderer grew to roughly 899kB raw/268kB gzip for native glTF and area-light support; Vite's chunk warning remains. This does not certify sustained device performance. Reference-level photorealism, final composition acceptance, real phones and Safari/Firefox remain open review items. Do not extend the rest of the landing page until this study is reviewed.


## Final entrance polish ? 2026-11-10

The user explicitly selected ceiling/side light rays adapted to the room and authorized the previously discussed crimson/readability corrections. The architectural composition and camera path remain intact.

- Added a dedicated ceiling-rays.ts component: two ceiling-anchored, depth-tested light fans with feathered edges and slowly shifting bands/mist. These are lightweight transparent 3D surfaces, not a second canvas or UI background. They approximate atmospheric scattering; they are not a volumetric simulation. Nearby architecture occludes them. The low-performance tier disables them.
- Removed the progress gate that froze ambient time until 5% scroll. The opening now moves before scrolling. The first live frame is still rendered at time zero to match its captured preview, then ambient time advances. Pause, reduced motion, visibility and offscreen behavior remain supported.
- Replaced the doorway point light with a tall area source to distribute crimson spill along the fixture. Removed roughness-driven reflection-coordinate offsets and nonlinear overlay coloring. A correctly proportioned 640x400 reflection target uses roughness-biased mip filtering: the earlier separated filter taps duplicated narrow emitters into parallel streaks. This is surface-reflection filtering, not increased full-screen bloom.
- Added a tuned Three.js FXAA pass after output conversion. Anti-aliasing the canvas alone would not cover the offscreen composer. Full-target multisampling and a longer FXAA edge search were tested but cost too much on the tested integrated GPU; the final shorter search preserves wall detail and treats higher-contrast edges.
- Added a feathered central exposure reduction as the heading reveals, leaving peripheral rays and crimson motion visible. HTML text, controls, reveal timing and native 0.75-viewport hold remain unchanged.

No React, new rendering context, npm dependency, external asset or tool installation was needed. React Bits Light Rays supplied visual inspiration; its React/OGL component was not copied or installed. Existing Three.js/GSAP handle the effect. No Figma nodes or authored Blender assets were changed.

Latest checks and review artifact paths are maintained in PROJECT_STATUS.md and the prototype README. Browser evidence validates behavior on the tested Chromium/GPU, not universal realism, accessibility conformance or sustained 60fps. The next visual task should be the agreed product sections after user review, rather than another architectural look-development cycle.


## SideRays replacement ? 2026-11-10

This supersedes the flat-curtain portion of the preceding polish entry. The user supplied React Bits SideRays source and approved richer colored/pointer-responsive rays integrated with the room. The earlier custom curtains had no pointer interaction; rotating their flat geometry around floor positions could shift the apparent ceiling source during camera travel.

Implementation: src/side-rays.ts adapts the supplied hash/noise/shafts behavior into the existing Three.js composer. Fixed world-space ceiling sources define two bounded light volumes. Camera/inverse-projection matrices and the current opaque depth buffer bound short ray integrations; no light planes rotate toward the camera. A quarter-width/height desktop target (half-width/height mobile), 8/6 integration samples and depth-aware upsampling bound cost. This is an approximate scattering effect with view-depth occlusion, not fully shadowed volumetrics or global illumination. It does not sample light-source shadow visibility or reflect the atmospheric volume itself in the floor.

src/ray-motion.ts maps pointer coordinates through the canonical canvas cover crop and damps bounded aim/focus values. These drive both the ray field and real spot/area illumination, so surfaces and their existing reflections respond. A low-amplitude CSS text gradient shares the damped response/time to give the foreground headline a warm wash; it is an intentional typography treatment, not physically lit HTML. Keyboard controls and readability stay intact, including forced-color support. Touch does not require pointer following. Pause freezes both time and aim; pointer exit returns to neutral; reduced motion/fallback remain static.

Browser isolation identified the hard floor bars as punctual spotlight shadow-map artifacts. PCF and a VSM blur experiment failed the visual review (the latter produced ribbed bands). Live shadow mapping is omitted in the replacement; authored indirect/AO maps provide architectural grounding while light intensity/direction animate. This is a deliberate fidelity/complexity tradeoff, not a claim of moving physical shadows.

The first depth-pass trial was too diffuse and amber. Shaft contrast, density and warm/cool blending were revised before the final recorded crossing; no decorative overlays were added. The adapted source retains attribution and the full React Bits notice at public/licenses/react-bits.txt. No React, shadcn install, new dependency, external asset or new WebGL canvas was introduced.

Verification includes a controlled occluder fixture (completely black with a wall before the volume, visibly lit without it, black again after buffer swap), recorded left/right pointer movement, fixed idle camera, forward/reverse crossing, text wash, pause and pointer-exit checks. Current results/artifacts and measured GPU limits are in PROJECT_STATUS.md and the prototype README. Aesthetic acceptance remains with the user.


## Hero-only UI ray correction ? 2026-11-10

Supersedes the preceding depth-aware ray implementation, which the user rejected visually. The approved correction is a clearly visible screen-space light effect across the hero typography. src/hero-rays.ts retains the supplied SideRays vertex/fragment shaders and uses a small TypeScript WebGL lifecycle wrapper, rose/cool-white colors and damped pointer aiming. A transparent canvas sits above the headline, below navigation/CTAs, and ignores pointer events. It fades in with the hero reveal; the entrance has no ray overlay. This is intentionally a UI effect, not physical lighting or shadows.

Removed the volumetric composer pass, its depth targets and added room lights, plus the substitute CSS text tint. The background returns to cool/crimson illumination without the amber scattering treatment. Camera, reveal/hold timing, reduced motion and pause controls are preserved. The overlay shares the existing render lifecycle, caps its raster at 700,000 pixels, pauses offscreen/hidden, and is hidden for reduced motion/fallback. Source license remains under public/licenses/react-bits.txt. No dependency installation.

Browser checks verified live pointer response with a stationary camera, pause, mobile layout and reduced-motion hiding. Source changes required new background captures; all four were regenerated. Current overlay screenshot: .playwright-mcp/hero-ui-rays.png. Earlier depth/SideRays recordings and performance measurements describe rejected revisions; no fresh performance claim is made here. User review of the actual hero is the next checkpoint.


## Opening text rays and stable architectural strips ? 2026-11-10

The user requested the same UI ray effect over the opening copy, slightly stronger and from above, plus a fix for strip flicker/late appearance. One existing overlay now switches profiles: a stronger top-down source focused on the opening copy, and the existing side source for the hero. Each follows its copy's opacity; the middle of the passage stays clear. Pointer response, pause, reduced motion, control stacking and the same canvas/render loop are retained. These remain UI effects rather than physical room lights.

The imported atrium emitters were only 0.06 scene units wide/deep, so distant strips could cover less than a pixel. No distance-based reveal was present. architecture.ts now corrects only the named edge-emitter mesh at load: vertical boxes are widened to 0.16 by at least 0.12, shifted 0.025 toward the room, and bounds are refreshed. The original GLB/Blender source remains unchanged. The import correction is specific to this authored axis-aligned asset; revisit it if replacing the model. Existing wall occlusion remains. The strip emission pulse was reduced from +/-0.15 at 0.38 rad/s to +/-0.035 at 0.18 rad/s; ambient room motion continues.

Verification: typecheck, 9 unit tests, production build/poster integrity and eight browser regression groups passed. tests/entrance-polish-checks.js samples the projected furthest strip through eight small desktop camera moves (progress 0 through 0.12); it retained 123?180 red pixels in the test region, including 180 at the starting view. This checks sampled coverage rather than guaranteeing every GPU/viewport. Opening pause, clear middle transition, hero profile and reverse behavior passed; desktop/mobile images were inspected. All four environment posters were regenerated. Handoff comparisons mask the separate UI-ray canvas as well as text so they compare environmental pixels only.

Current movie: .playwright-mcp/opening-rays-strip-fix.webm; the opening-to-hero traversal reached the live desktop hero without page errors or fallback. No dependency, infrastructure or camera/scroll choreography changes. No new sustained frame-rate claim. User visual review remains the next checkpoint.


## Accepted opening/hero and final copy polish ? 2026-11-10

User accepted the prototype and asked to confine entrance light to the copy and strengthen typography. The UI ray mask now follows measured headline/supporting-copy bounds on setup, font readiness and resize. Desktop display size increases to a 56px cap (from 48px), with tighter line height/tracking and brighter text; mobile uses a 36?44px range. Reused Manrope 600, matching the hero's display family/weight; no font installation or artificial weight was added. Architecture, strips, camera, hero and scroll timing unchanged.

Next proposed slice: normal product-story sections after the hero, ending in a readable diagnostic preview. Build the diagnostic scroll zoom/reveal separately afterward. These are explanatory UI previews; SDK/report/replay/test generation remains unimplemented. Keep landing work bounded so the actual product pipeline remains the project's priority. No new stack, infrastructure or product features are approved by this discussion.


## Entrance ray visibility correction ? 2026-11-10

User clarified that the ray shaft must remain visible: tightening should stop spill below the copy, not hide the ceiling-to-text beam. The small radial mask was too restrictive and is replaced with a soft horizontal corridor and a vertical fade ending just below the supporting text. The larger typography is retained. Desktop/mobile browser views confirm visible animated rays from above through the copy, with floor spill suppressed. Hero, camera and scene assets unchanged.


---

# Archived current-design document before internal overhaul - 2026-11-11

# Approved landing foundation and product design review

Updated 2026-11-11. The user accepted the doorway/hero prototype; no further look-development cycle is authorized. Historical references, exploration records and rejected lighting experiments remain in [DESIGN_HISTORY.md](DESIGN_HISTORY.md).

## Latest implementation: material consistency and real regression workflow

Shared charcoal/crimson layered surfaces now cover authentication, projects, registration, SDK setup, settings, reports and the new reproduction/plan workspace. Keep the contained compositions described in [INTERNAL_UI.md](INTERNAL_UI.md). Large scrolling cards avoid true backdrop blur after browser inspection exposed offscreen compositor artifacts; bounded navigation/dialog surfaces retain it. This is a material refinement of approved V2, not a new design direction or landing redesign.

Investigation now links to a functional Reproduction & test plan tab, with readable steps, structured controls, JSON editing, review messages and save/export states. The desktop workspace stacks on mobile. The older references below that describe these stages as planned are historical. Fresh recordings retain bounded safe presentation; legacy recordings remain structural. Masking and separate-origin isolation are preserved.

Actual browser screenshots were inspected across auth, projects, registration, setup, settings, reports, investigation, plan editing and not-found states at desktop/mobile sizes. Loading/error layouts were source-reviewed. Exact checks and limitations are owned by PROJECT_STATUS.md. No Figma frames, landing renderer or original prototype files changed in this task.

## Internal application compositions

The user identified repeated disconnected page layouts and selected Raycast's actual Settings, Extension Manager and launcher as the primary internal UI reference. The implementation guide and reusable composition inventory now live in [INTERNAL_UI.md](INTERNAL_UI.md); do not duplicate their rules here. Approved V2 typography/identity and Figma compositions remain the baseline. All supplied `design/references/internal-ui/1.png` through `8.png` were inspected, along with the user's new screenshots and the linked Raycast documentation. V2 projects/investigation design contexts and screenshots were read from the existing Figma file; no Figma frames were changed.

Settings now uses a contained group with aligned divided rows, inset controls, an integrated action/status footer and a separate compact deletion surface. Native dialogs use the shared floating-surface composition. Projects, reports, new-project forms and investigation headings reuse shared compositions instead of adding another page-specific CSS patch. Existing settings-only geometry/dialog rules were removed from the V2 stylesheet. The cinematic landing and SDK widget implementation remain unchanged; the standalone widget's existing Shadow DOM style recipe is documented rather than coupled to React/dashboard CSS. Actual checks belong to PROJECT_STATUS.md.

## Project-management completion - historical first layout

The initial management UI used a separate explanatory column and form; the composition system above supersedes that geometry. Project tabs, owner-managed edits, origin confirmation and typed deletion behavior remain intact. Fixture connection setup is separate developer scaffolding, not part of the visitor widget.

## Internal product V2 - approved and implemented, 2026-11-10

The user approved V2 and authorized implementation. The application now uses the compact project-switching header, project rows, framework-specific SDK setup, integrated replay/evidence workspace and complete floating recorder. V1 and both Figma comparison columns remain preserved; this implementation task made no Figma edits. Cinematic scene code and the original prototype remain unchanged.

Runtime adjustments: the investigation divider is pointer/keyboard adjustable on wide screens and stacks on narrow screens; event filters and readable details use actual recorded evidence. Fit restores the nested replay viewport after panning. The recorder is 424px on desktop with safe mobile margins, reachable controls on short screens, a minimized recording dock, draft retention, retry and explicit discard. Shadow DOM isolates host styles; system/available Inter fonts avoid fetching fonts on visitor sites. Reduced-motion mode disables decorative transitions. Reproduction/plan/export remain visibly planned, not enabled functionality.

Production Chromium checks exercised the complete visitor-to-developer flow, actual replay, resize/filters and responsive layouts. Desktop/mobile projects, investigation, setup, recorder and anonymous sign-in were inspected. These checks do not establish universal accessibility or real-phone/browser coverage. Actual verification belongs to PROJECT_STATUS.md.

The user found V1 structurally useful but visually insufficient and explicitly required preserving it. **04 · Product identity / V2 comparison** contains separate V1 copies in the left column and V2 alternatives in the right; the original V1 page, shared masters and styles were not edited. Its before/after structural fingerprint matches (`1acd66fc`, covering layer names/types/positions/sizes, text, fonts and fills). New V2-only typography/material styles avoid changing existing instances.

| Composition | Side-by-side comparison | V2 detail |
| --- | --- | --- |
| Projects | [V1 / V2](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=74-240) | [V2 projects](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=69-148) |
| Investigation | [V1 / V2](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=74-245) | [V2 investigation](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=70-154) |
| Floating recorder | [V1 / V2](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=74-250) | [V2 mounted recorder](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=72-163) |

- Projects keeps the collection layout: 32px page headings, more deliberate vertical rhythm, quieter row actions, actual Unravel trace mark, and visible hover/focus studies. An empty-state alternative and onboarding notes remain review annotations, not simultaneous production sections.
- Investigation replaces two separately framed cards with one replay/evidence workspace. A larger replay stage, consistent transport, chronological markers, quiet event rows and selected-request key/value details establish hierarchy. Investigate → Reproduce → Protect gives direction; the latter capabilities remain explicitly planned. Structural replay and synthetic opt-ins are represented honestly; no improved capture fidelity is implied. Trade-off: a fixed composed inspector needs carefully bounded resizing and stacking during implementation.
- Recorder grows from 360px to 424px on desktop, with 15px body text, 52px primary controls, clearer recording status/timer, a captured-session summary and stronger floating depth. It is mounted on an editable realistic Question desk website mockup, with launcher and Ready/Recording/Retry studies below. All eight V2 component states exist separately. Trade-off: better readability occupies more of the host page; narrow viewports must reflow to safe margins, and short viewports need internal scrolling with reachable controls. Recording must leave the host site interactive. Visitor expectations remain optional report description context, not validated test assertions.

The existing component research continues to inform restrained selection, panel sizing and launcher expansion. No new library/asset installation or external image upload. Three V2 compositions and three comparison views were visually inspected; final V2 compositions and recorder masters have zero text-bound overflow, shared text styles and the intended Manrope/Inter/IBM Plex Mono families. No flattened UI/image layers. Close-control alignment was refined and the launcher added after the first visual pass. Motion and actual accessibility remain unverified static specifications. Metadata: [internal-ui-v2-state.json](../design/figma/internal-ui-v2-state.json).

The following exploration notes describe the preceding static design task. Its statements about unverified motion and no runtime changes are historical; current implementation evidence is recorded above and in PROJECT_STATUS.md.

## Internal product V1 - retained comparison baseline, 2026-11-10

The user requested a stronger internal identity and approved exploring three compositions before application changes. The earlier M2 direction below is historical approval, not approval of this revision. Keep the product spacious and purposeful: Manrope headings, Inter controls/body, IBM Plex Mono technical labels, charcoal surfaces and restrained crimson. The selected navigation is a compact global header/project switcher rather than a persistent sidebar. The SDK must supply the complete floating visitor workflow out of the box; it is not implemented yet.

New editable compositions on **03 · Product identity / V1** in the existing file:

- [Projects](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=58-31): populated collection with exact origins and direct report/setup actions; compact empty-state alternative and onboarding interaction notes are review material below the main layout.
- [Investigation](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=60-37): dominant structural replay, desktop resizing affordance, chronological evidence, filters and readable selected-request details. Reproduction/JSON plan/export remain explicitly planned. Synthetic example content is illustrative, not a live replay in Figma.
- [Floating recorder](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=61-42): launcher, eight reusable panel states (Ready, Starting, Recording, Describe, Submitting, Retry, Success, Discard), a 390px treatment and interaction/privacy notes. Proposed expansion is 180-240 ms with reduced-motion support; actual runtime focus, animation and responsiveness remain unverified. The recording state must leave the underlying website interactive.

Existing color/spacing variables, typography styles and button masters are reused. The recorder family and event-row master are local components outside the review compositions. All UI remains native text/frames/instances; no full-UI raster, AI-generated asset, paid resource, new library subscription or package installation. All three final screenshots were inspected; wrapped-text overlap, inherited button-label widths and a header encoding defect were corrected. Final bounds checks report zero text overflow; fonts are Manrope, Inter and IBM Plex Mono. Original landing and onboarding frame sizes/descendant counts match their loaded-page baselines. Metadata lives in [internal-ui-state.json](../design/figma/internal-ui-state.json).

Component research informs patterns rather than requiring dependencies: sliding selection from Motion Primitives Animated Background; filename/highlight/copy presentation from Aceternity Code Block; desktop panel sizing from shadcn Resizable; restrained launcher expansion from Morphing Popover. Keep React/motion runtimes out of the standalone widget. Aceternity's stacked tab animation and continuous Border Beam effects are not selected defaults. shadcn Sidebar is not needed for the selected compact navigation. Onboarding annotations call for React/Next.js tabs, copy feedback and progress based on an actually received report, not a fabricated installation check.

No application redesign or SDK widget was implemented in this task. Review these static compositions before authorizing UI changes. Authentication and complete onboarding redesign are not additional deliverables here.

## Current identity and experience

- Monumental dark architectural entrance, cool concrete/stone, crimson recessed illumination and controlled floor reflections.
- One continuous camera approach through the threshold into the atrium; keep the geometry mostly stationary.
- Entrance: "A failure is only the beginning." Existing Manrope 600, larger/brighter copy. Clearly visible top-directed UI rays continue through the copy and feather away below supporting text; do not shrink them into a faint text-only patch.
- Hero: "Every bug has a story." Environment appears before headline/supporting copy/CTAs. Rose/cool-white SideRays move over typography with restrained pointer response; these are UI light effects, not physical shadows.
- Inter interface text and IBM Plex Mono technical labels. Existing licensed local font bytes are retained with application-scoped family names.
- Preserve current camera, glow, ray behavior, typography values and canonical framing during framework migration. Assets/strip importer correction are preserved; no new renderer, React Three Fiber, particles or decorative waves.

## Motion and accessibility

Native scroll, no smoothing or input hijacking. Camera completes around 1.5 viewport heights; full hero at 1.8; sticky release at 2.55 provides 0.75 viewport of reading space. Extreme flings can still pass the hold.

Keyboard Skip Intro focuses the heading. Pause freezes ambient/ray motion but allows navigation. Reduced motion and unavailable graphics present the same-scene static hero. Useful content remains available without JavaScript. Resize/mobile recompose the canonical scene; graphics pause offscreen/hidden and dispose on route exit.

## Remaining landing flow - planned

Doorway - hero - ordinary recording/workflow sections - readable diagnostic interface - bounded zoom into a detail in that same request element - sequence/replay/reproduction/JSON-plan/Playwright explanation - normal sections and final CTA. No detached giant-error screen. Reduced motion presents the panels consecutively.

Use the existing [Figma file](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4). Frame IDs and applied storyboard remain in design/figma/exploration-state.json and pending-landing-flow-v2.json. Do not rerun historical construction or create a duplicate file. Refine only consequential desktop/mobile/diagnostic/report-detail compositions; implement ordinary sections from shared tokens. Product preview content must distinguish illustrative data from working features.

## Assets and boundaries

User references under design/references and original concept studies are retained, not deployed as full-UI screenshots. Current runtime assets are the Blender GLB, PBR/bake data, local fonts/mark and renderer-derived fallback captures. Source/licenses are preserved. Active application paths and maintenance procedures are in ARCHITECTURE.md and README.md.

The Vite reference remains unchanged. Its successful historical checks are not proof of Next.js parity or performance; current evidence belongs in PROJECT_STATUS.md. No changes to Figma or Blender assets are required for Milestone 1.

## Product access and onboarding - approved direction, 2026-11-10

The user authorized Milestone 2 with email-code and Google sign-in. Four native editable concepts are on the new page **02 - Product access & onboarding** in the existing Figma file; the accepted landing frames were not changed:

- [Sign-in](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=41-63): restrained split composition, Google and passwordless email; auth internals use Clerk components.
- [Projects / empty desktop](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=41-93): project-first navigation and useful empty state without invented activity.
- [Website registration](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=41-131): name/origin fields and a clear next step.
- [Projects / mobile](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=41-168): single-column content and large controls.

All four were visually inspected; clipped rows/input fields and wrapped button labels were fixed. Existing buttons, color/spacing variables and text styles are reused; missing field/navigation primitives are local components. Fonts verified as Manrope, Inter and IBM Plex Mono. No complete-UI raster or paid/AI-generated asset was used. The user approved this direction. Implementation adds a restrained architectural trace on sign-in, visual Register / Integrate SDK / Investigate steps, and beginner-friendly URL normalization/validation with immediate SDK-setup routing. Actual provider component internals follow Clerk capabilities; actual Clerk UI and authenticated projects/registration/setup were inspected at desktop and mobile sizes without horizontal overflow. Google and email-code sign-in were confirmed by the user. State is in design/figma/onboarding-state.json. No 3D scene belongs in the dashboard.

## Report UI implementation - 2026-11-10

The report list/detail extends the approved practical dark workspace without changing Figma, the landing scene or typography assets. Replay and timeline are side by side on larger screens and stacked on narrow screens. Status, partial-recording/privacy limits, actual-player seeking, keyboard range controls, fit/100% inspection and confirmed deletion are functional UI. Replay deliberately uses original masked structure without original styles/resources; this is a fidelity boundary, not a screenshot-parity claim. Production desktop/mobile captures were visually inspected, including fixing stale pan offset when returning to fit. Current evidence and browser scope are recorded in PROJECT_STATUS.md; REPORTS.md owns local operation/security details.



# Archived internal composition guide before A/B redesign - 2026-11-11

# Internal application compositions

This is the implementation guide for product UI. [DESIGN.md](DESIGN.md) owns visual direction and references; [PROJECT_STATUS.md](PROJECT_STATUS.md) owns actual verification. Backend and SDK privacy behavior have separate owners. Do not copy old page markup or append a page-specific CSS patch when a composition fits.

## Foundation

Use Raycast's actual application UI as the primary reference: [Settings](https://manual.raycast.com/settings), [Manage Extensions](https://developers.raycast.com/information/developer-tools/manage-extensions-command), and [Themes](https://manual.raycast.com/themes). The supplied `design/references/internal-ui/1.png` and `8.png` show contained settings groups and aligned rows; the user's launcher/extension screenshots illustrate restrained floating surfaces and contextual actions. Resend informs breathing room; Sentry informs replay/evidence hierarchy. Do not copy macOS window chrome, fill navigation with nonexistent features, or add effects to compensate for layout.

Retain the approved V2 Manrope headings, Inter body and IBM Plex Mono technical values, charcoal identity and crimson selection/focus accents. Three depth levels: quiet page canvas, contained editing/collection surface, strongest shadow on floating dialogs/widget. Use inset control surfaces rather than outlining every block. Keep body/control text 14–15px, captions 12–13px and technical labels 11–12px; do not use captions for primary instructions.

## Code owners and recipes

`apps/web/src/features/workspace/compositions.tsx` owns reusable markup; `compositions.css` owns geometry, material tokens and responsive rules for it. Existing `workspace.css` owns shared type/control foundations and `product-v2.css` owns the application shell and remaining approved feature layouts. All are scoped to `.unravel-workspace`; marketing must never import them.

| Composition | Use and rules | Current usage |
| --- | --- | --- |
| `PageContent` + `PageHeader` | One H1, short purpose, optional context and relevant actions. Wide for collections/investigation; 1000px maximum for settings/forms. Align navigation to the contained content width. | Projects, reports, registration, settings |
| `SettingsGroup` + `SettingRow` | Header and icon, divided label/control rows, support text near its field. Desktop labels and controls align; phone rows stack. Do not put a loose explanatory column beside an oversized form. | Settings and registration |
| `ActionBar` | Footer belongs to its editing group. Status at the start, reset/cancel then primary action at the end. Distinguish unchanged, unsaved, pending, saved and error states. Keep submitted values on failure. | Settings and registration |
| `ResourceCollection` + `ResourceItem` | One surface, quiet heading/count, repeated semantic list rows and optional footer. Title, meaningful metadata, contextual actions; no invented metrics or disabled fake filters. A row with several actions is not wrapped in another link. | Projects and report list |
| `EmptyState` | Explain absence and one useful next action. Do not render populated and empty alternatives simultaneously. “No matches” must differ from “no resources” when search is implemented. | Projects and report list |
| `ProductDialog` | Native modal with labelled title/description, contained body and separate action footer. Cancel first, destructive action last. Opener owns show/close, pending cancellation policy and focus return. Use typed confirmation for project deletion. | Origin change and deletion |
| `InvestigationSurface` + `PanelHeading` | One bounded replay/evidence surface, concise panel toolbar, functional controls. Feature code retains refs, resizing, player isolation and timeline behavior; narrow viewports stack panels. | Report investigation |
| `ProjectTabs` | Real Reports / SDK setup / Settings links with current location. Preserve the project switcher/account menu; do not invent sidebars for three destinations. | Project routes |

The SDK widget stays framework-independent with its own Shadow DOM stylesheet. Its 424px floating panel, clear state heading, 15px body, generous primary control and restrained shadow are the floating-recorder recipe. Do not import React compositions, application fonts or dashboard CSS into the SDK. This pass does not change recorder behavior or claim that app CSS automatically styles it. Compare widget materials with the same approved V2 foundation during future changes.

## Craft and behavior

- Prefer short supporting copy, a restrained group header and subtle row dividers. Put technical identifiers in read-only rows, not beside a detached paragraph.
- Keep destructive actions in a separate compact, quiet surface. Reserve solid red for the final confirmation; explain irreversibility before collecting confirmation.
- Keep labels associated with controls and errors referenced by `aria-describedby`; maintain status/alert announcements. Do not replace native semantics with clickable divs.
- Preserve visible keyboard focus, native scrolling, safe modal margins and internal overflow on short screens. Do not hide the account button when suppressing mobile account text.
- Keep motion to short background/focus transitions. Respect reduced motion. No automatic layout travel, particle backgrounds or general glass blur on ordinary forms.
- Do not silently change APIs, ownership, privacy defaults or data retention while refining presentation. New product behavior requires its own agreed task.

## Completion check for every page change

Use the real authenticated page and representative content. Inspect at 1366×768, 1440×900, 390×844 and a narrow 320px viewport where appropriate. Check overflow, long text, focus, pending/error/success and applicable empty states. Exercise dialogs with keyboard and inspect actual screenshots; static Figma and passing builds do not establish visual quality.

Run relevant repository commands from README and report actual outcomes. Update this guide only when a reusable pattern changes; link to it from design/agent documentation instead of duplicating token values and rules. Further pages should compose these primitives or extend them for a concrete need, not grow an unrelated visual system.

## Shared material treatment and plan workspace

`product-materials.css` owns the common product/auth surface finish: restrained charcoal/crimson canvas gradients, translucent card fills, edge highlights and inset controls. True backdrop blur is limited to bounded header/dialog surfaces; large scrolling panels use inexpensive layered materials, avoiding offscreen compositor artifacts. `features/reports/test-plan.css` owns the plan editor's responsive two-column/stacked layout. Keep these separate from business logic and the cinematic landing.

Report workflow tabs switch between investigation and a real reproduction/plan editor. Edits stay in memory when switching tabs; persistence is explicit. Use grouped controls, concise review messages and a shared footer. Future widgets/pages should use the same material hierarchy without adding blur to every nested row.
