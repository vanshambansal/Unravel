# Significant task log

Earlier preparation, reset, fixture, Figma and prototype records are preserved unchanged in [PROMPT_LOG_HISTORY.md](PROMPT_LOG_HISTORY.md). Record meaningful outcomes, not every tool call or full prompts.

## 2026-11-10 - PRODUCT-001: Next.js foundation and motion migration

- **Request:** Implement Milestone 1 only; Next.js/TypeScript + pnpm, retain vanilla Three.js and accepted visuals. Preserve prototype/fixture. No services, authentication, SDK, product sections, commits or pushes.
- **Changes:** Added apps/web with scoped motion adapter/controller, separate marketing/product routes, cancelled async initialization and cleanup. Copied accepted renderer/shaders/assets with local URL adaptation. Established root manifests/lockfile, lint/typecheck/unit/browser/build, poster capture/integrity and immutable reference/parity tools. Added architecture/development plan; consolidated current docs while preserving original history files. Updated AGENTS and the Figma state ledger without changing Figma frames.
- **Verification:** Lint/typecheck/build passed; 9 unit tests and 10 Chromium browser tests passed with retries disabled. Six controlled paused desktop/mobile reference pairs were pixel-identical. Four Next renderer posters captured and integrity checked. All 52 reference files unchanged. Production browser smoke passed live render, skip/focus, pause, route cleanup and maintenance-route rejection with no page errors.
- **Findings/fixes:** Browser tests exposed an unscoped CSS variable and subpixel stage intersection keeping rendering alive; both fixed. Capture route renamed because Next excludes underscore-prefixed directories. Browser trace screenshots disabled to avoid continual GPU readback; DOM snapshots/traces retained on failure. Windows WebGL checks use a generous timeout and allow software fallback, without claiming performance. Browser-install helper preserves existing tool caches.
- **Follow-up:** Milestone 2 needs separately discussed Clerk/Neon setup and local secrets. Real phones/other browsers and sustained performance remain unverified. Keep the original Vite prototype until explicit retirement and asset-builder path migration. Baseline commit requires separate authorization.

## 2026-11-10 - GIT-001: Initial baseline on main

- **Request:** Commit the current work locally and run git branch -M main.
- **Scope:** Baseline includes the Next.js migration, preserved prototype/fixture, authored assets and documentation. No push.
- **Checks:** Remote read succeeded with no advertised refs. Reviewed 157 candidate files; no common credential-pattern matches or files over 50 MiB. Generated outputs and local secrets remain ignored. Staged whitespace review found trailing spaces in six unchanged upstream font licenses; retained those bytes and the frozen prototype. Removed an extra blank line from application CSS. The remaining staged whitespace check passes when those license files are excluded; commit identity and final cleanliness are verified afterward.
- **Follow-up:** Continue Milestone 2 only when authorized. No application checks rerun for this Git/documentation task; prior results remain recorded above.
