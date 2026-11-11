# Test generator product audit

Date: 2026-11-11. Review only; recommendations are not implementation approval.

## Scope and evidence

Audited the live authenticated report -> generated steps -> contextual editing -> expected checks -> code/export flow, at 1440x900 and 390x844. Used the existing connected signed-in browser. Screenshots were captured and opened during this audit; older verification artifacts were not substituted. Local interaction changes were discarded without saving. The export check used an already saved plan and observed only a GET to its private export endpoint; it did not run the downloaded test or write the report. No application code, provider setting, migration, package or original evidence changed.

The saved report was reread between checks; screenshots reflect the saved state at their capture time. Different action counts across captures do not mean this audit wrote a new action. All exported/screenshot artifacts remain local and ignored; no external uploads.

## Verdict

The engine has useful foundations, but the default product journey still exposes implementation details and stops too early. A verified controlled fixture is not evidence that ordinary SDK installations produce low-effort tests. Prior successful checks remain valid within their stated scope; they do not resolve these usability gaps.

## Captured journey

| Step | User task | Health | Evidence |
| --- | --- | --- | --- |
| 1 | Open generated steps | Understandable sequence, overloaded explanation/output rail; primary download below first viewport | [Entry](../../.playwright-mcp/test-page-audit-01-entry.png) |
| 2 | Correct one step | Native focus/keyboard dialog works; technical correction is manual and lacks Cancel/Undo | [Step editor](../../.playwright-mcp/test-page-audit-02-step-editor.png) |
| 3 | Recover and assess readiness | Unsaved refresh loses edits without warning; malformed CSS still marked ready | [Invalid selector](../../.playwright-mcp/test-page-audit-03-invalid-selector-ready.png) |
| 4 | Add an expected outcome | Supports multiple types; generic form asks for information already present in evidence | [Expected check](../../.playwright-mcp/test-page-audit-04-expected-result.png) |
| 5 | Download and continue | Download works; no useful in-product next-step guide/configuration | [After export](../../.playwright-mcp/test-page-audit-05-after-export.png) |
| 6 | Operate on mobile | No observed horizontal overflow; excessive scrolling and small secondary targets | [Mobile](../../.playwright-mcp/test-page-audit-06-mobile.png) |
| 7 | Inspect generated code | Actual deterministic code is visible; computed font is too small | [Code](../../.playwright-mcp/test-page-audit-07-code-preview.png) |

## Confirmed high-impact findings

### P1 - Unsaved work can disappear silently

Browser reproduction: change Step 1's safe value to a synthetic audit marker, close the editor, reload, reopen the plan. The marker is gone; no before-unload dialog was raised. Source confirms the draft is in component memory without a navigation guard or recovery mechanism. Persisted saves and failed-save draft retention are separate, working protections.

Recommendation: guard dirty navigation/reload, provide clear Save/Discard, and design privacy-conscious draft recovery. Do not quietly store potentially sensitive test values in browser storage. At minimum provide an explicit warning and recoverable editing within the current page.

### P1 - Green readiness overstates validation

Browser reproduction: change an included step's CSS locator to `[` and choose reproduction. The row still says Ready for reproduction, the heading says Reproduction ready, and Export reproduction remains enabled. This is a nonempty string check, not selector syntax/uniqueness or execution validation. The footer's disclaimer does not undo the stronger visual promise.

Recommendation: use precise states such as Draft, Needs review, Ready to generate and Not run. Validate what can actually be checked and identify the checks that require the target site. Do not claim a passing test from schema validation.

![Invalid selector marked ready](../../.playwright-mcp/test-page-audit-invalid-ready-viewport.png)

### P1 - Default SDK integration does not deliver the fixture's locator quality

Source-confirmed: privacy.locator accepts only data-testid values in privacy.testIds, whose default is empty. Other targets become unresolved tags. The generated onboarding snippet supplies projectId/applicationOrigin but no test-ID allowlist. The fixture opts into stable identifiers separately. Thus the normal minimal integration can record useful evidence but leave test actions unidentified; automatic generation looks easier in the fixture than the default integration supports.

Recommendation: make recording versus test-generation readiness explicit in onboarding and develop a privacy-reviewed stable locator strategy. Guided correction should show the recorded context and safe locator candidates. Do not solve this by broadly unmasking DOM text or copying arbitrary attributes.

### P1 - Post-export handoff is incomplete

Browser-confirmed: the download succeeds and status becomes Reproduction script downloaded. The output rail only says to configure baseURL and run it in the developer's project. It does not explain the file type, destination folder, required tooling, target URL, exact configuration or run command. No result is returned to the dashboard. The export was a real GET, not a simulated download.

Recommendation: provide a compact Run locally handoff with the selected output's meaning, target URL, example config, where to place the file and copyable commands. Explain .spec.ts as TypeScript test code. Offer a configuration/example bundle only if it removes a real setup step. Hosted execution is not required to fix this gap.

### P1 - Common navigation is not normalized into a clean reproduction

A fresh pure-engine diagnostic used a stable-ID click followed by a same-site push navigation. Generation produced the click plus a separate unsupported navigation action, blocking reproduction export. This diagnostic does not claim a new browser SPA recording. Source treats every non-initial navigation as unsupported; the UI has no navigation action type. Keyboard Enter-submit is also explicitly unsupported.

Recommendation: distinguish an observed navigation caused by a supported action from a standalone navigation operation. Preserve the evidence, avoid redundant blocking steps where causality is supported, and surface unsupported cases honestly. Do not blindly exclude every navigation event.

## Other functional and interaction gaps

- **Cancellation and undo:** step controls are Close/Done, both retaining live draft changes. Adding an action/check creates it before Done; Close is not Cancel. There is no general Undo or reset-to-saved/generated control. Exclusion/restore is useful but does not reverse values, order or locator edits. Provide explicit draft semantics and a modest undo/cancel design instead of a full version-history subsystem.
- **Meaningful regression checks:** source confirms no-page-errors checks only the reproduced action/check window. HTTP 500 can coexist with no uncaught exception. A response check listens before navigation and takes the first matching same-origin method/path, which can be an earlier background request. These documented limits are not automatic false-pass claims for this report; they are assertion-design risks. Guide the developer toward a visible completion condition and an outcome tied to the reported failure.
- **Evidence reuse:** adding a generic response check opens a blank path with POST/200 defaults even though the report has a recorded failed request. Suggestions are hidden once any assertion exists. Keep relevant evidence templates available, avoid presenting 200 as business truth, and require explicit confirmation.
- **Context while editing:** the modal obscures/interlocks the workbench, and replay lives in a separate tab. This legacy plan has no source timestamps, so the user cannot jump directly from its steps to evidence. A regeneration/reset path and recorded-context preview need design; never overwrite edited plans automatically or enable scripts/resources in replay.
- **Raw JSON:** retained correctly as an escape hatch, but it is too close to the main export choice and has no file-based import flow. A file-import feature is optional; the essential fix is to make JSON clearly secondary and distinguish portable draft data from an executable test.

## UI and accessibility findings

- **Primary action placement:** at 1440x900, the initial export button began near y=945. On the inspected 390x844 layout with three actions, it began near y=2422. The output rail spends substantial height on repeated descriptions, two mode explanations and multiple ready labels before the main action. Compress the rail and consider a bounded accessible action footer on small screens.
- **Reading order:** mobile visually puts Expected results before Export settings, while DOM order is Reproduction review, Export settings, Expected results. Keyboard/assistive reading can diverge from the visible sequence. Align semantic and visual ordering.
- **Code typography:** computed PRE font was 12px but nested CODE was 10.2px because the global .85em rule scales it again. Fix the inherited rule and verify code readability at actual sizes. This is a concrete CSS defect, not a request for a new visual theme.
- **Small secondary targets:** inspected row Edit buttons were about 19.2px tall. The main step row is also clickable and larger, which mitigates editing, but small extra controls still need comfortable hit areas. No blanket WCAG failure is asserted without checking applicable exceptions.
- **Repetition and hierarchy:** two ready badges, repeated Ready for reproduction lines, duplicated row/Edit targets and several limitations paragraphs compete with the actual sequence. Show contextual warnings once; make data and the next useful action dominant.
- **Technical wording:** test IDs, selector types, baseURL and JSON appear before the product has explained the developer's next task. Keep technical detail available in the contextual editor and local-run guide, not as the primary language of the journey.
- **Expected result footprint:** a large optional section remains visible for reproduction-only use. Progressive disclosure can reduce scrolling without hiding regression capability.

## Preserve

Keep deterministic generation, immutable evidence, private ownership checks, optimistic revisions, reversible inclusion, masked-value review, native keyboard/Escape/focus behavior, real downloads and the current visual identity. Do not rebuild the backend, add an LLM, introduce hosted browsers or restart Figma exploration to address these findings.

## Proposed implementation order - not approved by this audit

1. Trust and recovery: dirty-state protection, explicit cancel/undo semantics, accurate readiness, guided local-run/download handoff.
2. Core generation usability: privacy-reviewed selector/onboarding strategy, recorded context, navigation normalization and meaningful outcome templates/completion checks.
3. Composition/accessibility: compact action area, consistent mobile DOM order, code typography and secondary control sizes. Verify the actual task again using both the configured fixture and a minimal integration without special test-ID opt-ins.

## Limits

This audit did not change or execute the user's exported test against the website, run a screen reader, certify accessibility, test real phones/Safari/Firefox or rerun the entire test suite. A standalone engine diagnostic confirmed the navigation behavior; SDK defaults and assertion timing were inspected in source. Existing controlled fail/pass proof remains historical evidence and is not an end-to-end ease-of-use assessment. All temporary audit edits were discarded without PUT requests. Recommendations above require discussion/approval before implementation.
