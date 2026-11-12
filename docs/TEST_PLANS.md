# Reproduction plans and Playwright export

The local workflow is implemented using deterministic generation, not an LLM. `packages/test-plan` owns the framework-independent versioned schema, normalization, validation, readable steps and Playwright adapter. It imports no browser recorder or application runtime.

## Review -> code -> download

1. Open **Reproduction & test plan**. **Repeat the actions** is the default for a new report. Read the generated steps; only flagged actions need attention. Each action has Edit/Fix and Remove. Removed actions remain recoverable. The starting page is separate from action numbering.
2. Edit in the contextual sheet, then **Apply changes** or **Cancel**. New actions are staged too. Undo/Redo cover the last 25 applied draft changes; Reset restores the saved draft. Rebuild from recording asks for confirmation and is undoable. Existing saved plans are preserved; use that rebuild deliberately to adopt newer normalization.
3. Use **View code** for a single CodeMirror workspace: generated read-only **Playwright**, editable **JSON**, syntax colors and line numbers at 14px. Apply or discard JSON changes explicitly. Both views derive from one plan; changing JSON clears expected-behavior confirmation. JSON draft download is data, not executable code.
4. **Verify a fix** reveals expected-result controls. Choose an outcome that separates failure from intended behavior, then confirm it. Failed-request evidence supplies a path/method/action template when available, with an incomplete expected status requiring a deliberate choice. It never treats the recorded HTTP 500 as correct. Text checks need only intended text unless a specific element is necessary. No-page-errors alone cannot establish completion.
5. Save separately or **Download Playwright**, which saves applied changes first. Readiness means prepared for export, always **Not run**. Post-download instructions give the tests-folder destination, installation commands, baseURL configuration, and a copyable run command for the target website project.

Unsaved applied changes, pending JSON and staged fields trigger a native refresh/close warning and an in-app link confirmation. Failed saves retain the draft; revision conflicts require deliberate recovery/reload. The open feature tab retains state. Native SPA Back/unmount also has bounded memory-only recovery (up to four report drafts), loaded only after authorized GET succeeds. No values/tokens are written to browser storage. Explicitly leaving despite a native unload warning loses memory; recovery is not crash-proof or cross-session persistence. Undo history is local to the mounted editor.

Readable steps, JSON and code share the version 2 schema. Version 1 is upgraded in memory without rewriting saved rows/evidence or advancing revisions. No SQL migration or recording rewrite is involved.

## Identification and normalization

Default SDK integrations capture tag/ordinal structural paths, without page text, labels, classes, IDs or arbitrary attributes. Explicitly allowlisted test IDs take precedence. Structural paths are a privacy-preserving fallback, not a promise of stability across markup changes. Masked inputs still require synthetic replacement values.

Generation folds a focus-click followed by input, consecutive fills of the same identified element, and matching click/submit events. SubmitEvent.submitter supports implicit Enter submission when the browser supplies its control. A recent same-origin SPA transition following click/select/check is treated as resulting evidence rather than an extra action (bounded 2.5-second heuristic). Same-address history updates are suppressed. Pop/back navigation is retained; standalone safe navigation becomes an Open page action. Masked destinations remain flagged. Raw evidence is immutable.

## Execution boundaries

Generated files import only @playwright/test, use condition-based waiting and no fixed sleeps. The UI's run guide supplies baseURL configuration. Export does **not** contact the target website or establish selector existence, uniqueness, hydration readiness, business correctness or authenticated prerequisites.

- CSS selectors are parsed with css-what; malformed syntax, pseudo-elements and unsupported pseudo selectors are blocked on client and server export. Labels/text/roles use exact matching. Actual target uniqueness is checked by Playwright when run.
- Text checks default to exact text lookup; a scoped locator remains available. Visibility and final URL checks support non-form scenarios too.
- Response checks subscribe just before the chosen included action and consider only requests started after subscription. They match method, same origin and pathname, ignoring queries/bodies/headers. An older in-flight request cannot satisfy them; concurrent new requests to the same endpoint can still be ambiguous. A successful HTTP status alone need not prove business success.
- No-page-errors observes uncaught errors through completion of actions and the other checks. Add text/visibility/URL/response to define completion. Caught, late asynchronous and HTTP errors are different conditions.
- Structural locators can break after layout changes. Visual correctness, complex custom controls, file uploads, Shadow DOM, cross-origin frames and full-page recording continuity remain limited/unsupported. Review output and run it locally; no hosted execution or arbitrary plan JavaScript.

## Persistence and authorization

The reviewed additive `0002_magenta_red_shift` migration creates `report_test_plans` with one JSON plan/revision/update timestamp per report. Original report/replay rows are not rewritten. Report/project deletion cascades to the plan. There is no plan-version history or automatic expiry yet.

Private `/api/projects/[projectId]/reports/[reportId]/plan` supports GET (normalized saved plan or generated unsaved revision 0) and PUT (plan plus expected revision). PUT requires same-origin JSON, a bounded 128 KiB body and schema validation. Export is a private GET at the sibling `/export` path: mode=reproduction or mode=regression (default). It validates the saved plan for that output; invalid mode is rejected. Regression requires confirmed assertions, while reproduction deliberately omits them. Every operation checks the report's project ownership. A public project ID confers no plan/read/export access. Recorded evidence is immutable.

## Repeatable local proof

Root README owns normal commands. For a production check without disturbing an existing dev server:

```powershell
corepack pnpm build
# Terminal 1, using existing development credentials:
$env:REPLAY_ORIGIN='http://127.0.0.1:4191'
corepack pnpm --filter @unravel/web exec next start --hostname localhost --port 3016
```

```powershell
# Terminal 2:
$env:REPORTS_BASE_URL='http://localhost:3016'
corepack pnpm test:plans
corepack pnpm test:generated
```

The browser test records/submits the real fixture, verifies fresh styled replay, edits a safe value and expected assertion through the UI, saves/reloads it and downloads the real standalone file. It verifies owner isolation, schema rejection, stale revisions and export gating. It uses only the existing approved synthetic users and retains labelled E2E evidence.

The proof runner uses that exported file, without modifying it, for five fresh buggy runs and five fixed runs with retries disabled. The fixed fixture is an isolated temporary source copy with exactly the question endpoint response changed from HTTP 500 to HTTP 200; the tracked fixture keeps its intentional defect. Both versions use the same target origin. The runner checks buggy failures occur at the intended success-text assertion, not at an unrelated action.

Ignored `.cache/regression-proof/` retains the exported file/hash, exact patch, JSON reports and browser traces/screenshots. `proof.json` records actual outcomes. An expected buggy failure is reported separately from verification failures. Public release, broad website compatibility and automatic assertion correctness are not established by this controlled proof.

## Standard-installation proof

`pnpm test:standard` builds independent React and Next.js test websites, mounts the standard SDK using only public project ID/application origin, records via the real widget, submits to real authorized ingestion, reviews plans in the UI and downloads actual files. It uses no test IDs or privacy allowlists. The suite covers click-submit, implicit Enter-submit, and SPA navigation plus a non-form button failure on both frameworks.

The final case runs six reproduction downloads against buggy sites, then six regression downloads against buggy and fixed versions, retries disabled. It checks expected assertion failures and unchanged file hashes. Ignored `.cache/standard-proof/proof.json` records actual results and manual corrections; `.cache/standard-proof/` holds exports, traces and screenshots. The sites' local fixed flags are restored afterward. This is controlled standard-install verification, not broad third-party-site certification. See PROJECT_STATUS for outcomes.

## Adapter checks

After building packages, run `node scripts/verify-plan-adapters.mjs`. It runs actual generated files in Chromium against an intercepted synthetic website: positive and intended negative checks for each outcome plus assertion-free reproduction. It checks failure messages, not merely process exit codes. Artifacts/results live in ignored .cache/plan-adapters. This does not establish arbitrary-site compatibility. The real fixture export still has the separate five/five regression proof above.

## Multiple option selections

The version-2 select step accepts optional `values` with the same masked/array/empty-array semantics as recording events. Reviewers provide safe replacement option values one per line, or use Clear selection to deliberately select none. Export uses `selectOption(array)`; old scalar select steps still export unchanged. This corrects native multi-select only, not arbitrary custom dropdowns. Tests cover schema rejection, escaping, masking, deselection and real downloaded execution on ordinary React/Next sites; see [current verification](audits/DEFECTS_LANDING_2026-11-12.md).
