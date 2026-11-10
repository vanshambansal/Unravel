# Approved visual foundation

Updated 2026-11-10. The user accepted the doorway/hero prototype; no further look-development cycle is authorized. Historical references, exploration records and rejected lighting experiments remain in [DESIGN_HISTORY.md](DESIGN_HISTORY.md).

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
