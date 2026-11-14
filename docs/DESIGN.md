# Unravel visual direction

Updated: 2026-11-13

## Authority and approval

The cinematic doorway/hero's architectural identity is approved. On 2026-11-13 the user explicitly approved performance, camera responsiveness, coordinated reveals and lighting/edge/reflection fidelity improvements within that identity; the earlier literal entrance freeze no longer applies to these repairs. A replacement scene remains a separate visual decision. The internal application is an approved redesign task: V1/V2 remain references and history, not restrictions against replacing weak layouts. The user selected B for authentication and A for every other internal surface, then approved the coordinated motion direction for implementation. V1/V2 and both A/B explorations remain intact for reference. Runtime aesthetic acceptance is separate from this direction approval. A design proposal, implemented screen, passing check and user aesthetic acceptance are four different states.

This document owns visual intent. INTERNAL_UI.md owns patterns and implementation mapping; PROJECT_STATUS.md owns actual functionality/results; PROJECT_BRIEF.md owns requirements. Historical design discussion and superseded capability statements live in DESIGN_HISTORY.md. Do not infer current functionality from old Figma copy.

## Internal product brief

Create an expressive, cohesive developer application with Raycast-like material depth, Resend-like technical clarity and Apple-like proportions and fluid interaction. Charcoal and crimson connect it to Unravel's architecture. Craftsmanship is required; neither minimalism nor restrained motion is the primary objective.

Composition comes before components: establish each page's job, dominant working area, information hierarchy and next action. Purposeful space is welcome; empty acres, repetitive cards, caption-sized instructions and decorative metrics are not. Glass needs a visible layered context and crisp readable foregrounds, not a dark transparent fill on another dark fill.

Preserve real authentication, ownership, recording, persistence, replay and plan/export behavior. Keep scripts/resources blocked in replay. The widget remains standalone and style-isolated. Within the application, expressive materials and motion must support confident task completion. Authentication can carry more architectural atmosphere than evidence/data panels.

## Selected compositions and retained alternatives

- **A / Glass workspace:** a framed application with narrow project navigation, luminous edge hierarchy, layered charcoal materials and a connected replay/evidence workbench. Strong navigation continuity and a distinctly Unravel floating-recorder surface.
- **B / Open canvas:** horizontal navigation, larger uninterrupted working areas and contextual tools. Replay leads into a horizontal evidence sequence and readable reproduction/test-plan workflow. More visual openness, less persistent navigation.

Use A's framed glass workspace and persistent project navigation across product pages, and B's immersive architectural sign-in. Do not merge other B layouts into A without a concrete usability reason. Figma uses synthetic content; application screens use real authorized data.

## System requirements

- Typography: existing licensed Manrope and Inter remain available; mono is for actual code, identifiers and timestamps. Body and primary controls must be comfortably readable at normal scale. Candidate type scales and line heights live in Figma styles, not duplicated here.
- Materials: distinguish canvas, task surface and floating layer. Use edge light, directional shadows, tonal contrast and selective translucency; do not put every item in another rounded container. Compare candidates with and without atmospheric effects.
- Navigation: only real destinations. Projects, Reports, SDK setup and Settings must have clear context; no speculative teams, billing or analytics. Candidate A and B may propose different shells.
- Forms/settings: label-control relationships, useful grouping, clear saved/unsaved/error feedback, origin-change consequences and deliberate destructive confirmation. The name of the task, rather than a decorative eyebrow, establishes hierarchy.
- Collections: useful project/report metadata, contextual actions and realistic empty/long-list states. Search, status and metadata editing now use the shared collection/dialog patterns; current verification lives in PROJECT_STATUS.md.
- Investigation: replay is dominant; event chronology, selected evidence and the next reproduction action are visibly connected. Do not imply a network failure proves backend root cause. Masked and legacy replay limitations remain contextual.
- Plans/export: readable steps and structured actions/values/assertions lead to JSON and code views. Developer-confirmed expected behavior, missing-safe-value and stale-save states remain visible. Generation is implemented locally, not a planned placeholder.
- Recorder: complete explicit Start/Starting/Recording/Stop/Describe/Submitting/Retry/Success/discard workflow; show it on a plausible host website and at narrow width. Nothing records before Start, and nothing uploads before Submit.

## Motion and responsive intent

Author motion as part of the system: sliding selection, surface expansion, coordinated evidence selection, recorder state changes and clear save/copy feedback. Authentication may include soft architectural light/depth. Avoid delaying access to forms or moving evidence while it is being read. Animations must be interruptible, preserve focus and have reduced-motion equivalents.

Use 1440x900 desktop and 390x844 mobile design targets. Include short-screen behavior, long titles/origins, content overflow and keyboard/focus annotations. Static frames demonstrate layout and intent, not measured runtime animation, GPU performance or accessibility conformance.

## Review standard

Compare actual frames side by side using comparable content. Check visual hierarchy, proportion, readability, material depth, brand recognition, interaction coherence and supported states before proposing implementation. Review implementation later at realistic browser sizes against the approved target; functional checks alone cannot pass the visual gate.

Use the existing [Figma workspace](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4). Preserve prior pages and shared styles. New candidate foundations must not alter old instances. The exploration ledger under design/figma records exact frame IDs and validation.

## Landing boundary

Keep the approved camera journey, rays, light, materials, type and skip/reduced-motion behavior. Product storytelling and the same-request diagnostic zoom are now implemented as an extension of the approved Figma storyboard; see LANDING.md. The new internal look must not initialize the marketing renderer on auth/product routes. Existing scene artwork can guide or illustrate auth concepts without importing the full scene runtime.


## Approved A/B composition references

[Open the comparison entry point](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=96-237). The new page is **05 - Internal product / A & B**. Previous pages and shared masters remain intact. Sixteen native review compositions cover both candidates; the entry point, shared foundations and two nine-variant recorder families support them.

| Composition | A / Glass workspace | B / Open canvas |
| --- | --- | --- |
| Authentication | [A](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=84-35) | [B](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=84-201) |
| Projects | [A](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=84-87) | [B](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=84-245) |
| Settings | [A](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=87-49) | [B](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=87-292) |
| Investigation | [A](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=87-146) | [B](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=87-378) |
| Mounted recorder | [A](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=89-521) | [B](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=89-579) |
| Mobile investigation | [A](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=89-647) | [B](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=89-691) |
| Mobile recorder | [A](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=89-735) | [B](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=89-773) |
| Workflow and states | [A](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=91-199) | [B](https://www.figma.com/design/aMr55xjZKRkkLBSFuVN4u4?node-id=91-361) |

**Selected: A for product, B for authentication.** Persistent project context and adjacent replay, chronology and selected request details make a more connected investigation workbench. Architectural context is visible through the header/navigation; evidence/form surfaces stay readable. B gives replay more width and a horizontal sequence, but spreads the evidence-to-action relationship across more vertical space. The user explicitly selected B's authentication composition; other B frames remain comparison references.

Companion boards cover SDK installation, structured/JSON/export modes, report collection and planned management controls, registration validation, destructive confirmation, first-use/no-match/loading/failure guidance and responsive/motion annotations. They are pattern coverage, not additional implemented pages. Email-code/Google are the intended authentication direction; the current Clerk signup password discrepancy requires separate provider review.

The independent static design review found three focused issues: an implied global search, B's missing replay-boundary note, and weak selective glass in A. All three were corrected and scored resolved. Recorder-state coverage was inspected after fixing a clipped export. The review does not establish runtime behavior, animation quality, performance or user aesthetic acceptance. Exact validation lives in the exploration ledger; current application state remains in PROJECT_STATUS.md.

Exploration-time tool status (historical): Figma, browser, Impeccable and shadcn search were verified. Mobbin returned a paid-plan requirement and was not retried. Motion Primitives selection/morphing source, shadcn resizing, Aceternity code presentation, React Bits glass and Magic UI accents informed feasibility; no runtime library was installed during the static exploration. The later implementation selects Motion as described below. Existing atrium artwork was reused from the Figma file; no local reference image was uploaded or new asset generated.

## Implemented motion language ? 2026-11-11

Light gives materials life; persistent surfaces explain state changes; selected evidence stays connected to playback. The sign-in artwork is the exact existing atrium asset, with bounded moving light shafts, floor illumination and pointer-responsive light. The form is available immediately. No landing renderer or 3D scene is loaded on product/authentication routes.

A navigation selection moves between real destinations. The project switcher uses an anchored native popover; resource surfaces respond locally to the pointer. Dialogs, copy/save feedback and framework selection share short, interruptible transitions. Evidence selection and details animate without remounting the replay frame; leaving investigation still disposes playback immediately. Plan drafts retain their existing lifecycle.

The standalone recorder morphs one persistent material silhouette between launcher, panel and dock. Text/controls remain unscaled. Start and Submit retain their explicit meanings. Its motion uses browser APIs and CSS; it imports no React or application animation runtime.

Web UI uses Motion 14.12.0 for React layout continuity; GSAP/Three.js remain in the landing. Routine feedback is about 120?240 ms and surface transitions about 360 ms. These are tunable design values, not performance guarantees. Pause stops atmosphere; reduced motion removes spatial/ambient effects while preserving usable state feedback. Hidden/offscreen atmospheric effects pause. Actual checks and browser artifacts belong in PROJECT_STATUS.md.

## Approved recorder refinement - 2026-11-11

The user approved a compact, movable widget while retaining A's material/motion identity. Desktop width is 376px; the normal ready state has one Start action and concise privacy copy. Description is optional and initially collapsed. Movement is available through launcher/timer/header/grip, with keyboard/reset alternatives and viewport clamping. The same silhouette morph follows its current position. New browser captures and actual checks live in PROJECT_STATUS; no Figma/reference frame or landing renderer was changed.

## Review-first generator - 2026-11-12

Preserve Direction A's framed materials; make the reviewed sequence the main working area. A single View code workspace owns Playwright and JSON, with readable syntax, line numbers and explicit JSON Apply/Discard. Expected outcomes appear only for Verify a fix. Direct Edit/Remove, recoverable removed actions and a staged sheet with Cancel/Apply avoid turning the page into a long questionnaire. A reachable sticky footer supplies the next real action, while the post-download guide explains local execution. Neutral Prepared for export / Not run wording distinguishes syntactic readiness from a real test result. No new visual theme or landing change. Runtime evidence lives in PROJECT_STATUS and behavior in TEST_PLANS.

## Landing story extension - 2026-11-12

The existing frame 2:45 supplies the normal recording explanation, diagnostic interface and reveal composition. The browser implementation adds an interactive synthetic recorder preview, same-request-badge native scroll zoom, sequence/plan/code preview, truthful local SDK integration guide, privacy boundaries, FAQ and working workspace CTAs. It preserves the original entrance geometry, materials, camera and ray treatments. No new imagery, renderer, visual world or library was introduced.

Desktop sufficiently tall viewports get one bounded sticky diagnostic journey. Narrow screens and reduced motion show evidence/sequence in ordinary flow. Code and plan examples use synthetic data, and Playwright code comes from the actual adapter. The landing never mounts a recorder or submits a report. Implemented/browser-reviewed is not user aesthetic acceptance. The finish review scored its two bounded corrections resolved (reveal hierarchy and inherited asset-provenance disclosure); exact Figma/runtime certification was not claimed. Current evidence and limits: [landing contract](LANDING.md), [verification](audits/DEFECTS_LANDING_2026-11-12.md).

## Internal performance priority - 2026-11-15

The user approved performance over internal decorative animation after measured diagnosis. Private task surfaces use stable charcoal fills, immediate selection and pressed states, and native focusable controls. Pointer gradients, nested blur, layout springs and entrance animation are removed from authenticated tasks. Authentication keeps its separate atmosphere; marketing cinema retains its own renderer. This supersedes earlier requirements for atmospheric internal motion. The implementation audit owns measured results and remaining acceptance limits.
