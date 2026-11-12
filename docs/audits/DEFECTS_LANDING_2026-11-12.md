# Defect corrections and landing completion

Date: 2026-11-12 (India time). This extends the [earlier audit](PRODUCT_AUDIT_2026-11-12.md); that audit remains a historical snapshot. No commit, push, publication, deployment, new account, Docker or destructive data cleanup.

## What changed

- SVG-child clicks now resolve to safe HTML controls without collecting SVG content or weakening private-subtree blocking.
- Native multiple selects retain masked/safe arrays and explicit deselection through SDK, validation, replay, plan review and standalone Playwright export. Old scalar recordings remain supported. Old recordings cannot recover previously omitted choices.
- The owner confirmed Clerk email-code + Google configuration. A fresh anonymous signup UI showed email/Google and no password input. First-factor delivery/recovery was not newly performed by the agent.
- Approved account closure now blocks new intake and retains all projects/reports/evidence. Reviewed additive migration 0004 creates the owner block table; the signed bounded Clerk handler is idempotent. Hosted delivery is still unconfigured/unverified.
- Investigation memoizes stable timeline derivation, caches unchanged player fit writes, avoids idle time messages, aligns grouped selection and exposes fit/100% inspection guidance. Report heading and actual recording aspect ratio reduce wasted space.
- Distinct report-header/workspace keys remove a reconciliation warning. Long-name desktop navigation is constrained to its own column. SDK onboarding is shorter, installation is copyable, and the mobile checkpoint precedes long code.
- Landing adds the approved normal recording story, interactive synthetic preview, readable diagnostics, same-badge scroll zoom, sequence/plan/code, local installation guide, privacy/FAQ and final CTA. Desktop animation is bounded native scrolling; narrow/reduced-motion layouts remain consecutive. Examples never mount the SDK or submit a visitor report. Generated code uses the actual adapter.
- The story observes outer landing layout changes so fallback/reduced-motion height changes refresh zoom positioning. The first workflow anchor clears the 3D stage rather than leaving a visible strip rendering behind navigation.
- Verification can use isolated Next output. No scene geometry, shaders, rays, textures or original prototype files were replaced.

## Actual workflow evidence

Independent React and Next sites used ordinary controls with default privacy/identification. React imported a freshly packed SDK through an independent npm consumer; Next used the workspace SDK. Each site exercised navigation/non-form button, clicked form submit, Enter submit, and native multi-select plus an SVG icon button. Eight reports were captured, submitted, reviewed and downloaded in the browser. No locator corrections were needed in those controlled cases. Four form cases needed safe values; two multi-select cases needed safe option replacements; every regression required a developer-supplied expected outcome.

Eight actual downloaded reproduction files passed. Eight regression files failed on intended text assertions against buggy targets, then those exact files passed against fixed targets. SHA-256 values were checked unchanged; retries were disabled. Artifacts: ignored `.cache/standard-proof/proof.json` and per-run traces/screenshots/results. This is not arbitrary-site compatibility or five-run statistical proof for every new scenario.

The full generator walkthrough exercised saved styled replay, private APIs, Remove/Restore, staged Cancel/Apply, Undo/Redo, invalid JSON/selectors, read-only code, download/run guidance, failed saves, revision conflicts, mobile/320px controls, tab recovery, native Back recovery and reduced motion. It passed with video enabled after explicitly closing the review page before the context. A fresh 13 MB video exists at `.playwright-mcp/generator-workflow.webm`; it contains synthetic product review after authentication, not sign-in credentials.

Fresh screenshots cover sign-in/signup, projects, registration, setup, settings, reports and not-found at desktop/mobile. Long names stay inside desktop navigation after the correction. Investigation/widget workflows also passed. Screenshots were opened, not merely saved. Runtime aesthetic acceptance remains the user's decision.

## Commands and outcomes

| Check | Actual result |
| --- | --- |
| `pnpm lint` | Passed after final application/test changes |
| `pnpm typecheck` | Passed |
| `pnpm test` | 41 passed; initial release-preflight fixture omitted the new webhook gate and was corrected |
| `pnpm test:integration` | All three real PostgreSQL files passed; earlier transient connection failures are retained in local logs |
| `SDK_LAB_BASE_URL=http://localhost:3016 SDK_BROWSER=all pnpm test:sdk` | 49 passed; one Chromium-only CDP touch case explicitly skipped in Firefox |
| `REPORTS_BASE_URL=http://localhost:3016 pnpm test:standard` with independent SDK entry | Nine checks passed, including eight real browser workflows and execution of all downloaded files |
| `GENERATOR_VIDEO=1 ... pnpm test:reports` | Four passed; pipeline seek missed target during concurrent software-WebGL tests (1185.3 ms) |
| Isolated pipeline browser run | Passed the unchanged 500 ms acknowledgement and time-offset targets, retry/deduplication, owner isolation and deletion of its own synthetic report |
| Final internal-page browser audit | Passed desktop/mobile layout and navigation bounds |
| `UNRAVEL_NEXT_OUTPUT=.next-verify pnpm build` | Passed; separate output preserves the existing developer build |
| `pnpm reference:check`, `pnpm posters:check` | 52 original prototype files unchanged; exact-scene poster integrity/freshness passed |
| `pnpm release:check` | Expected failure: six real production/operator gates absent; public ingestion remains disabled |

Landing/access coverage passed in focused runs: core camera/reveal/keyboard and ambient/reverse checks, then15 of16 remaining checks, then the corrected cold-route check passed independently. The latter had incorrectly rejected the shared brand SVG; it still asserts no scene resources or canvas. No final single combined-suite pass is claimed. New story checks passed preview controls, JSON/Playwright/framework views, mobile320/390, same-element forward/reverse zoom, responsive/reduced-motion release and absence of private write requests. The first legacy production run incorrectly assumed a development-only global diagnostics bridge; tests now read the controller-owned root bridge without enabling globals in production. A later legacy check found the real workflow-anchor/offscreen-rendering issue, which was corrected rather than weakening the assertion.

## Environment and failures

Existing app3000, fixture4184 and replay4192 were preserved. Temporary preview3016 uses isolated output and the existing development database. Repeated Neon OS DNS lookup failures affected both pooled/direct URLs even while standalone connections sometimes succeeded. Verification used a successful connection's resolved address in an ignored process-local DNS cache. TLS hostname/certificate checks stayed enabled, saved environment files were not rewritten, and no DNS/system/provider configuration was changed. This workaround does not prove deployed network resilience.

The failed combined seek measurement remains a missed performance target under that condition. Memoization/fit caching removes wasted work; it is not proof of universal sub500ms performance. Richer DOM sizes and real hardware still need profiling. The headless scene tests use software WebGL and are behavior checks, not an ordinary-laptop 60fps benchmark.

The finish reviewer initially requested two bounded corrections: remove the new reveal eyebrow and reconcile inherited raster provenance claims. Both were scored resolved, disposition ship, at that limited scope. Exact Figma fidelity/runtime accessibility were not certified. The asset scan reports five inherited raster metadata omissions; source records and approved binary integrity were retained. No new raster was generated or external image upload performed.

## Remaining boundaries

- Public HTTPS dashboard/player hosting, real signed webhook delivery/retries, production Clerk first-factor/recovery, edge/global abuse controls, reviewed retention/backups/disclosures and SDK license/notices/publication still require operator decisions/setup.
- Full reload continuity, custom controls, cross-origin frames, Shadow DOM, resource/visual fidelity and concurrent/delayed outcome checks retain documented limits. A test export is prepared, not automatically run or proven correct in the dashboard.
- Real phones, software keyboards, Safari/WebKit, screen readers and production load are unverified. Only targeted SDK/replay paths have Firefox evidence.
- A polished public independent demo and a human installation exercise are still future release work; the standard websites are automated independent verification targets.

No original developer report/evidence was edited or deleted. Synthetic data from failed or successful verification may remain under approved development test accounts. No broad cleanup was attempted.

## Final handoff

Relevant lint/typecheck/unit/database/build and the documented browser workflows completed. All18 landing/access cases have passing coverage across the focused runs described above. No camera/shader change followed the core scene checks; the later CSS anchor fix was exercised by the three hero-exit cases. The concurrent replay latency failure remains a limitation, even though the isolated unchanged target passed. The renderer pause after entering the story and mobile heading/navigation clearance were also inspected directly.

Temporary preview3016 was stopped; generated build/artifact files remain ignored for local review. Machine-specific verification type includes were removed from tsconfig and its generated Next reference returned to the default output. No source reset or work deletion. Branch main and existing origin retained; all work remains uncommitted.

Final service health: existing app3000 and fixture4184 returned200; replay4192 was found stopped and the previously approved local host was restarted, then returned200. Temporary3016/4191/4185 are not listening. The current browser was returned to the updated landing on3000 with normal motion preference restored.95 changed/new text files passed bounded credential-pattern, trailing-whitespace and local Markdown-target checks; git diff --check passed with only Windows line-ending normalization warnings. This is not a full secret/security audit.
