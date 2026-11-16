# Landing implementation

Approved extension, 2026-11-12. Visual source: existing Figma file, frame 2:45 and its normal-flow/diagnostic/reveal compositions. The architectural entrance remains the first viewport. The user approved responsiveness, coordinated camera/reveal motion and lighting/edge/reflection fidelity repairs on 2026-11-13. No new visual-world exploration or replacement renderer is selected.

## Direction contract

THESIS: discover the story inside a failed request, rather than present a catalogue of feature cards.

OWN-WORLD: existing charcoal #08090b/#111318/#191c23, warm white #f3f2ee, muted #a6aab3 and crimson #ef4b53. Existing licensed Manrope/Inter/Plex; large readable headings, precise diagnostic surfaces and selective translucent navigation.

STORY: see explicit recording, inspect the request, travel through its existing status detail, understand the sequence, review a portable plan and enter the actual workspace.

FIRST VIEWPORT: preserve the approved architectural entrance and hero. The next normal section pairs left explanation with a right interactive synthetic recorder preview, followed by the full-width diagnostic composition.

FORM: approved Figma storyboard adapted into responsive semantic HTML. Seed: none (existing approved composition). One bounded native-scroll diagnostic zoom; reduced motion shows consecutive sections. Examples are labelled synthetic and never record/upload visitor activity.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and a factual asset-provenance check. No raster is added or replaced by this extension.

## Acceptance

Real navigation/CTAs, interactive labelled examples, the same diagnostic badge throughout zoom, ordinary scrolling afterward, readable mobile layouts, keyboard/reduced-motion support, no landing recorder or private-data request, clean lifecycle, and browser visual/motion review. Examples do not establish root cause or a passing user test. No new raster is planned; existing architectural assets retain their source records and binary integrity. The metadata scan reports five inherited omissions (atrium poster and four exact-scene captures); source history is in design/concepts/interior-architecture-v2 and design/assets/architecture-v1. They were not regenerated or metadata-rewritten during this extension.

## Implemented review

The full story is implemented and browser-inspected at desktop1440, mobile390 and narrow320 widths. Preview, evidence/code/framework controls, copy feedback, same-element forward/reverse zoom and reduced-motion/responsive behavior are verified. A native-scroll recording is retained locally at `.playwright-mcp/diagnostic-scroll-demo.webm` (the intro intentionally uses fallback in that recording to isolate the new HTML transition).

The finish reviewer scored its two material corrections resolved and returned ship at that bounded scope. User runtime/aesthetic acceptance and exact Figma/performance certification are not implied. Later anchor correction clears the WebGL stage and preserves heading clearance; current check results live in PROJECT_STATUS.md. Existing system files/tokens are preserved, with no new generated raster or new visual-world artifact.

## Unified landing navigation - 2026-11-15

The user approved the complete navigation from the first entrance frame. LandingNavigation owns the single fixed64px opaque charcoal header outside the cinematic stage: brand, How it works, Example test, Integration, Sign in and Open workspace. Mobile uses a React-owned Menu with Escape/focus recovery;320px shortens the CTA to Workspace. Skip intro remains an entrance-only control below the header. Background-motion pause/resume and conditional3D enable live in Display options, preserving reduced-motion and resource controls. The logo restarts the existing entrance controller.

The story no longer renders a second navigation or owns menu event handlers. navigation.css owns header geometry and section scroll clearance. No new dependency, asset, scroll listener or renderer change is introduced. PROJECT_STATUS owns browser/build evidence. This supersedes the previous separate stage/story header arrangement.

## Staged navigation revision - 2026-11-15

User rejected the global fixed/opaque header and approved a staged replacement. This supersedes the unified-public-header decision above. The entrance/hero have a transparent scene-owned brand overlay and entrance-only Skip intro. LandingNavigation now starts at the product-content boundary and sticks only within that section. Pause/Display options UI and its controller handlers are removed; reduced-motion, automatic resource fallback and conditional3D enable remain. The duplicate responsive CTA spans are replaced with one label.

The content header reads the non-cacheable boolean `/api/session` hint when approaching view and on subsequent window focus. Signed-in visitors see Open workspace without Sign in; signed-out visitors see Sign in/Get started. Unknown/error state keeps a neutral workspace entry. The endpoint uses existing Clerk authentication, no database query or identity/token response, and does not authorize private actions. The public landing remains statically generated. PROJECT_STATUS owns final checks.

## Single continuous header correction - 2026-11-15

User clarified that hero and content must share one navbar, with no second bar below the hero. Implemented one LandingNavigation instance outside the scene: transparent gradient backing, brand/Skip intro during the entrance, full links from hero onward, same position through content. The existing choreography toggles navigation-ready; no extra scroll listener. Session awareness and removed pause menu remain. Supersedes the two-header staged approach. Final `.next-single-nav15` build, focused lint and six headed-Chrome tests passed; desktop/mobile hero renders inspected. Preview remains3038/player4210; changes uncommitted.

## Detail corrections - 2026-11-15

Navbar brand/name now targets #hero through the existing scene controller; the explicit footer entrance-restart link remains. The synthetic recorder exposes Start demo immediately, retains a restart action and avoids hover displacement. FAQ heading sits above a centered single question column. Emitter geometry separation/width and aligned narrower door lighting target shimmer/spill without extra render passes; regenerated posters match. Verification and physical-device limits belong to audits/UI_REFINEMENTS_2026-11-15.md.

## Floating synthetic recorder correction - 2026-11-15

The earlier below-frame recorder placement was rejected. Its aside now belongs inside the example browser and floats above the sample page at bottom-right. ResizeObserver keeps enough page space for the recorder's current ready/completed height; explicit foreground avoids inheriting the light website's dark text. The widget remains synthetic and never records or submits landing activity. Geometry checks include the completed inspector state at1440/390/320px.

## Half-in/half-out composition - 2026-11-15

The fully-inside recorder was rejected. Current placement straddles the sample browser's bottom edge equally, above the page and extending outside the frame, matching the user's original composition. The website no longer reserves the widget's entire height as blank content. A shared wrapper and measured half-height clearance protect the form and caption at desktop/mobile sizes. This supersedes the earlier floating-inside correction.

## Universal brand destination - 2026-11-15

Top-left workspace/authentication brands now target /#hero; landing brands target #hero through the same cinematic controller. Initial hero fragments are honored before renderer readiness and are excluded from the story's generic font-ready scroll correction. The explicit Back to entrance remains the separate replay action. This supersedes earlier brand-to-entrance behavior.

Entrance exception: during the initial cinematic entrance the brand stays at the entrance; Skip intro alone provides the shortcut. After hero/navigation readiness, the brand becomes a hero link. Other pages still use /#hero. Current verification/build ownership is in PROJECT_STATUS.md.
