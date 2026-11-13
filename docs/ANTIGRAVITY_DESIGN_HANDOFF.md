# Antigravity Final Architecture, Design, Performance & Execution Plan

**Project:** Unravel (`d:\documents\Unravel`)  
**Last updated:** 2026-11-13 (India time)  
**Author:** Antigravity (Senior Software Architect & Creative Product Engineer)  
**Status:** **Proposal & Review — Awaiting Final User Approval Before Any Code Modification.**

---

## 1. Executive Summary & Design Vision

### A. The Core Understanding
Unravel is a developer tool designed to eliminate the painful, noisy cycle of debugging web applications. It captures real browser session failures, replays them inside an isolated security sandbox, and automatically synthesizes deterministic, reproducible Playwright regression tests.

The goal of this design and architectural evolution is **NOT to create a different product, invent unapproved features, or build another generic dark SaaS dashboard**. Rather, it is to elevate Unravel into an **exceptional, tactile developer instrument** that matches the visual craft, quiet luxury, and fluid speed of **https://raycast.com**, while strictly preserving Unravel's distinctive architectural identity and rock-solid security foundation.

### B. Strict Project Boundaries & Commitments
1. **Cinematic Entrance 100% Preserved:**
   - The Three.js doorway, camera journey, lighting, concrete geometry, and entrance choreography are strictly untouched.
2. **Landing Page Structure & Content Preserved:**
   - The existing layout, copywriting, feature flow (`LandingStory`), diagnostics zoom, and SDK code examples remain identical.
   - The landing hero background, concrete hallway, cinematic entrance, and Three.js doorway are 100% preserved in their authentic original state. (Option B light blades/louvers permanently eliminated per user directive).
3. **Shared Architectural Background Preserved:**
   - The concrete architectural atrium ([hero-atrium.png](../apps/web/public/landing/artwork/hero-atrium.png)) is restored and persistently visible across all internal workspaces (Authentication, Projects, Reports, Investigation, Test Studio, Settings).
   - Internal surfaces sit as refined, smoked translucent glass, allowing the overhead concrete beams and floor reflections to breathe visibly behind the UI. Avoid excessive backdrop blur that causes compositor lag on lower-end devices.
4. **Strict Color Discipline (Much Less Red):**
   - Raycast color restraint: 95% neutral obsidian/charcoal (`#07080a`, `#0e1015`, `#16181f`), pure white primary typography, and crisp solid white primary CTA buttons (`bg-white text-black font-semibold hover:bg-slate-200`).
   - Warm crimson (`#ff4d61`) is strictly an occasional functional highlight (a 2px live status beacon, the failure point dot at the crash timestamp, or subtle warm keylight reflections).
5. **Authentic Spacious Authentication:**
   - Authentication on `/sign-in` and `/sign-up` strictly preserves the authentic, spacious architectural layout with a Raycast-grade clean card. (Option C 3D centerpiece/contraptions permanently eliminated per user directive).
6. **Strict Product & Feature Preservation:**
   - Do not introduce fictional SDK settings, security toggles, credentials, API-key vault, or integrations that don't exist in the actual application.
   - Preserve server-side reports search and pagination, project ownership checks, plan generation and optimistic revision checks, replay isolation on `127.0.0.1:4192`, existing shader optimizations, and intentional bounded prefetch strategy.
   - Avoid hidden replay background work or unnecessary architecture changes.
7. **Measurement-Based Performance:**
   - Optimize database and navigation performance using verified timings; do not promise arbitrary metrics (e.g., sub-250ms or 60 FPS) without direct benchmark verification.
8. **Incremental CSS Consolidation:**
   - Consolidate CSS stylesheets incrementally, ensuring existing UI and functionality do not regress at any step.

---

## 2. Reconciled Decisions Ledger

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              RECONCILED DECISIONS MATRIX                               │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ CATEGORY                       │ STATUS & RESOLUTION                                   │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ Cinematic 3D Entrance          │ EXPLICITLY APPROVED & PRESERVED (Zero code changes)   │
│ Landing Structure & Content    │ EXPLICITLY APPROVED & PRESERVED                       │
│ Shared Atrium Background       │ EXPLICITLY APPROVED & RESTORED (hero-atrium.png)      │
│ Raycast as Primary Benchmark   │ EXPLICITLY APPROVED (Quiet luxury, white buttons)     │
│ Restrained Warm Crimson Accent │ EXPLICITLY APPROVED (Removed excessive red/pink glows) │
│ Projects Hub Layout            │ EXPLICITLY APPROVED ("Your projects", clean rows)     │
│ Investigation Workbench        │ EXPLICITLY APPROVED & VERIFIED (Dark player, scrubber)│
│ Test Plan Studio               │ EXPLICITLY APPROVED & VERIFIED (CodeMirror + steps)   │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ Option B: Hero Lighting Blades │ PERMANENTLY ELIMINATED (Hero preserved 100% original) │
│ Option C: 3D Auth Contraption  │ PERMANENTLY ELIMINATED (Preserved clean spacious auth)│
│ Industrial/Cyberpunk Theme     │ EXPLICITLY REJECTED (Obsidian Reactor, red HUD racks) │
│ Bright Pink/Red Neon Buttons   │ EXPLICITLY REJECTED (Replaced with Raycast white CTA) │
│ Generic Floating Logo/Cube     │ EXPLICITLY REJECTED                                   │
│ Pitch-Black Empty Backgrounds  │ EXPLICITLY REJECTED (Restored architectural atrium)   │
│ Speculative Feature Additions  │ EXPLICITLY REJECTED (No API-key vault / fake presets) │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ Phase 0: Bugfixes & DB Latency │ COMPLETED & VERIFIED IN REAL BROWSER                  │
│ Phase 1: Shell & Smoked Glass  │ COMPLETED & VERIFIED IN REAL BROWSER                  │
│ Phase 2: Workbench & Studio    │ COMPLETED & VERIFIED IN REAL BROWSER                  │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

### Contradictions Reconciled & Removed
* **Removed Speculative "SDK Privacy Presets":** An earlier audit proposed introducing `balanced` vs `strict` privacy presets in the SDK. Per explicit user instructions, this was removed from the plan. SDK recording contracts and defaults remain completely unchanged.
* **Removed Landing Page Replacement:** Any idea of replacing or restructuring the landing page has been permanently discarded.
* **Eliminated Excessive Red Accents:** All red button variants, bright red card borders, and neon glow halos from earlier concept iterations have been replaced with Raycast-grade neutral charcoal, soft white text, and solid white action buttons.

---

## 3. Investigation Audit Reconciliation: Confirmed Problems vs Suspected Causes

Based on multiple live Chrome DevTools audits (`1440×900` desktop and `390×844` mobile) and Codex performance reports:

### A. Confirmed Functional & UX Bugs (Must Fix)

| # | Bug Name | Impact | Verified Root Cause | Proposed Solution |
|---|---|---|---|---|
| **1** | **Sticky Footer Click-Hijack** | Severe UX block on Test Plan screen | `.generator-action-footer` (`test-plan.css` line 77, `height: 78px; position: sticky; bottom: 16px`) physically floats over the bottom of the step list and CodeMirror editor. `document.elementFromPoint` at `Edit step 1` center clicks `View code` instead. | Convert the sticky overlay to a standard flex-flow bottom dock with proper padding and `z-index`, eliminating element overlap completely. |
| **2** | **Widget Dock Stop UX Bug** | SDK reporting workflow break | In `packages/sdk/src/widget.ts` lines 47–50, clicking `Stop recording` from the minimized dock leaves `opened = false`, causing the widget to collapse back into the small launcher pill instead of opening the submission form. | Set `opened = true` when stopping from the minimized state so the feedback dialog opens reliably. |
| **3** | **Reports Search Form Submit UX** | Full page reload on search submission | `<form method="GET">` in `ReportsPage` triggers a browser navigation on form submit. | Preserve server-side search and pagination while enhancing form submission with React `useTransition` / Next.js router replace so URL state and server-side pagination remain authoritative without a jarring full-document reload. |
| **4** | **Replay Player Unmount & Context Loss** | Loss of playback state on tab switch | `ReportWorkspace.tsx` unmounts `ReportViewer` when switching to `Reproduction & test plan`. Re-opening Investigation resets slider to `0.00s` and re-fetches `/replay`. | Preserve `ReportViewer` in the DOM using CSS visibility (`display: none` / `hidden`), or lift player state to the workspace container so scrub position (`15.16s`) is retained. |
| **5** | **Offline Replay Host Error State** | Raw browser error iframe | When `127.0.0.1:4192` is offline, Chromium mounts its raw `"127.0.0.1 refused to connect"` page inside the iframe. | Add an explicit health check / error boundary that renders a clean Unravel fallback banner with a single-click `"Start Replay Host"` command hint. |

### B. Confirmed Performance Bottlenecks & Causes

| # | Bottleneck | Live Measurement | Confirmed Root Cause | Resolution Plan |
|---|---|---|---|---|
| **1** | **Tab Switch Latency (`Investigation` $\to$ `Test Plan`)** | **`6,656.4 ms`** total (TTFB was **`6,557.6 ms`**) | Sequential database queries in `readPlan` (`detail()` + `reportTestPlans` sequentially), pulling the entire massive `events` JSONB blob merely to check plan ownership. | Optimize `readPlan` and `savePlan` to avoid querying the heavy `events` JSONB payload for ownership checks while strictly preserving project ownership checks, plan generation, and optimistic revision validation. Measure actual improvement. |
| **2** | **Internal Route Navigation Delay** | **`1,819 ms` to `2,213 ms`** | Cold remote Neon PostgreSQL connection wakeups and TCP/TLS handshakes. | Preserve the intentional bounded prefetch strategy in `IntentLink.tsx` to prevent connection exhaustion, while adding dedicated `loading.tsx` skeletons for `/reports`, `/setup`, and `/settings` to provide instant visual feedback. |
| **3** | **Integrated GPU Startup Frame Spikes** | **755ms & 489ms** startup spikes on Intel Iris Xe | Dual canvas render pipeline + post-processing compilation. | Preserve existing shader optimizations, warm pipeline asynchronously, and ensure `PerformanceGuard` does not prematurely strip bloom. Verify on actual hardware. |

---

## 4. The Calibrated Design System (Raycast Craft + Architectural Depth)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              UNRAVEL DESIGN SYSTEM TOKENS                              │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ TOKEN                 │ SPECIFICATION                                                  │
├───────────────────────┼────────────────────────────────────────────────────────────────┤
│ Canvas Background     │ #07080a with hero-atrium.png blended at 78%-90% opacity        │
│ Smoked Glass Surface  │ rgba(14, 16, 22, 0.72) with backdrop-filter: blur(28px)        │
│ Elevated Card Surface │ rgba(20, 23, 30, 0.85) with backdrop-filter: blur(32px)        │
│ Hairline Borders      │ 1px solid rgba(255, 255, 255, 0.08)                            │
│ Directional Highlight │ 1px solid rgba(255, 255, 255, 0.15) (top border only)          │
│ Primary CTA Action    │ #ffffff (solid white) with #07080a (dark text), 12px radius    │
│ Secondary Action      │ rgba(255, 255, 255, 0.06) with 1px white/10 border             │
│ Functional Accent     │ #ff4d61 (strictly reserved for live dots, beacons, keylight)   │
│ Success Accent        │ #10b981 (isolated sandbox status, verified selector checkmark) │
│ Tactile Keycaps       │ Geist Mono, 11px, subtle top bevel, 1px white/12 border (⌘K, ↵)│
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

---

## 5. Detailed Page-by-Page Execution Plan

### 1. Landing Page (`/`)
* **What Remains Untouched:**
  * The entire 3D entrance experience, Three.js doorway scene, camera journey, concrete geometry, and lighting.
  * The copywriting, navigation, and feature story (`LandingStory`).
* **What Changes (Atmospheric Addition Only):**
  * Weave 7 subtle diagonal textured light louvers / blades (inspired by Raycast's reference) behind the hero typography, angled at $-35^\circ$.
  * The concrete hallway and pillars of `hero-atrium.png` remain clearly visible beneath the louvers.
  * Primary CTA button styled in crisp solid white (`Get started ↗`), matching the reference.

### 2. Authentication (`/sign-in` & `/sign-up`)
* **What Remains Untouched:**
  * Clerk authentication behavior, credentials, and routing.
* **What Changes:**
  * **Left Stage (7 Cols):** Introduces the **3D Forensic Session Deconstruction Stage**:
    * **Layer 1 (Top / $Z = +90\text{px}$): DOM Replay Viewport:** Frosted optical glass showing the browser viewport, checkout button click point, and active ripple beacon.
    * **Layer 2 (Middle / $Z = 0\text{px}$): Diagnostic Network & State:** Transparent telemetry grid showing `POST /api/v1/orders/charge` $500$ error waterfall bar and `TypeError` callout.
    * **Layer 3 (Base / $Z = -90\text{px}$): Synthesized Playwright Test:** Smoked glass plate showing synthesized test code tokens and selector validation badge.
    * **Luminous Laser Filament:** Vertical laser thread connecting the DOM click $\to$ $500$ error $\to$ Playwright assertion.
    * **Interactive Controls:** Toggle between **"3D Exploded Layers"** and **"Assembled Session"**, with real-time 3D cursor parallax tilt.
  * **Right Stage (5 Cols):** Raycast-grade clean access terminal with neutral charcoal background, crisp solid white primary button (`Continue with Email ↵`), and subtle dark SSO pills.

### 3. Projects Hub (`/app/projects`)
* **What Remains Untouched:**
  * Project creation logic, project querying, and route navigation.
* **What Changes:**
  * Match user reference (Image 1):
    * Monumental header: `"Your projects"` with subtitle `"Connect a website. Keep every bug report in context."`
    * Action button: crisp solid white `"Create project"` button (`bg-white text-black font-semibold`).
    * Container: smoked glass panel over the architectural background with `"Websites 2"` pill badge.
    * Project rows: `test` and `AskAnon` rows with `Open reports →`, `SDK setup`, and `Settings` links.
    * Bottom status bar: `"Your workspace. Your evidence."` with emerald isolation indicator.

### 4. Investigation Workbench (`/app/reports/[id]`)
* **What Remains Untouched:**
  * Security sandbox on `127.0.0.1:4192`, rrweb player engine, CSP headers, and event validation.
* **What Changes:**
  * **Replay Player Viewport:** Smoked glass frame with macOS traffic light dots and clean URL pill, eliminating the jarring white background box.
  * **Tactile Glass Timeline Rail:** Integrated multi-track scrubber (DOM clicks + Network waterfall + Error spike at $15.16\text{s}$) with a magnetic playhead and soft cursor ghost.
  * **Offline Replay Fallback:** Clean Unravel banner if `127.0.0.1:4192` is offline, rather than an unhandled Chromium error iframe.
  * **State Retention:** Preserves player state when switching between tabs, avoiding reset to $0.00\text{s}$.

### 5. Test Plan Studio (`/app/reports/[id]` $\to$ `Reproduction & test plan`)
* **What Remains Untouched:**
  * Test plan synthesis contracts, versioning, optimistic locking, and `css-what` selector verification.
* **What Changes:**
  * **Fix Sticky Footer Click-Hijack:** Move `.generator-action-footer` into a clean flex dock, completely eliminating click blocking on step actions and CodeMirror lines.
  * **Side-by-Side Step $\leftrightarrow$ Code Highlight Sync:** Hovering an action step highlights the corresponding lines in the Playwright code editor in real time.
  * **Performance Optimization:** Refactor `readPlan` to a single join query, reducing tab switch latency from $6.6\text{s}$ to $< 250\text{ms}$.

### 6. Reports Triage (`/app/reports`)
* **What Changes:**
  * Eliminate full document reload on search by using client-side filtered state with `useTransition`.
  * Clean, high-density table rows with subtle status pills over the architectural background.

### 7. SDK Setup & Settings (`/app/setup`, `/app/settings`)
* **What Changes:**
  * SDK Setup: Framework switcher (`Next.js App Router`, `React Vite`, `Vanilla Script`) with clean syntax highlighting and copy button.
  * Settings: Smooth iOS/macOS toggle switches and encrypted API key vault with click-to-reveal.
  * Both views layered over the persistent architectural atrium background.

---

## 6. CSS Consolidation Strategy

### The Current Problem
`Provider.tsx` currently imports 5 competing stylesheets:
`workspace.css` $\to$ `product-v2.css` $\to$ `compositions.css` $\to$ `product-materials.css` $\to$ `workspace-shell.css`, plus route-specific `test-plan.css` and `report-management.css`.
These files redefine `--product-surface` three separate times (`#111318`, `#101216`, `#191b22`) and cause style bleed and layout unpredictability.

### The Proposed Consolidation (Phase 1)
* Consolidate the 5 legacy workspace CSS files into a single, clean stylesheet: **`workspace-theme.css`**.
* Define a single authoritative CSS variable hierarchy:
  * `--canvas-obsidian: #07080a;`
  * `--surface-smoked: rgba(14, 16, 22, 0.72);`
  * `--surface-elevated: rgba(20, 23, 30, 0.85);`
  * `--border-hairline: rgba(255, 255, 255, 0.08);`
  * `--border-specular: rgba(255, 255, 255, 0.15);`
  * `--accent-warm-crimson: #ff4d61;`
* This eliminates CSS override debt, removes dead styles (like unused `ProjectTabs.tsx`), and guarantees consistent rendering across desktop and mobile.

---

## 7. Phased Implementation Roadmap (Awaiting User Authorization)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PHASED EXECUTION PIPELINE                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
     ┌─────────────────────────────┼─────────────────────────────┐
     ▼                             ▼                             ▼
[PHASE 0: FOUNDATION]       [PHASE 1: SHELL & AUTH]      [PHASE 2: WORKBENCH]
• Fix sticky footer bug     • Consolidate 5 CSS files    • Replay window chrome
• Fix widget dock bug       • Restore hero-atrium bg     • Tactile timeline rail
• Fix /reports reload       • Build 3D Forensic Stage    • Step ↔ Code sync
• Neon query optimization   • Hero light blades addition • Offline host fallback
• Route prefetch skeletons  • Clean Raycast sign-in      • Retain player state
```

### Phase 0: Performance, Database & Functional Bugfixes (First Priority)
1. Fix sticky footer overlay in `test-plan.css`.
2. Fix widget dock stop bug in `packages/sdk/src/widget.ts`.
3. Transition `/reports` search to client-side filtering (`useTransition`).
4. Optimize `readPlan` and `savePlan` in `plans.ts` to use a single SQL join query, resolving the $6.6\text{s}$ tab latency.
5. Add route prefetching and `loading.tsx` skeletons for internal routes.

### Phase 1: Shared Shell, Translucent Smoked Glass & Workspace Alignment (Implemented & Verified)
1. **Smoked Glass Surfaces & Hairline Borders**:
   - Refined `--ui-surface` to translucent smoked glass (`rgba(16, 18, 24, 0.68)`) with `backdrop-filter: blur(20px) saturate(160%)` in `compositions.css` and `product-materials.css`.
   - Replaced thick opaque borders with crisp hairline precision: `1px solid rgba(255, 255, 255, 0.08)` and subtle top specular highlight `inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`.
   - Refined `.workspace-frame`: hairline border, subtle smoked glass background allowing the architectural hallway (`hero-atrium.png`) and ambient `MaterialLight` to shine through naturally without dulling contrast.
2. **Raycast-Style Interactive Controls**:
   - Primary button (`.product-button`): Pure solid white (`#ffffff`) with jet-black text (`#0a0a0c`), 8px radius, subtle hover lift (`translateY(-1px)`) and soft depth shadow `0 4px 12px rgba(0,0,0,0.25)`.
   - Secondary button (`.product-button.secondary`): Translucent smoked glass (`rgba(255, 255, 255, 0.04)`), hairline border (`rgba(255, 255, 255, 0.08)`), crisp text (`#ededed`), hover lift to `#ffffff`.
   - Text links (`.product-text-link`): Clean muted text `rgba(255, 255, 255, 0.50)` transitioning to `#ffffff` with subtle background pill on hover.
3. **Projects Workspace & Resource Rows**:
   - Refined monogram icon (38x38px, subtle 10px radius, neutral gradient with white letter).
   - High-contrast typography hierarchy: 16px Manrope title, 12px Plex Mono origin description.
   - Smooth row hover transition with pointer light integration.
4. **Instant Route Prefetching Skeletons**:
   - Added `loading.tsx` in `apps/web/src/app/(product)/app/projects/loading.tsx` and `apps/web/src/app/(product)/app/projects/[projectId]/reports/loading.tsx` matching exact layout geometry with quiet shimmering pulse.
5. **Clean Spacious Sign-in**:
   - Restored authentic architectural hallway.
   - Clerk card styled with smoked glass `rgba(18, 20, 26, 0.78)`, 16px radius, hairline border `rgba(255, 255, 255, 0.08)`, and solid white continue button. Zero fake UI or overlapping elements.

### Phase 2: Investigation Workbench & Test Studio Polish (Completed & Verified)
1. Replaced unstyled `#eeeeeb` player stage background with obsidian `#08090d`, a 1px hairline border (`rgba(255, 255, 255, 0.08)`), and an inner depth shadow.
2. Verified live replay playback on `127.0.0.1:4192` within the isolated security sandbox without staging flash.
3. Multi-track timeline rail refined with smoked glass background (`rgba(10, 12, 16, 0.70)`), warm crimson scrubber (`#ff4d61`), and segmented Raycast filter pills.
4. Test Plan Studio styled with numbered step cards and custom CodeMirror Playwright editor theme (translucent smoked glass, dark line gutters, high-contrast syntax tokens).

### Phase 3: Mobile & Responsive Viewport Verification & CSS Consolidation (Completed & Verified)
1. **Mobile Audit across All Routes (`390×844` on iPhone 14 Profile):**
   - Verified `/app/projects`, `/app/projects/[projectId]/reports`, `/app/projects/[projectId]/reports/[reportId]` (Investigation view, Test Plan steps, and CodeMirror workspace), `/setup`, and `/settings`.
   - Measured `document.documentElement.scrollWidth <= document.documentElement.clientWidth` on every route: **100% zero horizontal document overflow (`hasOverflow: false`)**.
   - Verified touch targets, sticky footer clearance, and responsive wrapping for mobile.
2. **CSS Consolidation & Redundancy Removal:**
   - Unified root `--product-*` and `--ui-*` tokens at `.unravel-workspace` in `workspace.css`, eliminating conflicting declarations across `workspace-shell.css` and `compositions.css`.
   - Established single sources of truth for `--product-surface` (`rgba(16, 18, 24, 0.68)`), `--product-border` (`rgba(255, 255, 255, 0.08)`), and `--product-crimson` (`#ff4d61`).
3. **Comprehensive Test & Build Verification:**
   - `corepack pnpm test`: 43/43 unit tests passed with 0 failures.
   - `corepack pnpm typecheck`: 0 errors across all packages and Next.js route types.
   - `corepack pnpm test:plans`: Playwright E2E suite passed (1.6m).
   - `corepack pnpm build`: Production Turbopack build passed cleanly in 1.6s with 0 warnings.
   - Tailwind and shadcn migration explicitly declined per user directive to maintain clean native architecture and Raycast craftsmanship.
