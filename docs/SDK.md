# Browser recording SDK

Updated 2026-11-16. Published MIT package: `@vansham/unravel-sdk@0.1.0`. Public application hosting remains pending. Recording, explicit submission and persistence are implemented. Playback uses the user-approved isolated local host; run/check details are in REPORTS.md and actual outcomes in PROJECT_STATUS.md. Deterministic plan editing/export is described in TEST_PLANS.md. The owner selected MIT; package notices and release gates live in packages/sdk and RELEASE_CHECKLIST.md.

## Run and inspect

### Registry installation

Run `npm install @vansham/unravel-sdk@0.1.0` inside your website project. A running Unravel service and its registered public project ID are required; npm installation does not host the dashboard or replay service.

### Complete reporting widget (preferred integration)

`mountWidget({ projectId, applicationOrigin, privacy?, limits? })` mounts the complete SDK-owned launcher, explicit recording controls, description form, submit/retry and success flow. It returns `open()`, `close()` and idempotent `destroy()`. Mount once inside a browser lifecycle; imports are SSR-safe. React and Next.js need only a client effect:

```tsx
'use client';
import { useEffect } from 'react';
import { mountWidget } from '@vansham/unravel-sdk';

export function UnravelReporter() {
  useEffect(() => {
    const widget = mountWidget({
      projectId: 'YOUR_PUBLIC_PROJECT_ID',
      applicationOrigin: 'http://localhost:3000',
    });
    return () => widget.destroy();
  }, []);
  return null;
}
```

Mount `<UnravelReporter />` once near the application root. Use the actual Unravel HTTP(S) origin, not the website being recorded. Project setup supplies the current origin from the browser rather than assuming HTTP. No visitor account or custom controls/forms are required. The low-level recorder API below remains available for custom integrations and tests.

The widget uses its own Shadow DOM styles and system/available Inter font stack, with no React runtime, external font request or component-library dependency. Its blocked host and shadow descendants are excluded from capture. Initialization captures nothing. Minimize/Escape preserves capture and shows a Stop dock; Stop freezes capture, while closing a description preserves its draft. Discard requires confirmation. Retry keeps the first attempted report unchanged, even if its response was lost. Done resets the local widget; saved reports remain on the server. Destroy clears local state/owned resources and can abort upload, but cannot undo an already committed server request. Reduced motion disables entry/pulse animation. Narrow/short viewports constrain the panel and allow internal scrolling. Only one widget may be mounted per page.

For an external local application, run `corepack pnpm sdk:pack` in this repository, then install the hash-suffixed archive path printed by that command in the target project. This is not registry publication. Runtime contracts and recorder code are bundled; declarations carry a generated local contracts copy, with the existing Zod version as their only package dependency. Use `pnpm sdk:check` to inspect required files, notices, portable declarations and lazy chunks. The published release is verified independently from these local development archives.

Local updates now also print a hash-suffixed immutable artifact from `sdk:pack`. Install that printed path in each consumer instead of replacing the same tarball name; this avoids pnpm silently retaining stale installed contents. Rebuild/restart the consumer and refresh its browser. The fixed-name archive remains available for compatibility. This is local distribution, not registry publication.

### Independent registry verification

Run `node scripts/prepare-sdk-consumer.mjs --registry`, then `npm install --ignore-scripts --registry=https://registry.npmjs.org` in `.cache/sdk-registry-consumer`. Set `STANDARD_PACKED_CONSUMER=true`, `STANDARD_SDK_REGISTRY=true` and `REPORTS_BASE_URL` to a running local production preview before running `pnpm test:standard`. Both React and Next.js resolve the installed registry package without workspace SDK aliases. The registry lockfile must resolve the SDK from registry.npmjs.org.

### Independent packed-package verification

`pnpm sdk:consumer:prepare` creates a disposable `.cache/sdk-release-consumer` from the current immutable archive and ordinary fixture sources. Run `npm install --ignore-scripts` inside that directory. It installs pinned React/Next.js and the SDK archive using normal package resolution; no workspace SDK alias is used.

In a root PowerShell terminal, set `$env:STANDARD_PACKED_CONSUMER='true'`, set `$env:REPORTS_BASE_URL` to an already-running production preview, then run `pnpm test:standard`. The suite starts its own fixture/player services; their configured ports must be free. It uses existing synthetic Clerk identities and real test-owned reports. It verifies integration and actual downloaded reproduction/regression files against controlled buggy/fixed applications. It is not registry publication or arbitrary-site certification. Reports remain labelled synthetic evidence; do not delete unrelated reports during cleanup.

Run preparation only in the disposable consumer directory intended by the script; it updates that generated fixture's package/configuration files, not the user's manual examples. See PROJECT_STATUS.md for actual results and intermediate failures.

### Independent fixture

From the repository root, install the pinned workspace dependencies, then:

```powershell
corepack pnpm build:packages
node fixtures/test-site/server.mjs
```

Configure the independent fixture once as its developer in `fixtures/test-site/.env.local`: public `UNRAVEL_PROJECT_ID`, `UNRAVEL_APPLICATION_ORIGIN`, and `FIXTURE_PORT`. The server loads this file; restart after changing it. Register the exact printed website origin. Opening the bare URL now mounts the real widget automatically, with no visitor setup form. Real integrations supply the same public values in code. See [fixture setup](../fixtures/test-site/README.md). Use synthetic content: Report a bug -> Start -> reproduce -> Stop -> title/optional Add details -> Send. No upload occurs until explicit Send.

The legacy controls and `window.fixtureRecorder` are available only with `?debug=1` when the fixture server explicitly enables `FIXTURE_ALLOW_TEST_CONFIG=1`, for low-level recorder tests. They are not the visitor UI. Saved reports persist until owner deletion; local Discard/reload does not delete them. Run `corepack pnpm replay:dev` for isolated masked replay. The fixture's HTTP 500 remains intentional; see REPORTS.md.

`initialize({ projectId, submissionUrl, onSubmissionChange })` enables `recorder.submit({ title, description? })` after Stop. `getSubmissionStatus()` reports idle/submitting/submitted/error. Retries use exactly the same frozen recording/details and return the same report identifier; changed details after an attempt require a new recording. No automatic retry or background upload. Destroy aborts pending upload and clears local state, but cannot undo a request already committed by the server. A lost response may already represent a saved report; retry unchanged details. The 5 MB cap applies to the complete request, including description/envelope, so an almost-full recording may need a shorter retry recording.

The fixture consumes the standalone `unravel.global.js` build. The package also exports ESM and TypeScript declarations. No React, Next.js or playback runtime is part of the SDK. The ESM recorder engine loads lazily on Start. Packages remain local; a complete third-party notice/distribution review is required before publishing the SDK.

## API and React / Next.js lifecycle

Importing on the server is safe; initializing requires a browser effect. The public project UUID identifies the website and is not an authentication secret. Current ingestion checks its registered origin; CORS is not authentication.

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { initialize, type Recorder } from '@vansham/unravel-sdk';

export function RecordingControls({ projectId }: { projectId: string }) {
  const recorder = useRef<Recorder | null>(null);
  const [status, setStatus] = useState('idle');
  useEffect(() => {
    const instance = initialize({
      projectId,
      onStateChange: value => setStatus(`${value.state}: ${value.reason ?? ''}`),
    });
    recorder.current = instance;
    return () => { recorder.current = null; instance.destroy(); };
  }, [projectId]);
  return <div data-unravel-block>
    <button onClick={() => void recorder.current?.start().catch(() => setStatus('Could not start'))}>Start recording</button>
    <button onClick={() => { recorder.current?.stop(); }}>Stop recording</button>
    <p role="status">{status}</p>
  </div>;
}
```

- `initialize(options)` installs no instrumentation and captures no events. It validates configuration and identifies excluded sections for the configured policy. Password blocking in the legacy API differs from the approved explicit visitor modes below.
- `start()` returns a promise. Recording begins after the recorder engine is ready, with a snapshot of the page's **current** state. Explicitly allowlisted data already present at that time may appear. Repeated Start during startup/recording is idempotent. Only one active Unravel instance is allowed per page.
- `stop()` restores owned instrumentation and returns the finished recording, or null if initialization was cancelled before capture. `getRecording()` returns a fresh validated copy only after stop. A subsequent Start replaces the previous recording.
- `getStatus()` returns state, relative duration, event count, approximate active bytes and stop reason. State callbacks fire on transitions, not every event, to avoid feedback loops.
- `destroy()` is idempotent, cancels pending initialization, restores listeners/wrappers and discards data. A destroyed instance cannot restart. Pending host requests still resolve/reject normally; their late results cannot enter a stopped recording.

The development-only http://localhost:3000/sdk-lab exercises the real package in a Next.js client component. It returns 404 in normal production. The plain React Strict Mode harness is built only for the SDK test server; it is not an application route or SDK dependency.

## Approved privacy policy

Updated2026-11-14 after explicit user agreement. The reporting widget presents two choices before Start:

- **Mask entered values** (default): normal page text and layout are visible; field values are masked. Names or typed values echoed into ordinary page text remain visible. No automatic private-text detection is attempted.
- **Full-content recording**: entered and sensitive field values (including password/payment inputs where capturable) are included after the visitor explicitly selects this mode. A visible warning appears before Start and during recording/review. Selection is frozen for that recording; Done/discard resets the next recording to masking.

Both modes exclude SDK UI, developer-marked `data-unravel-block` subtrees, hidden inputs and unsupported active resources. Masked mode retains the geometry of visible sensitive controls instead of removing them. This is DOM replay within the existing bounded presentation subset, not video or arbitrary cross-origin/canvas capture. Both visitor modes include bounded error messages and URL paths (including request, navigation and error-file paths), following the user's 2026-11-15 clarification. Diagnostic messages and paths may themselves contain user text. Network capture remains metadata-only: no headers, bodies, cookies, query strings or fragments. The legacy low-level API without an explicit mode still requires its path/message opt-ins.

The low-level `initialize` API can select the same policy with `privacy.mode: 'masked-values' | 'full'`. Omitting mode retains its legacy selector-based masking for backwards compatibility; widget consumers do not need selectors or safe-text markers. The widget always uses its visitor-selected mode. Mode selection is client consent UX, not cryptographic proof from an untrusted uploader.

New recordings carry optional `captureMode` metadata. Legacy reports without it remain supported. The server retains password snapshot values only when mode is explicitlyfull; hidden input values remain stripped. All replay script/resource isolation, validation caps and active-attribute rejection remain in force. Storage uses the existing recording JSON metadata, without a schema migration. Existing evidence remains immutable and redacted content cannot be recovered.

Normal text includes potentially private information already rendered by the website, an explicit user-accepted tradeoff. Developers can exclude an entire section with `data-unravel-block`. Full-content capture does not override that exclusion or turn on hidden/browser/network data collection.

Legacy low-level selector options (`allowTextSelectors`, `allowValueSelectors`, `testIds`, `paths`, `stylesheetPaths`, `errorMessages`) remain available. The previous static-marker onboarding is superseded for widget integration. A new recording with the updated package is required.

## Contracts and provisional guardrails

`@unravel/contracts` owns version 1 schemas and types. The result contains a recording UUID, public project UUID, start/duration metadata, sanitized initial origin/path, rrweb envelopes and timestamped semantic events. The replay timestamps use epoch milliseconds; semantic `at` values are milliseconds relative to recording start. Filtering counts are explicit.

Defaults are 120 seconds, 5,000,000 serialized bytes and 5,000 total replay/semantic events. They are configurable provisional guardrails, not measured product budgets. A limit visibly stops recording with `truncated: true` and a specific stop reason. `hasFullSnapshot: false` means the result cannot supply a complete replay and ingestion rejects it. The byte cap bounds the stored result, not transient rrweb snapshot allocation or all browser memory. Submission separately caps the complete request at 5,000,000 bytes, including report details; see REPORTS.md.

Fetch/XHR wrappers restore only functions they still own, preserving wrappers installed later by another library. Requests retain their response/error behavior; fetch instrumentation returns a chained promise rather than promising native promise identity. Host-library coexistence beyond the tested cases remains a compatibility risk.

## Verification and measurement

Commands are centralized in [README.md](../README.md); actual outcomes and measurements live in [PROJECT_STATUS.md](PROJECT_STATUS.md). `test:sdk` builds a plain React harness and starts isolated fixture (4183) and Next.js (3013) test servers. Ports must be free; stop any other apps/web development process first because Next.js permits one dev instance per app directory. It uses synthetic data without Clerk/Neon access. No retries or auth traces.

`sdk:measure` reports raw/gzip build output sizes and checks metadata for playback implementations; build metadata and bundle measurements are generated/ignored. The browser suite attaches controlled interaction/recording measurements and saves the last sample to .cache/sdk-recording-measurement.json. The command prints that timestamped sample when present; it does not silently rerun the browser. One synthetic burst is not evidence of sustained low overhead on arbitrary websites or real phones. Separate report tests verify playback in the controlled fixture; public-ingestion security and a broader compatibility matrix remain later work.


## Styled replay presentation v1

New recordings include `presentation: 1`. The recorder captures a closed vocabulary of computed layout/color/border/type values as bounded inline styles. It never copies arbitrary stylesheet bodies, selectors, custom properties, pseudo-content, CSS URLs, images or font resources. The server validates the same grammar independently. The approved visitor modes above own current text/value policy; legacy low-level selector rules remain supported. Native details/dialog open state and rrweb's modal/non-modal marker are preserved as bounded inert attributes. Open is serialized as an empty string for rrweb compatibility. Typed OM preserves auto/percentage width and height where available, avoiding initially frozen auto-growing containers; browsers without it retain resolved sizing. This remains a bounded reconstruction, not arbitrary-site visual equivalence.

This is bounded styled replay, not pixel-perfect browser reconstruction. System fonts replace original font families. Initial layout, directly mutated elements and inserted nodes are supported; stylesheet-only theme changes, descendant cascade changes and responsive reflow across a recorded resize are not comprehensively reconstructed. CSS adds payload/CPU cost; limits remain provisional. Old recordings lack presentation and are shown as legacy structural replay; record again to get styling. See PROJECT_STATUS.md for measurements/checks.

## Compact movable presentation

The default panel is 376px wide on desktop, bounded to the visual viewport on smaller screens; optional description starts collapsed and reopens with entered text. Drag the launcher, minimized timer or panel header/grip. Keyboard: focus launcher/grip, use arrows to move (Shift = larger steps), Home to reset; the panel also has Reset position. Inputs and buttons keep their normal interactions. A drag never starts recording or opens the panel accidentally.

Position is a per-project normalized coordinate in the host website's session storage, not report/recording storage. Storage denial falls back to in-memory placement. Position clamps across view/state/viewport changes, with visual-viewport handling for keyboard/zoom changes. Recordings/drafts remain in memory; closing/minimizing preserves them, reloading does not. Listeners, capture, observers and animations are owned by the widget lifecycle. Real-phone keyboard behavior still requires device testing. Public API signatures and privacy/capture policy are unchanged.

## Release preparation and interaction reliability

Submission attempts have a 30-second deadline; timeout preserves the frozen recording/details for explicit identical retry. Server rate/storage limits may reject new submissions; the widget explains that the recording remains local and the developer may need to free capacity. No automatic retry or browser persistence of report content is introduced.

Touch drag handles activate a completed non-drag button tap on pointer-up and suppress a delayed duplicate compatibility click. This addresses an observed Chromium sequence with pointer-up but no native click after dragging. It applies to opening/moving controls, not recording or submission buttons. Real phone/software-keyboard behavior still needs verification. Firefox checks exclude Chromium CDP touch injection explicitly. See PROJECT_STATUS.md for current outcomes and DEPLOYMENT.md for public release gates.

## Ordinary controls - 2026-11-12 correction

Semantic capture resolves an SVG child click to its safe containing HTML control, while SVG remains excluded from replay. Private ancestors and formerly blocked subtrees remain blocked. No SVG content or paths are collected for identification.

Native multiple selects use optional `values` in recording-v1 select events: missing means the legacy scalar selection; null means masked multiple values; an array means safe selected values; [] means deliberate deselection. Scalar `value` stays null when `values` is present. Opt-in must cover selected options too. Standard rrweb selected-attribute mutations preserve multiple-selection replay state without enabling additional resources. Existing scalar recordings remain readable; older servers reject the new strict field rather than silently executing one option. Upgrade local SDK/server together.

Actual Chromium/Firefox capture/privacy checks and independent React/Next export execution are recorded in [the completion verification](audits/DEFECTS_LANDING_2026-11-12.md).

Stopping a minimized recording with a usable full snapshot opens the details/submission form immediately. This transition keeps capture stopped and submission explicit. The same behavior applies when a recording reaches its configured limit.

## Earlier static-marker onboarding

Superseded by the visitor-selected widget modes above. Existing recordings made with those settings remain unchanged.

## Action names and replay timing (2026-11-14)

Explicit visitor modes add optional action targetLabel from associated labels, aria-labels or ordinary button/link text, never control values. Legacy mode does not add this text. Selectors remain unchanged. rrweb input sampling records every input update at event time; limits still apply. Masking modifies emitted recording data, not the live DOM or field value. Browser regression checks verify live value/geometry and captured timing; current results belong to PROJECT_STATUS.md.

Development replay availability: root pnpm dev now starts/checks the separate4192 player alongside Next3000. When using an app-only Next command instead, replay:dev remains the manual player command. Recording SDK code is independent of this dashboard/player process lifecycle. An unavailable player affects viewing reports from every framework, not their stored recording data.
