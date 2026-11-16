# Manual SDK test websites

- Next.js: http://localhost:4200 (your project ID and manually copied reporter retained).
- React: http://localhost:4201 (your manually copied reporter and project ID retained; current SDK installed).
- Unravel: http://localhost:3000/app; isolated replay support127.0.0.1:4192.

## Current two-mode widget

Both demos use the same standalone SDK with the approved recording modes. Refresh4200 or4201, open Report a bug, and choose before Start:

- **Mask entered values** (default): readable webpage; field values masked.
- **Full-content recording**: entered and sensitive field values included.

Both show ordinary page text, even if it echoes an entered name/value. No automatic private-text inference and no safe-text markers needed. SDK UI, developer-blocked sections, hidden inputs and unsupported resources are excluded. Mode is fixed for that recording. Review identifies the mode; Done/discard resets the next recording to masked. Existing redacted reports cannot be recovered. No new report has been submitted automatically.

## Scenarios

Use synthetic text. Record the HTTP500 form, task search/status filters, completion toggles, tabs, modal, accordion, notification and clipped live-heading preview. The preview deliberately clips a long heading: it should grow after a future fix. Its echoed input text is visible in both modes; the input field value itself follows the selected mode. The account panel uses data-unravel-block and stays excluded. Optional JS error may trigger Next's development overlay.

Stop, title and submit yourself; inspect the report/replay and refresh/reopen it. The form's intended correct result is “Your question was submitted successfully.” Developers still supply expected test assertions.

## React integration and local updates

The approved package name is `@vansham/unravel-sdk`. Version 0.1.0 is published on npm; use the registry package. Keep independent installs outside the workspace with `--ignore-workspace` so demo dependencies do not enter the root lockfile. The existing reporter project IDs/application origins are preserved.

The React reporter is mounted once in src/main.tsx. Its user-configured project ID and applicationOrigin remain in src/UnravelReporter.tsx. For a new installation, register http://localhost:4201 in its own Unravel project and use its SDK setup. From examples/sdk-react install:

```powershell
corepack pnpm add @vansham/unravel-sdk@0.1.0 --save-exact --ignore-workspace
```

Copy the generated component into src/UnravelReporter.tsx; import/mount it once in src/main.tsx alongside QuestionDesk. applicationOrigin is the dashboard origin copied from setup (the current React integration uses http://localhost:3033), not the demo origin. React rebuilds after source edits but needs a browser refresh. No API key is required.

The same npm installation command works from examples/sdk-next. For Next integration mount the copied client component once in app/layout.tsx or app/page.tsx, never both. Your current user-created mount is in app/page.tsx. Existing marker attributes are harmless but no longer required by the widget.

## Restart

Run corepack pnpm dev from each example directory (Next4200/React4201). For unpublished local SDK development, changes require corepack pnpm sdk:pack at repository root and reinstalling its printed **immutable, hash-suffixed artifact** in both consumers. Use the new printed path after each pack; the command above instead installs the published npm version. This avoids pnpm reusing an older archive at the same version/path and does not require reinstalling every dependency with --force. Rebuild/restart the demo and refresh the browser. React can be rebuilt with corepack pnpm build in examples/sdk-react.

React currently submits to http://localhost:3033. That dashboard and its paired http://127.0.0.1:4195 replay host must be running. A stopped service causes network delivery failure regardless of the SDK mode. Current production-preview commands/build ownership belong to PROJECT_STATUS.md. Development3000 uses separate replay4192; root corepack pnpm dev now starts/checks that player automatically. When Next is launched with an app-only command, run replay:dev separately.

Current verification and limits belong to [the SDK readiness audit](../docs/audits/SDK_READINESS_2026-11-15.md). Both React modes were actually submitted and inspected in saved reports; both Next modes passed independent package/browser recording checks. Use the latest reports titled SDK verified native state for the final native-modal fix. Old redacted recordings cannot be reconstructed. Diagnostics are readable in both modes; network bodies, headers, cookies and URL queries/fragments remain excluded. Public release is still gated separately.
