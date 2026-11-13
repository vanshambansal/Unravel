# Browser recording SDK

Updated 2026-11-12. Local workspace implementation, not a published package. Recording, explicit submission and persistence are implemented. Playback uses the user-approved isolated local host; run/check details are in REPORTS.md and actual outcomes in PROJECT_STATUS.md. Deterministic plan editing/export is described in TEST_PLANS.md.

## Run and inspect

### Complete reporting widget (preferred integration)

`mountWidget({ projectId, applicationOrigin, privacy?, limits? })` mounts the complete SDK-owned launcher, explicit recording controls, description form, submit/retry and success flow. It returns `open()`, `close()` and idempotent `destroy()`. Mount once inside a browser lifecycle; imports are SSR-safe. React and Next.js need only a client effect:

```tsx
'use client';
import { useEffect } from 'react';
import { mountWidget } from '@unravel/sdk';

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

For an external local application, run `corepack pnpm sdk:pack` in this repository, then `pnpm add /absolute/path/to/.cache/sdk-distribution/unravel-sdk-0.1.0.tgz` in the target project. This is not registry publication. Runtime contracts and recorder code are bundled; declarations carry a generated local contracts copy, with the existing Zod version as their only package dependency. The external tarball install, declaration check, SSR import and browser bundle were exercised in a disposable consumer directory. Distribution/licensing review still applies before public publication.

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
import { initialize, type Recorder } from '@unravel/sdk';

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

- `initialize(options)` installs no instrumentation and captures no events. It validates configuration and identifies sensitive elements so revealing an existing password field cannot make it recordable.
- `start()` returns a promise. Recording begins after the recorder engine is ready, with a snapshot of the page's **current** state. Explicitly allowlisted data already present at that time may appear. Repeated Start during startup/recording is idempotent. Only one active Unravel instance is allowed per page.
- `stop()` restores owned instrumentation and returns the finished recording, or null if initialization was cancelled before capture. `getRecording()` returns a fresh validated copy only after stop. A subsequent Start replaces the previous recording.
- `getStatus()` returns state, relative duration, event count, approximate active bytes and stop reason. State callbacks fire on transitions, not every event, to avoid feedback loops.
- `destroy()` is idempotent, cancels pending initialization, restores listeners/wrappers and discards data. A destroyed instance cannot restart. Pending host requests still resolve/reject normally; their late results cannot enter a stopped recording.

The development-only http://localhost:3000/sdk-lab exercises the real package in a Next.js client component. It returns 404 in normal production. The plain React Strict Mode harness is built only for the SDK test server; it is not an application route or SDK dependency.

## Approved privacy policy

Sanitization occurs before data is stored in the recording. Defaults mask page text and input values; block scripts, passwords/hidden/payment/one-time-code fields, iframes, canvas and media; discard error messages/stacks, CSS bodies, plugins and unsupported event sources. Network capture records method, origin, status, timing and outcome only: no headers, bodies, cookies, query strings or fragments. The same-origin root path / is retained; other paths are null unless exactly allowlisted for the same origin. HTTP 500 is an HTTP failure, not an uncaught JavaScript exception.

The replay sanitizer reconstructs allowed fields instead of retaining arbitrary raw attributes. IDs, classes, arbitrary data/ARIA attributes, image URLs and resource URLs are omitted. Raw inline styles are replaced with the bounded computed-presentation representation described below. The SDK can retain explicitly allowlisted same-origin stylesheet paths without queries/fragments, but current ingestion strips those references and the isolated player blocks original resources. **This deliberately limits visual fidelity**; it is not general pixel-perfect replay. Dynamic CSS, images, cross-origin iframes, canvas, full reload continuity, file controls and custom-widget semantics are unsupported initially. Shadow-root hosts/subtrees are omitted as inert placeholders; no Shadow DOM fidelity is promised. This also avoids rejected snapshots from Next.js route announcers/development portals. Server rejection of unsupported Shadow DOM remains unchanged.

Synthetic fixture opt-ins use `privacy.allowTextSelectors`, `allowValueSelectors`, `testIds`, exact `paths`, `stylesheetPaths`, and exact `errorMessages`. These are explicit trust decisions, not automatic safe-content detection. Do not broadly allow an application root or arbitrary user content. Password blocking takes precedence over opt-ins. Use `data-unravel-block` on SDK UI and sensitive sections. Stable allowlisted `data-testid` values take precedence. Other supported light-DOM controls receive bounded tag/ordinal CSS paths, without collecting labels, names, IDs, classes or text. Paths are at most 20 levels/500 characters and ordinals at most 9999; unsupported structures stay unresolved. Markup changes can invalidate these paths. The semantic contract accepts this additive locator variant under recording version 1; legacy recordings remain readable. Fresh capture is needed to obtain missing old identifiers.

## Contracts and provisional guardrails

`@unravel/contracts` owns version 1 schemas and types. The result contains a recording UUID, public project UUID, start/duration metadata, sanitized initial origin/path, rrweb envelopes and timestamped semantic events. The replay timestamps use epoch milliseconds; semantic `at` values are milliseconds relative to recording start. Filtering counts are explicit.

Defaults are 120 seconds, 5,000,000 serialized bytes and 5,000 total replay/semantic events. They are configurable provisional guardrails, not measured product budgets. A limit visibly stops recording with `truncated: true` and a specific stop reason. `hasFullSnapshot: false` means the result cannot supply a complete replay and ingestion rejects it. The byte cap bounds the stored result, not transient rrweb snapshot allocation or all browser memory. Submission separately caps the complete request at 5,000,000 bytes, including report details; see REPORTS.md.

Fetch/XHR wrappers restore only functions they still own, preserving wrappers installed later by another library. Requests retain their response/error behavior; fetch instrumentation returns a chained promise rather than promising native promise identity. Host-library coexistence beyond the tested cases remains a compatibility risk.

## Verification and measurement

Commands are centralized in [README.md](../README.md); actual outcomes and measurements live in [PROJECT_STATUS.md](PROJECT_STATUS.md). `test:sdk` builds a plain React harness and starts isolated fixture (4183) and Next.js (3013) test servers. Ports must be free; stop any other apps/web development process first because Next.js permits one dev instance per app directory. It uses synthetic data without Clerk/Neon access. No retries or auth traces.

`sdk:measure` reports raw/gzip build output sizes and checks metadata for playback implementations; build metadata and bundle measurements are generated/ignored. The browser suite attaches controlled interaction/recording measurements and saves the last sample to .cache/sdk-recording-measurement.json. The command prints that timestamped sample when present; it does not silently rerun the browser. One synthetic burst is not evidence of sustained low overhead on arbitrary websites or real phones. Separate report tests verify playback in the controlled fixture; public-ingestion security and a broader compatibility matrix remain later work.


## Styled replay presentation v1

New recordings include `presentation: 1`. The recorder captures a closed vocabulary of computed layout/color/border/type values as bounded inline styles. It never copies arbitrary stylesheet bodies, selectors, custom properties, pseudo-content, CSS URLs, images or font resources. The server validates the same grammar independently. Default text/value masking, blocked passwords/widget descendants and network exclusions remain unchanged. The synthetic fixture explicitly permits its static headings/notice in addition to its synthetic form content; no SDK-wide text opt-in changed.

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
