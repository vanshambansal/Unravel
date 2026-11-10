# Technical decisions

Updated 2026-11-09 following the implementation reset and authorization of a minimal testing website.

## Implementation reset (historical, 2026-11-09)

- **Date:** 2026-11-09
- **Decision:** Remove Phase 1 without a backup; preserve Git and project documentation. Remove the identified project PostgreSQL container, network, data volume, and local credentials. Do not scaffold a replacement yet.
- **Context:** The user wants shared understanding and informed participation in product, architecture, workflow, and design decisions before implementation.
- **Alternatives:** Selectively reuse the existing foundation (previous recommendation) or rebuild after a full reset. The user explicitly selected complete removal, including local database data.
- **Consequences:** The reset removed the application and test tooling; historical results do not establish current functionality. Implementation choices below were reopened for discussion. Global tools, Docker Desktop/images, and unrelated resources were retained. The subsequent fixture authorization is recorded below.

## Minimal local test website

- **Date:** 2026-11-09
- **Decision:** Create only a lightweight integration target under `fixtures/test-site`, using plain HTML/CSS/JavaScript and Node built-in HTTP/test modules. No package installation, framework scaffold, Docker, database, external service, or new API key is required.
- **Context:** The user wants a minimal website for exercising Unravel while prioritizing product completion. They do not have an existing website to use and require discussion before Docker or similar infrastructure is started.
- **Alternatives:** Reuse an existing website (not available) or create another framework application (unnecessary setup for this fixture).
- **Consequences:** A real intentionally failing HTTP request, ordinary form interactions, a private dummy field, and an intentional JavaScript error are available as future integration scenarios. This plain JavaScript fixture avoids a transpiler; TypeScript remains preferred for product application code. React/Next.js SDK compatibility still requires separate verification later. No Unravel features or product architecture choices are implied.

## Current product and collaboration agreements

- Aim for a hosted portfolio product with controlled synthetic demonstrations and documented limitations.
- Preserve the reusable recording-to-report-to-JSON-plan-to-test product goal. Playwright remains the intended first export target; this does not select the rest of the implementation stack.
- Discuss consequential product, architecture, privacy/security, and visual choices before implementing them. Routine details remain the agent's responsibility within agreed scope.
- Authentication, authorization, and public-ingestion protections are mandatory before public deployment.

## Confirmed: visitor access, initial interactions, and masking

- **Date:** 2026-11-09
- **Decision:** Visitors report without an Unravel account; developers authenticate. Start with ordinary forms, clicks, native selections, and SPA navigation, with explicit limitations. Mask sensitive information/input values by default and use safe replacement values where needed for test plans.
- **Context:** The user confirmed the three product recommendations during the discussion following the reset.
- **Alternatives:** Visitor sign-in, broad interaction coverage, or permissive value capture would respectively increase reporting friction, implementation scope, or privacy exposure.
- **Consequences:** Anonymous reporting needs ingestion abuse controls; unsupported interactions must be disclosed. Detailed privacy policies and technical mechanisms still need definition. These product agreements do not select a framework, database, provider, or authorize rebuilding the removed stack.

## Approved visual-exploration scope and intro pacing

- **Date:** 2026-11-09
- **Decision:** Create a new Figma visual-exploration file. Start the doorway study near 1–2 viewport lengths with a subtle Skip Intro control and a reduced-motion alternative; natural camera travel and a seamless hero reveal take precedence over a fixed distance.
- **Context:** The user wants a monumental, immersive entrance without a rushed reveal or mandatory long sequence.
- **Alternatives:** An extended introduction or showing the hero immediately inside the doorway scene were discussed; the user selected the short cinematic entrance with flexibility based on a real prototype.
- **Consequences:** Static editable concepts can be reviewed now. Further scroll distance must be proposed from prototype evidence. This approves neither a renderer/library nor the proposed palette, fonts, production assets, or website implementation. See DESIGN.md for the concept file and validation limits.

## Selected visual direction: Interior Architecture

- **Date:** 2026-11-09
- **Decision:** Develop Interior Architecture in the existing Figma exploration, focusing only on relevant landing frames. The doorway leads to a new expansive interior rather than another view of the doorway; use depth, atmospheric crimson light, restrained moving forms and optional subtle glass/sculptural details around readable foreground typography.
- **Context:** The user selected this direction after rejecting the generic wave and disconnected oversized-500 scene. Ordinary product sections should lead to a diagnostic detail that becomes the later hidden scroll transition.
- **Consequences:** This approves the creative direction, not final artwork, typography/colors, renderer, libraries, or website code. New original concept backgrounds were generated and placed; the static Figma revision and visual checks are complete after the student-plan upgrade restored access. The user subsequently approved V2 as the visual foundation and authorized the isolated opening motion study recorded below. Its aesthetic review and broader runtime validation remain open. See DESIGN.md for the current state.

## Historical architecture choices (superseded by reset)

The following table preserves previous rationale only. It is not current authorization to select a stack, install dependencies, or restart the old phases.

| Decision | Rationale and tradeoffs |
| --- | --- |
| Next.js App Router + TypeScript for landing page and dashboard | Provides a maintained React framework and routing conventions for both interfaces. TypeScript supports maintainability; browser replay code needs careful server/client boundaries. |
| Standalone browser TypeScript SDK for recording and reporting | Keeps customer installation independent of frontend frameworks and separates capture from dashboard concerns. Bundle size and browser compatibility require validation. |
| Next.js Route Handlers + TypeScript for initial backend APIs | Supersedes the initial separate Express decision. One application runtime is sufficient for bounded ingestion and plan export; modular server services preserve a future extraction boundary. Hosted browser execution would require an isolated worker, not execution inside request handlers. |
| One repository with pnpm workspaces, without Turborepo/Nx | Keeps coordinated changes together without an orchestration layer. Create shared packages only in the phases that need them. Pin pnpm 10.34.9: it works with installed Corepack 0.33.0; the registry's latest pnpm 12.18.0 launcher failed with that Corepack version. |
| PostgreSQL as primary database | Provides relational integrity and transactions for persistent product data. Schema and replay payload storage details remain undecided. |
| Drizzle + node-postgres; PostgreSQL 18.6 local Compose service | SQL-oriented typed access and reviewed migrations fit bounded relational metadata and replay payloads. The foundation uses an explicit baseline migration with no product tables. Connection and migration tooling are verified against real PostgreSQL; product persistence remains Phase 3. |
| rrweb for browser session recording and replay | Reuses an established capture/replay solution instead of building DOM recording. Privacy controls, fidelity, and payload handling still need implementation and testing. |
| Playwright for generated regression tests | Produces readable browser tests developers can edit and run. Export alone does not prove regression coverage; generated tests need validation. |
| Framework-independent JSON test plan with deterministic generation | Keeps editable intent separate from executable framework code. Playwright is the first adapter. Expected behavior requires developer confirmation; recordings alone cannot infer correct assertions. No LLM dependency initially. |
| GSAP ScrollTrigger for the two major landing-page scroll interactions | Provides dedicated scroll animation controls for the two intended interactions. Visual design is unspecified; implementation must consider accessibility and reduced motion. |
| Question Submission demo as controlled target | A deliberately failing HTTP request exercises browser actions, network metadata, error feedback, and later regression tests. The demo does not define SDK or plan contracts. Separate uncaught-error tests will verify JavaScript error capture; HTTP 500 alone is not a JavaScript exception. |
| Local-only initial phases; deployment security mandatory | Defer provider choices without pretending CORS or a website identifier is authentication. Authentication, ownership authorization, and public-ingestion protections are required before public deployment. |

## Historical foundation tooling compatibility

Node 22.18.0 was available. Registry engine/peer checks and actual builds verified Next.js 16.4.5, React 19.3.1, TypeScript 5.9.3, Vitest 5.1.0, Playwright 1.65.0, Drizzle 0.45.4, Drizzle Kit 0.31.11, and node-postgres 8.23.1. The lockfile pins transitive resolutions.

ESLint 10.14.0 uses TypeScript ESLint and the direct Next.js plugin. The broader Next lint preset introduced legacy plugin peer incompatibilities with ESLint 10; omitting it also avoids unnecessary plugins. Drizzle Kit currently brings two deprecated esbuild-kit transitive packages; these are upstream tooling dependencies, not application dependencies.

GSAP implementation is deferred; it is not installed. Recording limits and SDK bundle-size budgets remain provisional until measured.

## Open implementation choices

Frontend/backend framework and runtime boundaries, package manager/workspace tooling, database and access library, recording/replay library, authentication/deployment providers, design/motion tooling, and milestone sequence are open for discussion. Product contracts and privacy policy must be agreed before implementation. No replacement stack or infrastructure is selected.

## Entry template

### <Decision title>

- **Date:** YYYY-MM-DD
- **Decision:** What was chosen.
- **Context:** The problem and relevant constraints.
- **Alternatives:** Options actually considered; do not invent evaluation history.
- **Consequences:** Benefits, costs, and tradeoffs.

## Approved landing visual foundation and isolated motion study

- **Date:** 2026-11-09
- **Decision:** Approve Interior Architecture V2 as the visual foundation. Implement only the doorway-to-hero study using TypeScript/Vite, Three.js, GSAP ScrollTrigger and semantic HTML/CSS in a separate prototype directory with a local npm lockfile.
- **Context:** The user explicitly accepted reconstruction differences from the generated images, an isolated study before choosing the product framework, and adaptive mobile 3D. Real perspective and doorway occlusion require geometry; the existing background images are not a 3D scene.
- **Alternatives:** Layered artwork has limited camera freedom; pre-rendered sequences require an authored scene/rendering pipeline. Spline and a React wrapper add workflow/dependencies without supplying the missing architecture.
- **Consequences:** One continuous scene and reversible native-scroll progress; typography stays accessible HTML. Reduced motion and graphics failures use the local approved poster. Geometry is batched, rendering pauses offscreen/when hidden, and a cheaper tier precedes static fallback. No product framework, backend, database, deployment or diagnostic transition is selected/implemented. See the prototype README for actual checks, provisional quality guardrails, asset provenance and performance limitations. The user must review the moving experience before expansion.


## Scene-derived previews and stable first-frame handoff

- **Date:** 2026-11-09
- **Decision:** Replace the independent generated-artwork runtime preview with captures of the exact current Three.js scene. Use shared canonical desktop/mobile camera rasters and cover cropping; draw at ambient time zero before exposing the canvas, with no opacity crossfade. Load CSS independently of JavaScript.
- **Context:** The user found the attractive artwork-to-simpler-geometry switch artificial and explicitly required continuity from the first environmental frame. A longer fade would preserve the mismatch.
- **Alternatives:** Hide all architecture until WebGL loads, or retain the unrelated image and mask its transition. Same-scene previews preserve a useful first paint and provide matching graphics-failure/reduced-motion fallbacks.
- **Consequences:** A source/image hash manifest makes builds fail when captures become stale. Recapture after scene/camera/dependency changes, using the documented maintenance entry and existing browser tools. Canonical rasters bound cost and stabilize cropping but can soften large displays; cross-GPU pixel identity is not promised. Hero ambient motion changes lighting, haze and reflections while camera/structure stay stationary. No product stack, infrastructure or dependency changes are implied.


## Approved: Blender asset workflow and native hero hold

- **Date:** 2026-11-09
- **Decision:** Use installed Blender 4.2 locally and download selected free CC0 wall/floor textures from Poly Haven. Test native hold first instead of localized proximity snapping.
- **Context:** The user explicitly selected both options after the realism/overshoot review. The prior procedural scene had a material/asset-quality gap, and full CTA reveal coincided with sticky release.
- **Alternatives:** Continue generating all assets inside Three.js, switch to a pre-rendered sequence, or introduce proximity snapping. Retain the existing runtime while improving the authored asset; revisit alternatives only if measured visual results remain inadequate.
- **Consequences:** Editable Blender source and reproducible bakes/export, native glTF loading with explicit second-UV light/AO maps, free material provenance and same-WebGL-scene posters. Reveal completes at 1.8 viewport heights and sticky release at 2.55, leaving a 0.75-viewport reading interval. No forced delay/input interception; an extreme fling remains possible. No framework migration, new npm dependency, paid resource or infrastructure is authorized by this choice. The first integrated asset study requires visual review before expansion.


## Final polish: room-integrated ceiling rays and filtered crimson reflections

- **Date:** 2026-11-10
- **Decision:** Use a small native Three.js ceiling-ray component, a tall doorway area light, roughness-filtered planar reflection and tuned post-process FXAA. Keep the existing authored geometry, camera and native hero hold.
- **Context:** User approved ceiling/side rays and a final polish pass. Opening ambient motion was gated behind scroll; thin emissive strips were aliased and the roughness offset/discrete reflection taps distorted or duplicated their reflections.
- **Alternatives:** Import React/OGL backgrounds, add another rendering library/context, use expensive volumetric marching or multisample all HDR targets. These add integration/GPU cost without improving this bounded task enough. Full-target multisampling and the default longer FXAA search were tested and rejected on measured cost.
- **Consequences:** Visible opening/hero light motion within one renderer, unchanged navigation, no new dependencies/assets. Rays approximate scattering with feathered depth-tested surfaces and are disabled in the low tier. Post-processing and same-scene posters must stay synchronized. Performance remains device-dependent; no universal 60fps claim.


## Approved replacement: depth-aware SideRays and pointer-linked illumination

- **Date:** 2026-11-10
- **Decision:** Supersede flat ray curtains with an attributed adaptation of the user-supplied React Bits shader in the existing Three.js composer. Reconstruct world-space view rays from scene depth, integrate bounded ceiling volumes at reduced resolution, and share damped pointer response with room illumination and a restrained CSS headline tint.
- **Context:** User found the earlier effect too faint/noninteractive and visually broken during crossing. The flat surfaces were a poor substitute for the requested SideRays behavior. The supplied fullscreen shader alone has no scene depth/physical lighting.
- **Alternatives:** Mount the React component over the page, retain billboards, or add a full shadowed volumetric system. The chosen adaptation keeps the current TypeScript shell/renderer and provides actual camera/depth continuity. No React/shadcn installation is needed.
- **Consequences:** Added depth textures and a reduced-resolution pass, bounded pointer listeners/disposal and measurable GPU cost. Retained React Bits attribution/license. Baked indirect/AO replaces the harsh live shadow map after PCF/VSM visual experiments; surface lighting moves, but no physical moving-shadow or reflected-volumetric claim is made. Static posters must be regenerated after changes. Current laptop measurements remain below the 60fps target. No change to camera, native scroll/reveal/hold, product stack or infrastructure.


## Approved correction: supplied SideRays as a hero UI layer

- **Date:** 2026-11-10
- **Decision:** Supersede the rejected depth-aware rays with the supplied SideRays shader rendered above hero text, below controls, with rose/cool-white colors and damped pointer aiming. Preserve the shader; adapt its React lifecycle to the existing TypeScript shell.
- **Context:** The user wants an attractive visible light sweep across typography, not physically accurate room illumination. The volumetric approach obscured architecture and failed that visual goal.
- **Alternatives:** Further volumetric tuning or a CSS-only highlight. The supplied component directly expresses the requested behavior.
- **Consequences:** A second transparent WebGL UI canvas, capped resolution and shared pause/visibility lifecycle. No React/package installation. Remove the room scattering/depth pass and added lighting/text gradient. No physical-shadow claim; performance requires measurement separately.


## Opening ray profile and runtime emitter coverage correction

- **Date:** 2026-11-10
- **Decision:** Reuse the UI ray canvas for a stronger top-down opening profile, retain hero side rays, and leave the middle passage clear. Widen the current asset's thin edge emitters at import, separate them slightly from the wall, and reduce their intensity pulse.
- **Context:** User requested opening text rays and reported strip flicker/late appearance. The authored 0.06-unit strips can undersample; no timed/distance reveal exists.
- **Alternatives:** Increase bloom, force strips through walls or rebuild/bake the whole asset. Import-time coverage correction addresses the thin geometry without changing the shell or occlusion.
- **Consequences:** Small, scoped runtime deviation from the unchanged Blender/GLB source. Revisit the named emitter correction when replacing assets; regenerate posters after rendering changes. No new library/canvas or camera/scroll changes. Desktop sampled visibility is verified, not universal pixel stability.
