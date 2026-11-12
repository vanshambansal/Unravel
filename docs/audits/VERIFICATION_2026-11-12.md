# Completion verification record

Date: 2026-11-12, India time. Companion to [product audit](PRODUCT_AUDIT_2026-11-12.md). Outcomes below belong to this task unless labelled historical. A check count is supporting evidence, not the definition of feature completion.

## Phase 1 implemented

- Additive `0003_workable_viper` migration: report status/revision/update timestamp, constraints/index, shared ingestion budgets. Reviewed SQL and applied successfully to the existing development database; integration tests use the separate configured test database. No original evidence was rewritten/deleted.
- Owner/same-origin/revision-protected metadata edits and resolve/reopen. Search across authorized title/description, literal wildcard escaping, deterministic 20-row pages and URL-preserved filters. Lists omit replay/event payloads. Count and rows share a repeatable-read snapshot.
- Dialog cancellation, failed-save retention, explicit stale-conflict recovery, native unload warning and bounded memory-only metadata recovery. Metadata edits do not remount the player.
- Adjacent same-target typing groups in presentation only, with raw-event toggle and final-value seeking. Raw capture and plan generation are unchanged.
- Default-closed public ingestion; canonical app/replay configuration, PostgreSQL attempt/storage admission, size/read/upload deadlines, explicit retry and HTTPS isolated-host support. Configuration flags acknowledge operator work; they do not implement an edge provider or privacy policy.
- Touch-after-drag correction: browser diagnostics showed a completed touch tap without a compatibility click. A bounded handle-only touch activation now avoids the missing click and suppresses delayed duplicate compatibility clicks; drag never starts recording.
- A stalled SDK upload now ends visibly after 30 seconds and retains the frozen envelope for manual retry. No automatic submission/retry.
- Firefox SDK execution, independent npm tarball consumer verification and local HTTPS replay checks. No registry publication or public deployment.

## Browser workflow evidence

### Report management

`REPORTS_BASE_URL=http://localhost:3016 pnpm test:report-management` passed the production-browser journey (PowerShell uses `$env:REPORTS_BASE_URL=...`). Real visitor capture/submission preceded the management checks.

Verified: empty title rejection; Cancel leaves saved details unchanged; failed PATCH retains edits without false success; dirty refresh prompts; title/description/status survive reload; another owner gets 404; foreign write origin gets 403; stale revision produces deliberate reload; replay DOM remains mounted during metadata save. Grouped/raw timeline toggles work.

Twenty-three actual synthetic submissions exercised page 1/page 2/Previous with no duplicate/omitted records in that stable dataset. Search/status survive detail/back navigation, no-match is distinct from empty, and Clear filters resets visible inputs as well as results. Initial verification caught the uncontrolled-form Clear bug; keying the search form to the query corrected it. Dialog controls were inspected at 1440/390/320px, including keyboard focus and visible save/cancel.

### Independent React/Next capture to executed export

`pnpm test:standard` completed six real capture/review/download scenarios plus execution proof: form click-submit, Enter-submit and navigation/non-form button for both hosts. React used an SDK installed into a separate npm consumer from the real local tarball; Next used the workspace package. Neither supplied test-ID/privacy allowlists.

- Six actual reproduction files passed against the buggy targets.
- Six regression files failed on the intended text assertions against buggy targets.
- The identical six regression files passed after controlled fixes, retries disabled; hashes and artifacts in `.cache/standard-proof/proof.json`.
- Zero locator corrections for those controlled scenarios. Each of four form scenarios required one safe synthetic replacement value; all six regressions required the developer's intended outcome.

This does not prove arbitrary sites, registry installation or that a new human integrator understands every instruction. The independent audit subsequently found SVG-button and multi-select omissions; see F1/F2.

The freshly downloaded Question Submission export was also executed five times per version: five intended buggy text-assertion failures, five fixed passes, retries 0, unchanged SHA-256 `47db34e68fe29e6c8247afda346eff2aabdbd3407c7c616e3ee0895ac308f27d`. The tracked buggy fixture was not edited; the proof uses an isolated patched server.

### SDK and isolated replay

`SDK_BROWSER=all pnpm test:sdk`: Chromium 23 passed; Firefox 22 passed and the Chromium-CDP touch-injection case explicitly skipped. The complete result is 45 passed / 1 skipped, not cross-device certification. A Firefox-only SDK-lab readiness race was corrected by waiting for mounted lifecycle readiness. Ten fresh focused Chromium touch-after-drag runs passed after the fix. No real phone was tested.

The stalled-upload case used a controlled browser clock: one attempt timed out, retained its recording/error, and the explicit retry sent exactly the same body. Privacy, listener teardown, masking, SSR-safe import and normal network behavior checks remained in the browser suite.

`node scripts/verify-replay-https.mjs`: Chromium and Firefox loaded the trusted player over local TLS, replayed inert content, could not access the dashboard, made zero external resource requests and rejected wrong Host/unknown sensitive paths. `.cache/replay-tls/results.json` records conditions. Test clients explicitly ignored the temporary self-signed certificate; public TLS/proxy/certificates remain unverified. Temporary servers were stopped.

### Final combined report run and corrections

The first production combined run was **not clean**: visitor widget and sandbox passed; replay acknowledgement measured 582 ms against 500 ms; page audit and long plan journey timed out. No product threshold was increased.

Waiting for `domcontentloaded` plus the existing explicit visible-control assertions replaced waiting for third-party page-load completion. The next combined run passed pipeline, all-page audit, sandbox and visitor widget; the plan check used a closed original browser context for API calls and received no expected revision. It was changed to share the active review context and assert API status explicitly. A subsequent run completed more recovery steps but exhausted its three-minute overall walkthrough budget. The complete walkthrough budget is now five minutes; individual action/navigation/expect deadlines and all assertions remain.

The final no-video generator walkthrough passed separately in 4.4 minutes, including all product recovery/export assertions. The full combined suite was not rerun after the harness changes. Final static checks are recorded in PROJECT_STATUS.md. Earlier failures are retained here rather than described as first-pass success. The replay latency target is not a universal guarantee even when the subsequent pipeline passes.

Stage diagnostics subsequently reached **workflow complete**, including native Back and reduced motion, then stalled at closing the video-recording context until the five-minute deadline. Video capture is now explicitly opt-in with `GENERATOR_VIDEO=1`; the normal run retains every workflow assertion. Video-enabled teardown is an unresolved local harness issue, not a successful fresh video deliverable. The previous walkthrough video remains historical. This distinction must remain visible even if the no-video run passes.

## Static, database and configuration checks

- `pnpm test`: 40 unit cases passed.
- `pnpm typecheck`: passed, including generated Next types and SDK/test types.
- `pnpm lint`: final run passed.
- `pnpm test:integration`: both real PostgreSQL test files passed, including edits/stale revisions, immutable digest/evidence, literal search and shared concurrent attempt admission (30 accepted, 5 rejected). Reran successfully after using database time for budget windows.
- `pnpm db:migrate`: reviewed additive development migration succeeded. Migration tooling was not run automatically at app startup.
- `pnpm build`: final production build passed, including current TypeScript, static generation, replay host and poster checks.
- `pnpm release:check`: expected nonzero exit for five current release configuration gaps. Public app/replay origins, edge acknowledgement, privacy/retention approval and live Clerk configuration are absent. This is a blocker report, not an unexpected test failure.
- `pnpm sdk:pack`: real local package generated. Separate npm import, TypeScript declaration and browser bundling checks passed with no workspace imports. Package remains private/unpublished.

## Limits and operator blockers

Clerk Dashboard configuration/access is needed to remove required password signup and verify the selected email-code/Google experience. Existing session tests are not delivery/OAuth tests. Public hosts/domains, production provider configuration, edge controls, privacy/retention disclosures, backup policy and distribution license/publication need review. No paid plan, Docker or external service was provisioned.

Only the documented SDK/HTTPS paths were checked in Firefox; complete Firefox auth/dashboard, Safari/WebKit, real phone/software keyboard, screen reader and production load behavior are unverified. Local browser captures show layout/control behavior, not full accessibility compliance or aesthetic acceptance.

During the audit the existing development app had stalled navigations while the production preview responded. Shared Next build output is a suspected workflow hazard, not a proven application defect. Verification should isolate build output rather than interfere with a running developer server.

Original real reports, cinematic landing source, Vite reference and provider configuration were preserved. Synthetic reports created by failed verification can remain under the approved test account; no broad cleanup/deletion was performed. No commit, push, npm publish or deployment is part of this task.

Final hygiene: git diff --check passed; 61 changed/new text files had no detected credential patterns, trailing whitespace or missing local Markdown targets. This bounded pattern scan is not a comprehensive secret-scanner certification. Current branch main/origin were preserved; no Git publication.

At handoff, existing app 3000/sign-in, fixture 4184 and replay 4192/health returned HTTP 200. Owned preview/test/TLS/proof endpoints 3016/4191/4193/4189 were stopped; the original user tab remained open.
