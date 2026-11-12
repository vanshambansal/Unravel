# Project status

Updated: 2026-11-12 (India time).

New conversation: start with [HANDOFF.md](HANDOFF.md) for the reading map, stopping point and proposed remaining order.

## Authentication and internal responsiveness continuation - 2026-11-12

Active work: local production preview3020, not a hosted deployment. Its Clerk handshake failure was traced to the agent-started server's restricted outbound network (EACCES); it was restarted with normal connectivity. The user confirmed both Google and email-code login on3020. Automated development and local-production session/refresh/mobile navigation/logout/protected redirect/API401/Back checks passed. Protection-probe DNS failures also occurred while the form worked, so they are not established as the causal blocker. No provider security settings changed.

Implemented locally: matched-origin preview/replay launcher; Clerk-loading/error feedback; bounded intent prefetch and immediate link feedback; request-scoped project-read deduplication; one-statement report pagination with parallel project lookup; editor lifecycle/analysis caching; optimized internal artwork (2MB to51KB); conservative resource hints with explicit Enable3D. Normal cinematic rendering and prior shader fixes remain. Lint, app TypeScript check, unit43 and poster integrity/freshness passed. Focused real browser management, generator recovery/export and pipeline/replay checks passed across separate runs, with intermediate failures retained. Final desktop/mobile optimized artwork was visually inspected without overflow. Fresh exported regression execution failed on the intended assertion5/5 against the buggy fixture and passed5/5 against the fixed scratch copy, unchanged export/retries0. Evidence, measurements and limitations: [continuation audit](audits/AUTH_RESPONSIVENESS_2026-11-12.md).

Final local preview uses `.next-responsive-complete` on3020, paired with isolated4191. User confirmed both Google and email-code login. This supersedes older stopped-preview/auth-blocker statements below. Local control latency improved, but cold database requests still sometimes take seconds; universal smoothness and physical low-end-device acceptance are not established. Recommended next bounded work: correlate a reproduced cold slow request with numeric server/storage diagnostics before further changes.

## Hardware Chrome continuation - 2026-11-12

Installed headed Chrome successfully used Intel Iris Xe/D3D11. Development and production were profiled. Offscreen-target asynchronous scene compilation and parallel ray-program preparation reduced the three-run median largest startup frame gap from1466.6ms to288.8ms and median scene readiness from2144ms to1686ms. Normal rendering quality is unchanged; all four poster captures were byte-identical. Steady scroll did not consistently improve, so whole-app smoothness remains unaccepted. Clerk protection-probe DNS failures outside the sandbox blocked private navigation/replay/generator profiling. Final production build and all six focused headed hardware-Chrome lifecycle cases passed after the cancellation follow-up. Detailed methods, negative results, checks and exact user handoff: [hardware investigation](audits/HARDWARE_PERFORMANCE_2026-11-12.md).

## Earlier performance pass - 2026-11-12

Three targeted fixes are implemented: ray sizing no longer reads layout every frame; the existing sustained-poor-rendering guard responds to elapsed time; replay clock updates no longer rebuild evidence rows. Normal cinematic shaders/camera/assets remain unchanged. Lint/typecheck/unit41/isolated build and focused browser checks passed with exceptions recorded in [performance evidence](audits/PERFORMANCE_2026-11-12.md). Software-WebGL timings remain poor; full-app smoothness is not established. Clerk connectivity blocked fresh authenticated replay/navigation/generator verification. The SDK runner reported25 passing cases but stalled after reporting and was interrupted. Prior completion results below remain historical, not rerun claims.

## Current phase

Unravel has a working bounded local visitor-to-developer-to-regression pipeline, and the complete landing story is implemented after the approved cinematic entrance. Current task paused at a user-requested checkpoint: local authentication is verified; cold request latency, consistent cinematic scrolling and whole-app smoothness acceptance remain unresolved. Public release is **not ready**. The full completion evidence and intermediate failures are in [this record](audits/DEFECTS_LANDING_2026-11-12.md); older status is [historical](PROJECT_STATUS_HISTORY.md).

## Implemented

- Next.js/TypeScript/pnpm, Clerk identity, Neon PostgreSQL/Drizzle, server-enforced project ownership. Developers register/manage websites; visitors need no account or project configuration.
- Project creation, rename/origin correction and deliberate deletion; SDK setup supplies the complete widget mount. Exact protocol/host/port matter. No fake Connected state.
- Standalone compact movable widget, explicit recording, default masking, rrweb/presentation/actions/errors/safe network metadata, visible limits, stop/describe/submit/retry and idempotent persistence.
- Ordinary SVG-child button clicks and native multi-selects are corrected end to end, retaining privacy. New safe arrays and explicit deselection coexist with old scalar recordings.
- Owner-private reports, search/status/pagination, metadata editing/revision conflict recovery, immutable evidence, isolated script-disabled bounded styled replay and correlated raw/grouped timeline.
- Review-first portable plan, staged Cancel/Apply, Remove/Restore, Undo/Redo/Reset, unsaved/navigation recovery, one highlighted code workspace, safe-value/selector checks, confirmed outcomes, real standalone Playwright download and local-run guidance. Export remains Prepared / Not run.
- Approved A internal shell and B auth; focused fixes improve replay footprint/fit guidance, grouped selection, long-name navigation, report reconciliation and concise mobile SDK setup.
- Shared ingestion/storage caps, bounded request/upload timeouts and default-closed public ingestion. Signed idempotent account-closure handling blocks intake and retains data; hosted delivery is not configured.
- Completed marketing: normal recording section, interactive synthetic example, same-request diagnostic zoom, sequence/plan/code, SDK guide, privacy/FAQ and final CTA. Camera, assets, rays, shaders and original Vite reference are preserved. Nothing records/uploads from the landing.

## Verified in this task

- Eight real independent React/Next recordings completed capture, submit, review and browser download. React used an independently npm-installed fresh local tarball. Eight reproduction scripts passed; the same eight regressions failed on the intended assertions against buggy targets and passed after fixes, retries0 and hashes unchanged. Safe values and expected outcomes still require developer review.
- The complete generator recovery/edit/download workflow passed with a fresh video. Product page audit passed desktop/mobile and long-name navigation bounds. Widget/investigation and replay isolation checks passed.
- Chromium/Firefox SDK49 passed; one explicitly Chromium-only touch case skipped in Firefox. All three real PostgreSQL integration files passed, including signed account closure retaining replay and rejecting later submissions. Migration0004 was reviewed/applied without deleting data.
- Anonymous Clerk signup now shows email/Google and no password input after the user's provider change. Agent verification does not establish fresh email/OAuth delivery or recovery.
- Replay seek passed the unchanged500ms target in isolation. A concurrent software-WebGL run measured1185.3ms and remains a recorded missed target; broad DOM-size/hardware latency is not guaranteed.
- Unit41, lint, typecheck and final isolated production build passed. Prototype52 files unchanged; poster integrity/freshness passed. Release preflight correctly fails six missing production gates and public ingestion remains disabled.
- New landing interaction/mobile/zoom/reduced-motion checks passed. Core camera/reveal/keyboard skip and ambient/reverse tests passed. Hero hold/exit at1440x900,1440x700 and390x844, fallback/context loss, live motion preference, no-JS, repeated cleanup and interrupted initialization passed. Coverage is from focused runs; no final single combined-suite pass is claimed.

## Handoff

Implementation and relevant checks are complete for this local task. The first legacy production test run incorrectly used a development-only global bridge; tests now read the mounted-root bridge. A workflow-anchor check then found a thin visible WebGL strip; the anchor now clears it while keeping the heading readable. The cold-route check was narrowed correctly to scene resources: the existing shared brand logo is allowed. Intermediate failures and the mixed concurrent seek run remain documented, not recast as clean passes.

## Known limits and release blockers

1. Configure public HTTPS app/replay origins, production Clerk first-factor/recovery/domains, signed `user.deleted` delivery/retries, deployment edge/global abuse controls, privacy/retention/backups/disclosures and distribution license/notices/publication. Preflight declarations are not deployed protection. No services were provisioned.
2. Structural locators, custom controls, full reloads, Shadow DOM/cross-origin frames, safe CSS/resource fidelity and delayed/concurrent outcomes retain documented limits. Old captures cannot regain omitted data/styling. No hosted execution or arbitrary plan JavaScript.
3. Real phones/software keyboards, Safari/WebKit, screen readers and production load remain unverified. Full Firefox auth/product flows are unverified; targeted SDK/replay evidence exists. Software-WebGL tests are not laptop60fps measurements.
4. Neon DNS was intermittent. Temporary verification cached a successfully resolved database address in the process only; TLS and saved credentials/settings were unchanged. This is not a deployed resilience fix.
5. Public independent demo and human installation exercise remain future release work. Automated ordinary React/Next fixtures are real integration targets, not a polished public demo. Five inherited artwork metadata omissions remain disclosed; approved binaries/source records were preserved.

## Next actions

Resume from the explicit [remaining-work checklist](HANDOFF.md#remaining-work-resume-here): prioritize measured cold authenticated request latency, then steady cinematic smoothness and physical constrained-device verification. The user authorized a local checkpoint commit on 2026-11-12; no push or deployment. Older service/completion statements below are historical and superseded by the latest continuation above.

Review the implemented landing in the browser, then make explicit release/provider/privacy/distribution decisions before a controlled public portfolio deployment. Avoid another broad visual redesign. No commit, push, npm publication or deployment is authorized automatically.

Commands: [README](../README.md). Architecture/rationale: ARCHITECTURE.md and DECISIONS.md. Contracts: SDK.md, REPORTS.md and TEST_PLANS.md. Visual intent: DESIGN.md, INTERNAL_UI.md and LANDING.md. Operator setup: SERVICE_SETUP.md and DEPLOYMENT.md. Keep credentials in ignored local environment files only.

Existing user app3000 and fixture4184 remain running. Replay4192 was not listening at final health check; the previously approved isolated host was restarted for the local workflow. Temporary preview3016 was stopped; final service health is recorded in the completion verification. No generated build/artifact directory or user work was deleted. Git remains main with the correct existing origin; work is uncommitted.

Final health: app3000, fixture4184 and replay4192 returned200. Temporary3016/4191/4185 are no longer listening. The browser is open on the updated landing at localhost3000. Final whitespace,95 changed/new text-file credential-pattern scan and local Markdown-link checks passed; the bounded scan is not comprehensive security certification. No commit/push.
