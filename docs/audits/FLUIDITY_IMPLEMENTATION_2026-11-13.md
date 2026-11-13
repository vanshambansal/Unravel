# Responsiveness and entrance refinement

2026-11-13. Implements the user's explicit approval of [the performance discussion](PERFORMANCE_DISCUSSION_2026-11-13.md). Application: apps/web. Existing uncommitted work is preserved; the Vite reference is unchanged. This is a local implementation, not a deployment or a claim of universal native-level performance.

## Implemented

- Authorized workspace chrome streams before the shared project-list promise resolves. Project switcher/sidebar have bounded placeholders; page content can progress independently. Authentication and every data query still enforce ownership.
- Workspace-scoped route preparation deduplicates24 readiness entries for30s, rearms on Next invalidation and uses full route prefetch. Mouse intent waits50ms; keyboard focus and primary pointer-down prepare immediately. One likely project destination prepares during idle. SaveData/2G/background pages avoid speculative preparation. Next owns the private memory payload cache; no persistent server/user cache is introduced.
- Report metadata saves refresh router data so a prepared list cannot retain the old local edit. Page arrival uses a short140ms interruptible CSS treatment; reduced motion removes it. Existing search transitions preserve input/concurrency handling.
- A mounted report anticipates one plan read after600ms, shares it with tab opening, and retains it for at most10s. Explicit reload, expiry, failure and unmount clear/cancel it. Saved revision checks, authorized reload before draft recovery and immutable evidence remain. No browser storage is used.
- Plan context uses one owner-joined snapshot containing metadata/events and optional saved plan, excluding replay bytes. Connection acquisition, query/transfer and generation now have separate numeric Server-Timing stages. Warm reuse remains within the same maximum-five-client pool: idle120s rather than30s, maximum lifetime300s, no background keepalive query.
- Camera follow changes18/s to48/s: a fixed target gap closes95% in approximately62ms rather than166ms, before frame quantization. Text/ray visibility follows the same visual progress. Skip/Replay stay immediate. Stable frames no longer rewrite presentation or camera transforms.
- Fixtures/emissive strips/reflection opacity remain anchored while haze moves gently. Pale shafts use cooler neutral colors, less opacity/glow/sway and slower procedural evolution. Full FXAA edge search replaces the previously reduced search. Desktop reflection uses768x512/MSAA2, updates every camera-change frame and reuses the result for at most100ms at rest. Broad bloom uses65% linear resolution independently of fine scene edges. Existing adaptive/fallback policy remains.
- The four renderer-derived posters were regenerated and freshness-stamped. Poster-to-live handoff crossfades220ms, keeps the poster until the live image appears, and restores fallback immediately. No new bitmap artwork, asset source, dependency or renderer was introduced.
- The pale-ray aperture now runs inside the existing fragment shader with the same normalized CSS-space alpha ramps and70px feathering. Two intersecting CSS masks are removed. Font/size changes update aperture uniforms; reduced motion and lifecycle ownership remain.
- Fully transparent aperture pixels return before expensive procedural light calculations; visible light uses the same alpha result. No additional renderer/pass is added.

## Measurements and interpretation

Baseline and final production previews are3020 and3031. Hardware Chrome reports Intel Iris Xe/D3D11. Browser timing captures are ignored local artifacts; no session headers, credentials or report payloads were logged.

| Sample | Before | Implemented production sample |
| --- | --- | --- |
| Plan read after35s idle |613ms browser total |152ms browser total |
| Acquisition in attributed development reproduction |560ms |0.4ms in the production idle-repeat |
| Warm plan repeats |137/156ms, with951ms first outlier |130/134ms, with226ms first read |
| Initial entrance frame median/p95 |33.2/44.4ms |22.4/33.6ms |
| Travel frame median/p95 |22.1/55.7ms |21.9/55.6ms |
| Hero frame median/p95 |22.4/33.8ms |22.2/33.3ms |

These small initial samples precede the final compositor repair and include adaptation/different scheduling, not a universal FPS guarantee. The idle-repeat improvement is attributable to avoiding measured reconnect cost; a truly cold connection still requires DNS/TLS/network acquisition. Warm database query/transfer remains roughly80-120ms. Immediate-click outer Playwright navigation samples did not improve consistently, so no general route-speed percentage is claimed. The final prepared-route check measured153ms from click to the next content paint, reused the response with no fallback or additional route read, and used one anticipated generator read.

Per-draw baseline GPU probes identified PBR material shading, output/FXAA and broad blur work; ray samples were around0.67ms in the sampled raster. This supports targeting raster budgets and repeated room rendering, not declaring one animation the sole cause of stalls. A full-scene MSAA trial did not improve measured speed and was removed; reflection-only MSAA remains. Additional depth of field/motion blur/particles were not selected.

An initial alternating production repeat remained variable: final medians22.5-33.6ms and p9555-111ms; the last baseline run also slowed to22.4-33.7ms. This did not establish a reliable FPS gain. A subsequent controlled same-page comparison at fixed0.8 ratio isolated compositor work: three normal samples median22.2ms/p9533.4-33.6ms; removing CSS masks gave11.4/22.6ms, removing only navigation blur gave22.2/33.6ms, and removing both gave11.4/22.6ms. The shipped shader aperture follows this evidence. The final GPU probe showed full FXAA around0.58ms at1440x900 and0.25ms at1152x720; the largest sampled bloom stage fell from roughly0.27 to0.12ms at full scene resolution. These are sampled per-draw costs, not whole-frame GPU totals.

## Verification

- Production build and application/repository TypeScript passed. Lint passed; unit47/47 passed, including anticipated-read deduplication, failure/expiry/reload/disposal and tighter reversible scroll following.
- Real PostgreSQL report integration passed: owner/foreign-owner boundaries, optional saved-plan join, persistence, reconnect, original evidence, concurrency and cascading test cleanup.
- Hardware Chrome management, capture/retry/private replay/seek and generator edit/conflict/Back recovery/download workflows passed in the first targeted run. That command also accidentally selected two unrelated project-management cases requiring fixture4187; both failed connection-refused, not application assertions. No clean combined-suite pass is claimed.
- The original delayed-host assertion awaited full page load and missed the temporary retry state once streaming mounted the iframe earlier. The test now waits for DOM readiness. A separate read-only final-build check passed gated-host recovery and17-second recording recovery with timeline access and visible replay restored.
- A read-only prepared-route check passed response reuse, no full-page fallback, one shared generator read, Back/refresh and390px overflow checks. Early harness iterations included an old report no longer on page1, an interrupted wait, and a strict locator matching a hidden React streaming copy; the test now selects a current existing report and visible link.
- Hardware Chrome shader-aperture landing lifecycle suite11/11 passed: forward/reverse motion, pointer/pause, Skip, hero hold/exit at desktop/short/mobile sizes, reduced motion, asset failure/context loss, no-JS/unavailable WebGL, repeated cleanup, private-route asset isolation and interrupted initialization. After the final equivalent transparent-pixel early return, build/TypeScript/focused lint and the rendering/pointer/pause/reverse/fallback smoke3/3 passed.
- Desktop projects/generator and mobile investigation/entrance captures were visually inspected. Poster freshness and original52-file reference integrity passed. Final entrance captures and measurements are recorded below.

Automatic approval review rejected a newly proposed test's destructive synthetic-project cleanup. That test was replaced with read-only checks using existing synthetic data; no retry of the rejected deletion was performed. Earlier approved workflow/integration tests retain their own documented synthetic fixture lifecycle. No user data was deleted, no commit/push or infrastructure/provider changes were made.

## Final shipped shader sample

At1440x900/DPR1 on Intel Iris Xe, with other owned test windows closed, the final0.8-ratio sample measured entrance median11.3ms/p9533.2ms (177 intervals), travel11.2/33.5ms (163), and hero22.1/33.3ms (166). The first matched baseline alternating sample at0.8 measured entrance22.3/33.7ms, travel11.2/44.6ms and hero22.3/33.6ms. Other baseline/final runs were slower, as retained above. This supports a typical entrance improvement in the final check, not dependable60fps or a whole-app FPS percentage. Tail frames remain.

Accepted local visual captures: `.cache/fluid13-final-entrance-desktop.png`, `.cache/fluid13-final-entrance-mobile.png`, `.cache/fluid13-projects-desktop.png`, `.cache/fluid13-generator-desktop.png` and `.cache/fluid13-report-mobile.png`. The final entrance has no CSS mask according to computed styles and no mobile document overflow. These captures were inspected; user aesthetic acceptance remains separate.

## Remaining acceptance

Tail-frame spikes, truly cold network waits, physical-phone/Safari behavior and user aesthetic review remain open. Consistent60fps on all hardware is not established. Current shaders still use a lower raster budget on sustained slow devices; improved edge handling does not create missing pixels. The current architectural composition, privacy/replay boundary and supported interaction/export limits remain intact.

Final local preview uses `.next-fluid13` on3031 with isolated replay4193. The old3020 preview remains a comparison reference. No new API keys are required.
