# Manual SDK test websites

- Next.js: http://localhost:4200 (your project ID and manually copied reporter retained).
- React: http://localhost:4201 (no SDK installed/mounted; integrate manually when ready).
- Unravel: http://localhost:3000/app; isolated replay support127.0.0.1:4192.

## Current two-mode widget

The Next SDK has been repacked/reinstalled with the approved recording modes. Refresh4200, open Report a bug, and choose before Start:

- **Mask entered values** (default): readable webpage; field values masked.
- **Full-content recording**: entered and sensitive field values included.

Both show ordinary page text, even if it echoes an entered name/value. No automatic private-text inference and no safe-text markers needed. SDK UI, developer-blocked sections, hidden inputs and unsupported resources are excluded. Mode is fixed for that recording. Review identifies the mode; Done/discard resets the next recording to masked. Existing redacted reports cannot be recovered. No new report has been submitted automatically.

## Scenarios

Use synthetic text. Record the HTTP500 form, task search/status filters, completion toggles, tabs, modal, accordion, notification and clipped live-heading preview. The preview deliberately clips a long heading: it should grow after a future fix. Its echoed input text is visible in both modes; the input field value itself follows the selected mode. The account panel uses data-unravel-block and stays excluded. Optional JS error may trigger Next's development overlay.

Stop, title and submit yourself; inspect the report/replay and refresh/reopen it. The form's intended correct result is “Your question was submitted successfully.” Developers still supply expected test assertions.

## Integrate React manually

Register http://localhost:4201 in its own Unravel project and use its SDK setup. From examples/sdk-react install:

```powershell
corepack pnpm add D:/documents/Unravel/.cache/sdk-distribution/unravel-sdk-0.1.0.tgz --ignore-workspace --store-dir D:/.pnpm-store
```

Copy the generated component into src/UnravelReporter.tsx; import/mount it once in src/main.tsx alongside QuestionDesk. applicationOrigin is http://localhost:3000 (dashboard), not the demo origin. React rebuilds after source edits but needs a browser refresh. No API key is required.

For future Next integration mount the copied client component once in app/layout.tsx or app/page.tsx, never both. Your current user-created mount is in app/page.tsx. Existing marker attributes are harmless but no longer required by the widget.

## Restart

Run corepack pnpm dev from each example directory (Next4200/React4201). SDK changes require corepack pnpm sdk:pack at repository root and reinstalling that tarball in the consumer. Same local version does not update an already installed copy automatically. The existing replay process can be started at repo root with node scripts/replay-host.mjs.

Verified29 SDK browser tests and47 unit tests; packed Next desktop/mobile mode picker and recording/review/discard checked. Actual new-report submission is left for your manual acceptance.
