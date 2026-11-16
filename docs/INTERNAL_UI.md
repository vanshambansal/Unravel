# Internal UI implementation guide

Updated: 2026-11-11. Approved direction: B authentication and A product surfaces. The shared shell and motion migration is implemented; final user aesthetic review remains separate. DESIGN.md owns visual intent; PROJECT_STATUS.md owns verification.

## Preserve behavior, evaluate presentation

Reuse existing feature state, HTTP handlers, ownership checks, privacy rules and SDK lifecycle. Reuse a composition when it serves the task; do not preserve an awkward geometry because it is already shared. A replacement should have one owner and a documented migration boundary instead of another accumulating CSS override layer.

## Current code ownership

The workspace's compositions.tsx/compositions.css provide headers, settings groups, action footers, collections, empty states, dialogs and investigation headings. workspace.css owns type/control foundations; product-v2.css owns feature layouts; product-materials.css supplies feature surfaces. workspace-shell.css exclusively owns the new shell/authentication chrome and material motion. Superseded auth/shell rules were removed from the older stylesheets; do not reintroduce them as overrides.

Clerk supplies authentication state and current form behavior. Use its supported appearance/customization surface before proposing a custom identity flow. Current signup configuration differs from the intended email-code flow; record that discrepancy without changing provider settings silently.

The standalone SDK uses its own Shadow DOM styles. Never import React/dashboard styles, fonts, replay runtime or a general UI framework into it merely to match a Figma treatment.

## Cross-page requirements

- Navigation: clear project context and real destinations; keyboard focus and responsive access to the account control. WorkspaceSidebar owns A navigation; ProjectNavigation owns the native project popover. Use actual selected project context.
- Settings/forms: associated labels, novice-friendly exact-origin guidance, unchanged/unsaved/pending/saved/error states, preserved failed input and deliberate origin/deletion confirmation.
- Collections: useful rows and contextual actions; actual metadata only. Explain first-use and no-match states. Search/status/metadata editing now use the shared collection, inset control and dialog patterns. Verify Clear filters resets visible values as well as results.
- Investigation: replay/evidence linkage, chronological timing, accessible resize/seek and contextual fidelity limitations. New styled and old structural recordings differ; no root-cause guarantees.
- Plans: structured and JSON representations of the same versioned data, explicit Apply, safe values, assertions/confirmation, save/conflict/reload and validated export states. Keep evidence immutable. The generator uses one code workspace, staged Cancel/Apply, Undo/Reset and recoverable removed actions; see TEST_PLANS.md.
- Recorder: explicit consent/start, starting, recording/minimized, stop, details, submit, retry, success, discard, limits and teardown. Closing is not deleting a server report. No auto recording/upload.

## Approved construction and motion

Figma candidate foundations are separate from V1/V2. Component tokens and instances cover shared type, spacing, controls, navigation, feedback and floating surfaces. A product compositions and B authentication are the implementation targets; preserve the other compositions as references.

Motion includes selection, expansion, state transitions and atmospheric brand moments where appropriate. Protect evidence stability and control responsiveness. Specify keyboard focus, interruption, reduced motion and low-transparency fallbacks. Keep glass readable without the backdrop; heavy full-panel blur needs browser performance evidence before adoption.

## Implementation gate and verification

The user approved the actual frames and motion direction. Continue in bounded tasks while retaining feature logic. Motion is selected for web React transitions. Component research and library adoption follow AGENTS.md; existing CSS does not prohibit Tailwind, shadcn or other suitable components. Major visual or stack changes require discussion; no migration is currently authorized. See the 2026-11-14 component-research decision in DECISIONS.md.

Verify actual desktop/mobile pages with representative empty, populated, long-content and failure states. Use screenshot comparisons with the chosen target and inspect real interactions. Functional checks and aesthetic review are independent gates; static Figma does not establish runtime accessibility, animation smoothness, privacy or performance.

## Motion ownership

WorkspaceMotion supplies SSR-stable reduced-motion/visibility state, an ambient pause control and the shared MotionConfig. MaterialLight handles local pointer illumination and bounded auth atmosphere; use motion values rather than React state for every pointer frame. ProductMotion supplies reusable resource/feedback treatments. Preserve accessible semantics under visual primitives.

The SDK widget-motion module owns native interruptible material morphs, preference/visibility handling and cleanup under its existing AbortSignal. Presentation must not initiate recording, submit reports or change capture/privacy policy. Keep text and form controls unscaled.

Never retain a live replay iframe to animate its exit. Animate selection and surrounding presentation, preserve actual player time, keep resizing direct, and leave the recorded document untouched. Preserve plan drafts when switching views.

## Generator composition

PlanEditor owns review-first sequence/output/outcome/code state; PlanControls owns the contextual native inspector and focused field groups. test-plan.css owns this feature's geometry and sheet motion. Preserve the shared A shell/materials rather than layering another page stylesheet. Technical controls appear only for a selected step/check. One View code workspace contains Playwright and JSON; no separate bottom JSON editor. Native dialog confines keyboard focus while editing, returns it on close, and leaves the working sequence visible behind it. Fixed header/footer keep Cancel/Apply reachable on short screens; the field area scrolls. PlanCode owns the lazy highlighted editor and RunGuide the local-execution handoff. TEST_PLANS.md owns recovery/normalization limits.

## Bounded completion corrections - 2026-11-12

Keep the A/B system. Project navigation must use a shrinkable grid track so long project names cannot widen links into content; product-audit checks link bounds. SDK setup has one copyable local install command, keyboard-scrollable samples, expandable privacy detail and a mobile-first report checkpoint. Investigation uses compact report metadata, original recording aspect ratio and explicit fit/100% guidance. Grouped/raw selected evidence uses the same indices for visual and ARIA state. Distinct report-header/workspace keys preserve React identity. These are refinements of working compositions, not another theme layer or design direction. Actual verification is in PROJECT_STATUS.md.

## Performance implementation - 2026-11-15

The approved performance pass supersedes internal atmospheric motion requirements. Private surfaces use stable charcoal fills and immediate selection states. Pointer-following lights, nested task-surface blur and Motion layout/entrance animation are removed. The private header no longer offers an ambient pause button. Authentication retains its separate atmosphere/control. Native dialog focus, keyboard tabs, retained plan drafts and paused replay remain functional requirements. See audits/INTERNAL_PERFORMANCE_2026-11-15.md for measured and verified states.

## Static crimson workspace accent - 2026-11-15

The user approved a faint crimson spray based on the landing reference. The workspace frame paints one static upper-right radial background, bounded to720 by440 CSS pixels over its opaque charcoal base. Feature surfaces, content opacity, focus and control behavior remain unchanged. No animation, pointer listener, blur or additional DOM layer is introduced. The performance audit owns verification and limits.

## Account portal contrast - 2026-11-15

AccountMenu.tsx owns UserButton and embedded UserProfile appearance overrides. Use opaque charcoal surfaces and explicit foreground/neutral/input/action/badge colors; keep auth-page atmospheric styling scoped to authentication. Profile/popover portal content must remain readable outside the workspace DOM wrapper. Current browser evidence and limits: audits/UI_REFINEMENTS_2026-11-15.md.
