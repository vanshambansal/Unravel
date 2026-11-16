# Repository and local workspace

Owner: repository navigation. The default branch shows maintained source and reproducible checks. A larger local folder does not mean every file is on GitHub.

## On GitHub

| Path | Responsibility |
| --- | --- |
| `apps/web/src/app` | Next.js routes: landing, authentication, workspace, private APIs and `/demo`. |
| `apps/web/src/features` | UI and browser behavior grouped by product feature; demo, reports, projects, authentication, workspace and cinematic landing. |
| `apps/web/src/server` | Authentication, validation, database schema, repositories and services. |
| `apps/web/public` | Runtime images, fonts, icons, model/textures and their required licenses. Generated demo bundles are excluded. |
| `apps/web/tests` | Browser/integration tests for the application and demo workflows. |
| `packages/sdk/src` | Recorder, privacy modes, replay sanitization, network/error/action instrumentation and visitor widget. |
| `packages/contracts/src` | Shared versioned runtime schemas and types. |
| `packages/test-plan/src` | Plan schemas, action normalization, validation, readable descriptions and Playwright export. |
| `examples/sdk-react`, `examples/sdk-next` | Independent developer-installed SDK examples. |
| `examples/browser-demo` | Standalone React entry/build dependencies served through `/demo/react`. |
| `fixtures` | Controlled test applications and intentional failures used to verify integration. |
| `tests` | Shared unit tests, SDK browser tests and landing checks. |
| `scripts` | Build, local lifecycle, packaging, integrity, profiling and verification tools; see its README. |
| `docs` | Current architecture/operation guides, code walkthrough, release status and dated evidence. Start with its README. |
| `design` | Retained design references, concepts, asset sources and provenance; these are not all runtime assets. |
| `prototypes/landing-motion` | Protected original cinematic migration reference, outside the active workspace. |
| `.github/workflows` | Configured automated checks; a configuration file is not proof of a successful remote run. |

Root files include the main README, MIT license, AGENTS.md, workspace/package manifests, lockfile, Node version, lint/format configuration and browser-test configuration. `skills-lock.json` is retained agent-library metadata, not an application dependency; its removal remains a review candidate.

## Local only

| Files/folders | Meaning |
| --- | --- |
| `.git` | Local Git history, index and remote metadata. GitHub represents the commits, not this directory itself. |
| `node_modules`, `.pnpm-store` | Installed dependencies and package cache. Recreate from the manifests and lockfile. |
| `apps/web/.next`, `.next-*` | Generated development/production builds. Many named builds are older verification snapshots; a running preview may still depend on one. |
| `packages/*/dist`, example `dist` | Generated JavaScript and type declarations. For example, `packages/sdk/dist/widget.d.ts` describes the compiled public types; edit `packages/sdk/src/widget.ts` instead. npm contains the distributable SDK build, while GitHub maintains its source. |
| `apps/web/public/demo-assets` | Generated standalone React demo JS/CSS. Normal development/production commands build these from source. |
| `.cache` | Temporary SDK archives, registry consumers, screenshots, profiling data, generated-test execution proof and other verification output. |
| `test-results`, `playwright-report`, coverage | Test artifacts, traces and generated reports. |
| `.env.local`, other real `.env` files | Local credentials/configuration. Placeholder `.env.example` templates are deliberately tracked. |
| `.agents/skills`, `.agent`, `.claude`, `.gemini`, `.opencode`, `.codex` | Local agent libraries/configuration, excluded from Git under the owner's approval. |
| `.impeccable/review`, its local config/cache, `.playwright-mcp` | Local design/browser review output and tool state. |
| `.clerk`, `playwright/.auth`, logs, `*.tsbuildinfo` | Local auth/tool state, diagnostics and incremental compiler caches. |
| `examples/browser-demo/pnpm-lock.yaml` | Earlier local independent-install artifact; this demo now uses the root workspace lockfile. The separate manual React/Next example lockfiles remain tracked. |

The 784 previously tracked agent-tool files were removed from the current Git tree while keeping their local copies. Earlier commits still contain those files; no history rewrite was performed. Historical/design archive candidates in CLEANUP_REVIEW.md remain tracked until specifically approved. No local build/cache/data deletion is part of publishing these commits.
