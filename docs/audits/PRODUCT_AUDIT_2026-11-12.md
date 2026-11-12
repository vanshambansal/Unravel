# Product completion audit

Reviewed 2026-11-12 (India time). This is the Phase 2 review of the Phase 1 implementation, not approval to begin another redesign or release. See [verification](VERIFICATION_2026-11-12.md) for commands, failures and evidence limits.

Follow-up: [authorized corrections and landing completion](DEFECTS_LANDING_2026-11-12.md). Findings below describe the pre-correction audit; consult PROJECT_STATUS.md for current state.

## Verdict

Unravel has a real bounded local product pipeline, not just a landing-page demonstration. A visitor can record and submit, an authorized developer can investigate persisted evidence, edit a portable plan and download a test that runs independently. Report triage now works too. The architecture is appropriate for this portfolio project; another rewrite would delay completion without addressing the important gaps.

It is **not yet a reliable public, arbitrary-site product**. This review found two ordinary-control capture defects, variable replay seek latency, provider configuration drift and unfinished release operations. Public ingestion remains closed by default. Those limits matter more than the number of passing checks.

## Method and scope

- Inspected current SDK capture/privacy/submission/widget, contracts/presentation, server authorization/validation/persistence, report management, isolated replay, plan generation/export, release configuration, page compositions and documentation.
- Followed real browser journeys on the production preview and existing fixture, including desktop 1440px and mobile 390px. Phase 1 additionally exercised 320px report controls. New captures were opened and inspected; loading-only captures were rejected/replaced. Existing real reports were read, not edited or deleted.
- Used synthetic Clerk accounts and synthetic report/project data for writes. Tested invalid input, cancellation, failed saves, stale revisions, reloads, ownership, filters and navigation. Separate React/Next integrations exercised real downloads and executed the downloaded files.
- Reviewed the previous [generator audit](TEST_GENERATOR_2026-11-11.md) against current behavior. No separately identifiable Antigravity report was found in the repository; unavailable findings cannot be represented as independently reverified.
- This is a focused engineering/product review, not a penetration test, legal review, full dependency-license audit or accessibility certification. Browser emulation does not establish real-device behavior.

## Captured user journey

Images below are local ignored artifacts from this task, not distributable repository assets. They may be absent in a fresh clone. The written findings remain self-contained. No customer report screenshots were uploaded to an external design service.

| Step | Goal and current health | Current-run evidence |
| --- | --- | --- |
| 1 | Enter and understand Unravel: approved opening preserved; subsequent product story unfinished | [Hero](../../.playwright-mcp/audit-20261112-13-landing.png), [workflow destination](../../.playwright-mcp/audit-20261112-14-workflow.png) |
| 2 | Authenticate: balanced B composition; signup still requires a password despite selected email-code direction | [Desktop](../../.playwright-mcp/audit-20261112-09-sign-in-1440.png), [mobile signup](../../.playwright-mcp/audit-20261112-09-sign-up-390.png) |
| 3 | Choose a project: clear practical rows and direct management links | [Projects](../../.playwright-mcp/audit-20261112-01-projects.png) |
| 4 | Register/manage a website: exact origin guidance and deliberate deletion; functional local workflow | [Registration](../../.playwright-mcp/audit-20261112-02-registration-1440.png), [settings](../../.playwright-mcp/audit-20261112-03-settings-1440.png), [mobile](../../.playwright-mcp/audit-20261112-03-settings-390.png) |
| 5 | Install SDK: complete mount snippet, honest received-report state; local packaging remains cumbersome | [Setup](../../.playwright-mcp/audit-20261112-04-setup-1440.png), [mobile](../../.playwright-mcp/audit-20261112-04-setup-390.png) |
| 6 | Record/describe: widget supplies the visitor workflow without project-ID entry; mobile keyboard remains unverified | [Ready](../../.playwright-mcp/audit-20261112-10-widget-ready.png), [recording](../../.playwright-mcp/audit-20261112-11-widget-recording.png), [describe](../../.playwright-mcp/audit-20261112-12-widget-describe-mobile.png) |
| 7 | Find/triage reports: search, status, metadata edits and pagination verified with persisted records | [Collection](../../.playwright-mcp/audit-20261112-05-reports-1440.png), [mobile](../../.playwright-mcp/audit-20261112-05-reports-390.png) |
| 8 | Investigate: recognizable masked replay and correlated evidence; fit-scale and hierarchy still weak on mobile | [Desktop](../../.playwright-mcp/audit-20261112-06-investigation-1440.png), [mobile](../../.playwright-mcp/audit-20261112-06-investigation-390.png) |
| 9 | Review a plan: recovery/validation implemented; technical wording and long review remain friction | [Plan](../../.playwright-mcp/audit-20261112-07-plan-1440.png) |
| 10 | Inspect/download/run: one highlighted code workspace and real standalone exports; dashboard cannot claim they passed | [Code](../../.playwright-mcp/audit-20261112-08-code-1440.png), [mobile](../../.playwright-mcp/audit-20261112-08-code-390.png) |

The stored plan shown in the read-only audit contains developer-edited assertions. Its unusual values/duplicate checks are not evidence that generation invented those assertions. No edits were saved to that report.

![Step 7: searchable report collection](../../.playwright-mcp/audit-20261112-05-reports-1440.png)

![Step 8: replay and evidence workspace](../../.playwright-mcp/audit-20261112-06-investigation-1440.png)

![Step 10: one generated-code workspace](../../.playwright-mcp/audit-20261112-08-code-1440.png)

## Engineering findings

### F1 — High: SVG icon-button clicks disappear from semantic actions

**Confirmed by a fresh browser probe:** recorded an ordinary text button click, a click on a rectangle inside an SVG icon button, then a native select. The text click and select appeared; the icon-button click did not. This probe used the built SDK with default identification and temporary ordinary DOM controls, not a fixture test-ID allowlist. No report was uploaded.

Affected: `packages/sdk/src/events.ts` (`action`, early blocked-target check), `packages/sdk/src/privacy.ts` (`BLOCK_SELECTOR`). SVG is deliberately blocked from replay, but the early semantic check rejects its child before resolving the containing button. A generated reproduction can silently miss a real action.

**Next fix:** resolve a safe actionable light-DOM ancestor for semantic interaction, while continuing to block SVG replay and genuinely sensitive ancestor subtrees. Add actual browser coverage for icon buttons, links with SVGs and blocked nested content. Do not collect labels or SVG paths to solve this.

### F2 — High: native multi-select is reduced to a single value

**Confirmed in the same browser probe:** two options were selected (`a`, `b`), but the semantic select event contained only `a`. The safe synthetic select values were explicitly opted in for this probe. `events.ts` reads `.value`; the scalar contract and exporter call `selectOption(string)`.

Affected: SDK events, shared semantic contract, `packages/test-plan/src/index.ts`, plan controls. Either add a versioned multi-value representation with masking and execution tests or explicitly flag multi-select as unsupported. Silently exporting one option is incorrect. Old recordings cannot recover omitted values.

### F3 — Release blocker: configuration acknowledgements are not deployed protection

Affected: `server/release.ts`, ingestion Route Handler, `server/reports/repository.ts`, replay host and deployment environment. Phase 1 adds real shared project budgets, serialized storage admission, bounded streaming/timeouts and default public closure. These are useful safeguards, not comprehensive abuse prevention.

A caller can spoof Origin outside a browser and exhaust a known project's budget. Rejected origins/unknown projects still incur server/database work. Fixed windows permit boundary bursts; there is no verified edge/global concurrency shield. A logical serialized-byte cap is not a hard PostgreSQL disk quota. Operators must configure and verify the public edge; setting an acknowledgement variable alone does not prove that work happened. See [release contract](../DEPLOYMENT.md).

### F4 — Release blocker: Clerk configuration differs from the chosen experience

Fresh signup visibly exposes a required password. The approved direction is email verification-code + Google. Session-injection tests prove ownership behavior, not email delivery, new-account signup or OAuth recovery. Existing historical user confirmation of Google/email sign-in does not prove current signup matches.

Affected: provider settings and supported Clerk forms, `docs/SERVICE_SETUP.md`. Owner/admin access is needed to reconcile settings and manually exercise new/returning accounts, sign-out, recovery and production domains. Do not hide required provider fields or build a parallel auth state machine.

### F5 — Medium: seek performance is variable; do not promise a universal 500 ms response

The combined browser run measured input-to-player acknowledgement at **582 ms** against the unchanged 500 ms target. A subsequent fresh pipeline run passed. This is an actual missed target, not a reason to increase the threshold or erase the earlier result.

Affected: `ReportViewer.tsx`, isolated player and replay payload size/render cost. Profile several representative DOM sizes and repeated seeks with browser/GPU conditions recorded. Keep time-offset accuracy separate from response latency. Source currently sorts/builds timeline entries on every viewer render, including playback updates; memoizing stable event derivations is a concrete bounded optimization candidate, not proof of the measured cause.

### F6 — Medium: structural identification trades privacy for resilience

Default tag/ordinal paths avoid sensitive labels/attributes and worked without locator edits in six controlled React/Next scenarios. They are fragile if siblings/layout change. Delayed SPA transitions, custom controls, contenteditable, Shadow DOM, iframes, canvas, file upload, full-document navigation and authenticated test prerequisites are not universally handled. Full navigation ends memory-only capture rather than preserving a cross-page report.

Affected: SDK privacy/events, generation heuristic, integration instructions. Make the supported interaction matrix prominent. Improve ordinary-control coverage before adding selector intelligence. Optional safe stable identifiers remain useful; do not broaden text collection silently. A conservative unsupported warning is preferable to incorrect exported actions.

### F7 — Medium: export validation cannot establish business correctness

Syntax/schema checks, explicit expected-behavior confirmation and standalone output are appropriate. Export does not inspect the live target or verify locator existence/uniqueness. New simultaneous requests to the same method/path can still make response assertions ambiguous. No-page-errors has a bounded observation window; it is not an HTTP/late-error guarantee. The current **Prepared for export / Not run** language is substantially more honest than the old Ready labels.

Affected: plan engine/editor and run guide. Keep a visible completion assertion and action-bound response checks. Add guidance for fixture/auth prerequisites; do not introduce hosted arbitrary-code execution or an LLM to hide these limits. Actual local execution remains the source of truth.

### F8 — Medium: replay is recognizable within a deliberately bounded fidelity envelope

Current fixture layout/colors/failure feedback replay correctly without enabling recorded scripts or external requests. Old structural reports remain limited. Computed-style snapshots are not original CSS: images, external fonts, pseudo-content, canvas, Shadow DOM and some dynamic stylesheet/media effects remain omitted. A full-site visual clone is not currently promised.

Affected: SDK presentation/replay, contracts presentation sanitizer, server validation, player. Preserve the isolated host and inert document. Add representative styled applications before selecting richer resource capture. A resource proxy/object-storage expansion is not needed for the present MVP.

### F9 — Medium: release distribution and lifecycle are unfinished

The private package installs from a local tarball and works in a separate npm consumer. It is not available from the registry. The repository still needs an explicit distribution license/third-party notices review, version/release policy and approved publication. Retention remains owner-managed, with no automatic expiry or reviewed public visitor disclosure. These are operator/product decisions, not missing CSS.

External account closure also needs a policy: project ownership is a Clerk subject string and ingestion checks the registered project, not whether that Clerk account still exists. There is no verified account-deletion synchronization workflow. If the provider permits account deletion, inaccessible owned data and continued ingestion are possible. This is a source-derived lifecycle risk, not a destructive account-deletion browser test. Decide the behavior before release; do not silently add a data-deleting webhook without approval.

### F10 — Low/medium: simplify ownership and maintenance hotspots deliberately

- `server/reports/repository.ts`: project-row locking now serializes inserts; the older post-conflict retry branch is defensive duplication. Review before simplifying, preserving concurrency tests.
- Plan read/save authorization fetches report detail/evidence even where a lightweight ownership/revision check would suffice. Avoid repeatedly loading event JSON for metadata-only work.
- Metadata/report forms, filters and timeline rendering contain dense one-line JSX; feature styles span several documented layers. Format/split logic as touched, with one owner for each composition. Do not add another theme override file.
- Offset pagination is deterministic for a stable dataset, not a cross-request snapshot while new reports arrive. This is acceptable at MVP scale if documented; cursor pagination is a measured future choice.
- Verification builds/dev servers share the Next output directory. This session observed stalled development navigation while the production preview worked. A collision is a plausible cause, not proven diagnosis. Isolate verification output or serialize dev/build use before a reliable CI/demo workflow.
- No CI workflow is present. Add a small credential-free lint/type/unit/build pipeline, then separately gated integration tests; do not upload credential-bearing auth state/traces.
- Several agent ecosystems contain the same checked-in skill binaries/instructions (`.agent`, `.agents`, `.claude`, `.gemini`, `.opencode`). This is tooling distribution rather than product code. Review one maintained source and generated/installed copies later; do not delete user tools automatically. Git can deduplicate identical blobs, so working-directory repetition is not evidence of the same multiplied clone size.

## UI/UX findings and next design scope

The A shell now has a recognizable material identity and consistent navigation. Settings is purposefully grouped, deletion is deliberate, the recorder is self-contained, and readable 14px code replaces the previous tiny preview. More components or another general UI library will not by themselves improve the task.

1. **Investigation should start closer to evidence.** At 1440x900 the replay begins around the middle of the first viewport. Compact the report heading/metadata and keep selected evidence/details close to the replay. Make failed requests/errors visibly distinct without implying root cause. Preserve one player and its time during selection/metadata edits.
2. **Fit is an overview, not readable mobile playback.** A desktop recording becomes extremely small on a phone. The current 100% control works but is not an obvious inspection mode. Offer an explicit Overview / Inspect explanation and strong selected-event context. Do not stretch the recorded page or claim it is a mobile recording.
3. **Evidence wording should summarize the task.** Raw structural paths can consume a row and remain cryptic. Show a safe action summary in the list, with the exact path in details. Typing groups help; selecting an interior raw event then regrouping should use consistent visual/ARIA selection rather than only highlighting the group's final index (`ReportViewer.tsx`).
4. **Onboarding is truthful but too long.** On mobile, large code and policy blocks push the received-report checklist far down. Use a concise installation path with copyable install command, framework snippet and a clear first-report checkpoint. Provide the actual platform-specific tarball path locally; distinguish package installation, mounting and successful submission. Do not invent Connected status.
5. **Plan review should keep evidence nearby.** The simplified flow works, but technical locator language, repeated outcome controls and a long page still demand expertise. Add contextual safe summaries and a compact evidence peek rather than another questionnaire. Keep advanced fields behind Edit. Duplicate expected checks can be discouraged without rewriting the developer's plan automatically.
6. **Motion should explain state.** Use the existing shared-layout selection for timeline/evidence-to-step linkage, a clear saved-state transition, an interruptible recorder-to-dock morph and restrained shell navigation. Do not animate the recorded document or make diagnostics slide while reading. Existing motion/reduced-motion primitives are sufficient; no new animation library is needed.
7. **Recorder control intent needs clarity.** The panel is much more compact and readable, but the minimize/close glyph can be mistaken for discarding; name and illustrate the dock transition. Keep Start/Stop primary, provide easy repositioning and inspect with a real software keyboard before phone claims.
8. **Use atmosphere selectively.** B authentication benefits from architecture. The same large background behind every task is less useful than controlled contrast in evidence/code areas. Refine task surfaces rather than making more glass or nested cards. Keep the approved landing renderer untouched.

Accessibility strengths include native modal focus containment, associated fields, keyboard project/workflow navigation, seek/resize controls and reduced-motion handling. Risks needing further work include small secondary link targets, technical-text readability, long mobile reading distance, real touch keyboards and screen-reader announcements/reading order. No WCAG conformance claim is made. A full-page screenshot showed an offscreen fixed skip-link capture artifact; DOM inspection confirmed it was unfocused at y=-100, so that image artifact is not reported as a live navigation defect.

## Previous findings reconciled

| Earlier generator concern | Current assessment |
| --- | --- |
| Silent loss on refresh / no Cancel or Undo | Native warning, staged Cancel/Apply, Undo/Redo/Reset and bounded authorized memory recovery verified. Crash/cross-session recovery remains intentionally absent. |
| Invalid CSS marked ready | Parser/schema/export checks now reject malformed/unsupported selectors. Target existence remains runtime-only. |
| Default integration cannot identify ordinary controls | Structural paths now work in controlled minimal integrations; F1/F2 show ordinary controls still need coverage. |
| Click plus SPA navigation blocks export | Recent causal navigation/submit normalization implemented and exercised. Heuristic boundaries remain. |
| No useful post-download handoff | Run guide and highlighted code are implemented and browser-exercised. |
| Tiny code and separate JSON editor | One 14px CodeMirror workspace; Playwright read-only, JSON explicit Apply/Discard. |
| HTTP failure confused with intended behavior | Developer-confirmed expected outcomes and unchanged-test negative/positive proof retained. No automatic business assertion invention. |

## Remaining roadmap

**Must Fix before public/portfolio completion**

- F1 icon-button capture and F2 multi-select correctness/unsupported reporting, with real exports executed.
- Reconcile Clerk signup and verify first-factor flows; complete real public HTTPS/edge/replay/provider/privacy checks before opening ingestion.
- Distribution license/notices and approved package distribution; independent developer installation acceptance.
- Finish the public product story/diagnostic discovery/final CTA and remove stale prototype-only copy without redesigning the accepted entrance.

**High Impact**

- A separately deployable demo application with normal SDK installation, one form bug and one navigation/non-form bug. Keep it on a separate origin; a main-site `/demo` page can link to it. Provide a clean branch/starter without the SDK for the user's manual instructions exercise. Existing automated standard fixtures are useful tests, not yet that polished public demo.
- Decide how a reviewer sees owner-private demo reports: an authenticated owned sandbox or a recorded synthetic walkthrough is appropriate. Do not bypass report ownership or expose a shared developer credential merely to make Try demo easier.
- Focused investigation/plan usability pass described above; repeat timed tasks with a new developer.
- Replay seek profiling, fuller ordinary-control coverage, keyboard/screen-reader checks, real phone and Safari/WebKit testing; Firefox dashboard/auth remains unverified.
- Small CI pipeline and a reproducible synthetic demo script, architecture walkthrough and retained unchanged-export proof.

**Nice to Have**

- More stable opt-in locator hints, clearer local packaging paths, lightweight restore/import for portable JSON, measured cursor pagination if collection activity justifies it.
- More source-linked contextual plan suggestions, without inventing expected correctness.

**Skip for this portfolio MVP**

- Teams, billing, assignments/comments, commercial analytics, more export frameworks, LLM generation, hosted arbitrary test execution, queues/microservices, another 3D framework or another broad visual reset.

## Portfolio assessment

This is a worthwhile and technically substantial first SDE project: reusable instrumentation, privacy boundaries, untrusted replay isolation, authorization, idempotent persistence, optimistic edits and deterministic code generation offer credible engineering discussion. The strongest demonstration is one real visitor report becoming an unchanged failing-then-passing test on an independently integrated site.

Today it is a strong local MVP with documented defects and incomplete release/presentation, not a finished production SaaS. Finish the narrow correctness and operator gates, produce a smooth short public synthetic walkthrough, and explain tradeoffs honestly. That will improve its resume value more than adding feature count or endlessly polishing the opening.
