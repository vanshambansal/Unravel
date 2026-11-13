# Performance and entrance discussion

2026-11-13. Investigation and recommendations only; no application changes or new acceptance claim. The user requests discussion of consistently fast navigation/actions, continuous loading transitions and a sharper, more responsive cinematic entrance, with broad technical freedom for appropriate performance improvements.

## Current evidence

- Inspected actual App Router layouts, loading states, IntentLink, project/report queries, database connection lifecycle, landing controller, framing, renderer and ray shader. Existing uncommitted work is retained.
- Visited the existing production preview on3020 using hardware Intel Iris Xe/D3D11. Inspected saved desktop and fresh mobile-sized screenshots in `.cache/entrance-discussion-2026-11-13.png` and `.cache/entrance-discussion-mobile-fresh-2026-11-13.png`.
- Fresh1440x900/DPR1 entrance sample:97 rAF intervals over approximately3.5s, median33.3ms, p9555.6ms, max122.1ms. Scene ended at pixel ratio0.9 with32 draw calls/6,801 triangles. This short sample includes adaptation and is not an isolated GPU-pass benchmark.
- Fresh390x844 mobile-sized load on the same laptop: last100 scene intervals median11.1ms/p9511.9ms; mobile tier, pixel ratio1,23 calls/3,407 triangles and no planar reflector. Not a physical phone result or controlled desktop/mobile causal comparison.
- A prior same-session desktop view reached pixel ratio0.8:1152x720 raster displayed at1425x709 CSS pixels. Resizing that mounted desktop scene to a narrow viewport retained its desktop tier; fresh navigation correctly selected mobile. Resize behavior is not evidence of normal phone initialization.
- Private workflows/cold storage requests were not freshly profiled in this discussion. Prior measurements and their unresolved cold outliers belong to SMOOTHNESS_FIXES_2026-11-13.md and AUTH_RESPONSIVENESS_2026-11-12.md.

## Established code behavior and implications

- Private layout awaits authentication and project navigation data before returning the full shell. It is force-dynamic. Report detail awaits semantic events before returning the report workspace. These are blocking dependencies; individual latency attribution still needs a trace.
- IntentLink disables automatic viewport prefetch and waits150ms for mouse/focus intent; pointer-down cancels that timer. This bounds database request fan-out but offers little lead time for fast clicks or touch. Its per-instance flag has no invalidation callback.
- Project-list deduplication is request-scoped, not a persistent private cache. Queries use pg/Drizzle; changing fetch cache options alone does not cache them.
- Camera interpolation at18/s takes approximately128ms to close90% of a fixed target gap and166ms for95%. DOM presentation/ray visibility follows raw progress while the camera follows visualProgress. This introduces deliberate lag and potential visual separation; input lag was inferred from code, not measured end to end.
- Scene raster is capped at1.25 desktop/1 mobile and can adapt down to0.8. Canonical390x844/1440x900 canvases are cover-scaled. Fine emissive geometry can undersample. FXAA has a reduced edge-search count and raised thresholds. These are plausible contributors to edge shimmer, not a proven diagnosis of every supplied pixel defect.
- Desktop reflection is640x400 with MSAA disabled. Bloom, PBR lighting, transparent haze and a separate procedural ray canvas contribute rendering work. A per-pass GPU comparison is needed before attributing the stalls to one effect.
- Main shadow maps are disabled; grounding uses baked indirect/AO. Crimson position/intensity, emissive strength, reflection opacity and haze still vary over time. Their relationship to baked lighting deserves review. No specific yellow-light cause is established from the supplied red-lit crops.

## Recommended next implementation scope

1. Trace a reproduced slow authenticated route/action across auth, connection acquisition, query, payload and browser work. Improve first-load shell boundaries and measured redundant work.
2. Refine bounded destination prefetch and freshness handling. Consider a bounded authenticated memory cache for revisits only with owner/query keys, mutation invalidation and logout clearing. Do not persist raw evidence/drafts in browser storage or cache authorization decisions across users.
3. Keep interaction state immediate, retain useful content during refresh, reserve fallback geometry and coordinate short interruptible reveals. Optimistic success must have rollback and honest server confirmation. Never add a minimum loading delay to fast results.
4. Compare direct/tighter camera tracking and synchronized visual presentation; preserve native scroll, Skip, Replay, reverse motion and reduced motion.
5. Profile reflection/bloom/rays separately. Compare spatial anti-aliasing, emitter coverage and viewport raster choices before lowering resolution further. Reconcile authored light/shadow/reflection behavior. Preserve the current architectural composition.
6. Discuss restrained light/camera/reveal choreography after the baseline is stable. Extra postprocessing is not selected.

Acceptance targets to agree/measure: local feedback next paint (aim under100ms), INP under200ms, warm prefetched transitions without full-page loader flashes, stable loading geometry, and repeatable60fps-class entrance motion on agreed hardware with tail frames reported. Test cold/warm navigation, Back/refresh, mutation conflicts, logout isolation, mobile and reverse/skip interruption separately. These are targets, not current results.

## Instruction boundary

AGENTS.md requires discussion before consequential architecture/security/visual choices, preserves the reference prototype and replay/privacy invariants, and requires separate agreement for infrastructure setup. DESIGN.md and LANDING.md previously freeze the approved entrance; the current user request supersedes that literal freeze for performance and fidelity repairs within the same visual world. It does not select a replacement scene or additional cinematic effects. No code, dependency, infrastructure, commit or deployment change was made in this discussion.
