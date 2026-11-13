# Search, repeat navigation and stable entrance

User-requested follow-up to FLUIDITY_IMPLEMENTATION_2026-11-13.md. Scope: repair search presentation, avoid repeated Reports/All projects loading, stabilize pale/emissive lighting, improve architectural fidelity and investigate sustained/reversed motion. Landing story changes are proposals only.

## Changes

- Search now has one inset input boundary, no extra outer glass box, an input-specific border/focus reset and one custom clear control. Native WebKit search decorations are suppressed. Textbox flex sizing is shrinkable; status and submit controls align at46px. Existing debounce, URL/history state, keyboard shortcuts, server filtering and race protections remain.
- IntentLink now honors explicit full prefetch. Only the two primary sidebar destinations (All projects and Reports) opt into viewport full prefetch; other links retain bounded intent preparation. This uses Next's existing private browser-memory route cache, not a new persistent server cache or experimental staleTimes setting. Mutations still refresh router data. First visits, expiration, browser refresh and new external reports still require data/freshness handling.
- The opening shaft's procedural time and sway are fixed; opening pointer aim/focus no longer modulates the light. Hero pointer illumination remains responsive. The GPU time uniform is verified separately from the bookkeeping clock.
- Emitter coverage correction is narrowed from0.16 to0.12 world units, aligned with the original outer edge and authored depth instead of shifted/extruded depth. This addresses the artificial colored side face. Broad bloom/threshold and doorway spill are reduced. Existing PBR textures receive bounded anisotropic sampling to improve grazing-angle detail. Normal adaptive rendering stops at pixel ratio1 rather than0.8, preserving fine strips; severe fallback remains explicit.
- The architectural camera, fixtures and atmospheric haze are anchored between inputs. Room rendering is invalidated by camera/size/quality changes, so a settled hero reuses its last completed GPU image. Ray drawing similarly skips unchanged shape/pointer values and fully transparent aperture pixels. Ambient bookkeeping and pause/reverse/resize/visibility lifecycle remain; drifting haze is deliberately replaced by stable architectural light.
- Renderer-derived posters are regenerated. The original Vite reference and independent fixture are retained.

## Investigation and verification

The search screenshot's duplicate clear controls were native plus custom cancellation; nested shared input styling produced the extra box. A fresh production read-only workflow passed search typing/focus/clearing and three repeated Reports visits without another report-list request; replay recovery passed. A stronger follow-up also counts All projects requests.

This is not solely a development issue: Next's unprefetched dynamic page freshness defaults to0, while full prefetch uses a longer browser cache lifetime. Development also does not provide the same automatic production prefetch behavior. Loading boundaries remain for real waits; removing their UI would not remove the request.

The first full-resolution production sample, before settled-frame reuse, showed roughly22ms median idle frames and55.6ms reversal p95, with ratio1 and no fallback. A one-minute hero repeat showed no sustained deterioration; intercepted ray uTime stayed exactly0. This clarified that fixing temporal flicker did not by itself deliver consistent60fps. Final demand-render results and checks follow below.

Build/TypeScript, lint and47 unit tests passed during implementation. Initial production read-only search/navigation/recovery passed2/2. Intermediate/final results are recorded below without treating screenshot inspection as physical-device or user aesthetic acceptance.

### Final checks and limitations

- Production `.next-cinema13` build and final application TypeScript/focused lint passed. Original52-file prototype integrity and regenerated-poster freshness passed.
- Stronger production search/revisit check passed: three All projects/Reports round trips generated no additional RSC reads for either collection. Search focused border measured0px, one custom clear control was present, typing/clearing/Back/refresh and mobile bounds passed. Initial read-only replay recovery also passed. A sample first prepared transition measured529ms with no fallback; this is not an instant-render or general click-speed improvement claim.
- Final hardware Chrome landing lifecycle11/11 passed: intro/reveal/Skip, pointer/pause/reverse, desktop/short/mobile hold/exit, reduced motion, unavailable graphics/context loss, no-JS, repeated cleanup, private-route isolation and interrupted initialization.
- Auth session/refresh/mobile navigation/logout/protected redirect/API401/Back passed on3032. No private heading remained after logout and Back. Clerk's test helper emitted context-closed retry messages during teardown after the assertions passed.
- At1440x900/DPR1 on Intel Iris Xe, final entrance rAF intervals were11.1ms median/11.2ms p95; stationary hero11.1/11.3ms; after one minute11.1/11.4ms. These describe responsive scheduling with cached GPU images, not90 newly rendered room frames each second. Shader uTime stayed exactly0 throughout.
- Sustained reversal sample remained22.2ms median/55.6ms p95, maximum66.9ms, at ratio1 without fallback. Camera-active rendering remains the unresolved cost; no consistent moving60fps claim. The sharper normal raster is a deliberate quality tradeoff against the earlier0.8 tier. A later investigation should attribute full moving room/reflection/postprocessing costs before choosing a larger renderer change.
- Final desktop entrance and hero and desktop search screenshots were inspected. Source screenshot `.cache/cinema13-search-desktop.png` shows the repaired field. Physical-device strip stability and human aesthetic acceptance remain unverified.

Current local preview: http://localhost:3032, isolated replay4194. Earlier3031/4193 remains the comparison preview. No new API keys, dependencies, provider changes, deployment or commit. Temporary3030 development preview is stopped. Cache lifetime is bounded; a genuinely new/expired destination, browser refresh or explicit fresh-data request may still load.

## Proposed next visual work

Keep the atrium's architectural language. Consider a restrained beveled fixture reveal, deliberate light grazing the concrete and a more composed arrival/heading handoff; prototype each against its frame budget before adding it. Further geometry/material changes should be reviewed as one coherent lighting composition.

For the later landing pass: replace repeated explanation with one interactive synthetic failure-to-test story; give each stage one sentence, one real product visual and one clear action. Keep installation/code/privacy depth available on demand. Collapse repetitive feature sections and detailed FAQ material, retain essential privacy/support limits and make the final CTA concise. No landing copy/section redesign is implemented by this task.
