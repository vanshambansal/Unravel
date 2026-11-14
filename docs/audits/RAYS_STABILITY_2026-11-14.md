# Rays, startup and light stability — 2026-11-14

User requested visible colored entrance/hero rays, earlier startup and stable white/orange doorway lights. Original3000 is the target; prior cinematic repair and approved story remain.

## Changes

- Ray overlay previously used pale-white colors in both states. Restore the reference hero rose/cool palette and stronger opacity/intensity while retaining steady pale opening light (no time/sway noise). Preserve its WebGL drawing buffer because stationary rays intentionally reuse the last draw; increase bounded raster budget700k?1.3m pixels, still maximumDPR1, for smoother aperture edges.
- Prepare ray shader alongside scene imports/assets instead of awaiting the complete scene first. Expose the first ray frame through rays-ready while the loading poster remains. Preload GLB/maps after reduced-motion/data-budget guards pass, matching anonymous image credentials. A held-GLB browser check confirmed rays-ready/opacity1 before rendering becomes true. This proves independence, not a quantified cold-start speedup.
- Add negative polygon depth offset to edge emitters and cold ceiling emitters to separate flush luminous surfaces from wall/ceiling depth. This targets depth competition on narrow strips including distant poles, without changing asset geometry, light pulse timing or increasing bloom.
- Tried multisampled composer targets at4 and2 samples; rejected. Foreground repeated direction-change probes gave about33.3–33.7ms median/44.7–44.8ms p95 with those variants, versus22.3/33.5ms after removing multisampling. Small local development samples vary; not a baseline-to-final60fps claim. Existing FXAA, anchored light/haze and cached stationary draws retained. An initial background-tab probe was invalid (roughly1s cadence) and excluded.
- Recaptured four time-zero loading posters with the actual updated renderer and stamped the freshness manifest. Original prototype untouched.

## Verification and limits

TypeScript and focused lint passed. Fifteen cinematic/story/browser cases passed during the main iteration; final preservation/depth refinements receive a focused rerun and isolated build (results in PROJECT_STATUS). Desktop opening/hero images inspected at `.cache/rays-final-opening.png` and `.cache/rays-final-hero.png`. One early held-asset harness attempt raced unroute and reported route-already-handled; corrected held-asset check passed. Image preload credential mismatch found and fixed.

No claim that all flicker on physical displays is eliminated: thin subpixel silhouettes can still shimmer. Consistent moving60fps remains unverified; current moving probe is roughly45fps median and30fps atp95. Physical-phone/third-pole aesthetic acceptance remains open. No new dependencies, service setup, keys or deployment.
