# Entrance, demo, FAQ and account refinement

User requested cleaner light strips, an accessible demo recorder, a less empty FAQ, hero-targeted brand navigation and readable account management. Scope preserves the existing scene/story and account behavior.

## Implemented

- Atrium emitter geometry: width .12 to .16 world units, right edge separated .018 from its coplanar wall boundary. Reduced emitter intensity1.3 to1 to avoid making the wider feature brighter. This targets subpixel coverage and depth competition without extra render passes or animated light.
- Doorway cold rim: isolated its vertices from the shared ceiling material; widened .025 to .065 into the opening and moved .012 forward. Broad ceiling geometry unchanged.
- Doorway spill: narrowed area light .5 to .12, aligned it nearer the actual strip and reduced intensity from5+3*glow to1.8+1.4*glow. Floor/room illumination and physical occlusion remain.
- Demo Start control is visible before Try it yourself and starts recording directly. Stop retains a Record another demo action. Separated the recorder from the browser with12px spacing and kept it above adjacent layers. A real browser restart check exposed a one-pixel hover translation/hit-test oscillation after the copy changed; removed that movement from this control.
- FAQ uses a single centered reading column, max860px, with its heading above the questions. No filler component or new marketing claim.
- Navbar brand/name links to #hero and reuses the existing hero controller. Explicit footer Back to entrance remains an intentional restart.
- Account UserButton and embedded UserProfile receive local opaque colors and explicit foreground/neutral/input/action/badge colors. They override inherited translucent authentication styling without changing authentication settings or account operations. This uses [Clerk's supported per-component appearance API](https://clerk.com/docs/guides/customizing-clerk/appearance-prop/overview).
- Regenerated four matching entrance/hero posters and stamped/checked their source manifest.

## Verification

Seven landing browser cases passed: direct start/stop/restart, FAQ expansion/column, workflow, cinematic controller, diagnostic reversal/reduced motion,390/320px layouts/menu, hero brand destination and session-aware navigation. The added restart test initially failed on the actual hover oscillation; final rerun passed after its correction. Earlier exact FAQ selector and readiness waits were also corrected in the test.

Hardware Chrome (Intel Iris Xe, DPR1) desktop/mobile scene images inspected. Two stationary screenshots were byte-identical. A short36-step forward/reverse scroll probe returned100 recent scheduler intervals with11.1ms median/11.3ms p95. These are local scheduling samples, not a GPU benchmark, a before/after speedup or certification that all distant-feature shimmer is eliminated on every display. Physical-device flicker acceptance remains open.

Account popover measured opaque rgb(27,30,38), foreground/action rgb(243,242,238). Profile inspected at880x704 desktop and358x704 mobile; badge/navigation contrast corrected, no page overflow. No account values/settings changed. FAQ, demo and scene renders inspected. Account assertions used a real existing signed-in browser session.

TypeScript, focused lint and final production build `.next-ui-polish-final15` passed. Poster freshness and original52-file prototype integrity passed. Source changes are visible on development3000. Existing preview3033 was restarted with .next-ui-polish-final15 and paired4195; direct demo/FAQ and hero-brand production checks passed2/2, and signed-in production account colors/profile were checked. Other previews retain their own builds until restarted; no public deployment, dependency addition or provider setting change.

## Further proposals (not implemented)

1. Report-viewer keyboard shortcuts for play/pause and previous/next event, with visible shortcut help.
2. SDK setup connection/origin check so a stopped local service is explained before someone records a long session.
3. A small persistent replay-position/evidence summary when switching between Replay and Test plan, preserving the existing retained state.

User visual acceptance and physical-phone testing remain separate from the browser/build checks above.
