# Browser recording SDK

Milestone 3, 2026-11-10. Local workspace implementation, not a published package. No report upload, persistence, replay player, or generated tests yet.

## Run and inspect

From the repository root, install the pinned workspace dependencies, then:

```powershell
corepack pnpm build:packages
node fixtures/test-site/server.mjs
```

Open http://127.0.0.1:4173. Use synthetic content. Start recording explicitly, reproduce the failed question submission, optionally trigger the separate JavaScript error, and stop. The status shows counts, bytes and the stop reason. In browser developer tools, `window.fixtureRecorder.getRecording()` returns a defensive copy of the sanitized result. Discard destroys it; reload loses it. Nothing is uploaded or written to storage.

The fixture consumes the standalone `unravel.global.js` build. The package also exports ESM and TypeScript declarations. No React, Next.js or playback runtime is part of the SDK. The ESM recorder engine loads lazily on Start. Packages remain local; a complete third-party notice/distribution review is required before publishing the SDK.

## API and React / Next.js lifecycle

Importing on the server is safe; initializing requires a browser effect. The public project UUID identifies the website and is not an authentication secret. Registration/origin authorization will be checked by the future ingestion service.

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

Sanitization occurs before data is stored in the recording. Defaults mask page text and input values; block scripts, passwords/hidden/payment/one-time-code fields, iframes, canvas and media; discard error messages/stacks, CSS bodies, plugins and unsupported event sources. Network capture records method, origin, status, timing and outcome only: no headers, bodies, cookies, query strings or fragments. Paths are null unless exactly allowlisted for the same origin. HTTP 500 is an HTTP failure, not an uncaught JavaScript exception.

The replay sanitizer reconstructs allowed fields instead of retaining arbitrary raw attributes. IDs, classes, inline styles, arbitrary data/ARIA attributes, image URLs and resource URLs are omitted. Only explicitly allowlisted same-origin stylesheet paths can be retained, without queries/fragments. **This deliberately limits visual fidelity**; it is not general pixel-perfect replay. Loading a permitted stylesheet during future replay can make a request to that original website and must remain subject to replay sandbox/resource policy. Dynamic CSS, images, cross-origin iframes, canvas, full reload continuity, file controls and custom-widget semantics are unsupported initially. Shadow-DOM privacy/fidelity and other browsers need further validation; they are not certified safe by the current light-DOM fixture tests.

Synthetic fixture opt-ins use `privacy.allowTextSelectors`, `allowValueSelectors`, `testIds`, exact `paths`, `stylesheetPaths`, and exact `errorMessages`. These are explicit trust decisions, not automatic safe-content detection. Do not broadly allow an application root or arbitrary user content. Password blocking takes precedence over opt-ins. Use `data-unravel-block` on SDK UI and sensitive sections. Stable allowlisted `data-testid` values yield structured locators; other targets are explicitly unresolved and cannot yet support validated export.

## Contracts and provisional guardrails

`@unravel/contracts` owns version 1 schemas and types. The result contains a recording UUID, public project UUID, start/duration metadata, sanitized initial origin/path, rrweb envelopes and timestamped semantic events. The replay timestamps use epoch milliseconds; semantic `at` values are milliseconds relative to recording start. Filtering counts are explicit.

Defaults are 120 seconds, 5,000,000 serialized bytes and 5,000 total replay/semantic events. They are configurable provisional guardrails, not measured product budgets. A limit visibly stops recording with `truncated: true` and a specific stop reason. `hasFullSnapshot: false` means the result cannot supply a complete replay; never silently treat it as replay-ready. The byte cap bounds the stored result, not transient rrweb snapshot allocation or all browser memory. No upload limit is selected here.

Fetch/XHR wrappers restore only functions they still own, preserving wrappers installed later by another library. Requests retain their response/error behavior; fetch instrumentation returns a chained promise rather than promising native promise identity. Host-library coexistence beyond the tested cases remains a compatibility risk.

## Verification and measurement

Commands are centralized in [README.md](../README.md); actual outcomes and measurements live in [PROJECT_STATUS.md](PROJECT_STATUS.md). `test:sdk` builds a plain React harness and starts isolated fixture (4183) and Next.js (3013) test servers. Ports must be free; stop any other apps/web development process first because Next.js permits one dev instance per app directory. It uses synthetic data without Clerk/Neon access. No retries or auth traces.

`sdk:measure` reports raw/gzip build output sizes and checks metadata for playback implementations; build metadata and bundle measurements are generated/ignored. The browser suite attaches controlled interaction/recording measurements and saves the last sample to .cache/sdk-recording-measurement.json. The measurement command prints that timestamped sample when present; it does not silently rerun the browser. One synthetic burst is not evidence of sustained low overhead on arbitrary websites or real phones. Replay playback, public-ingestion security and a broader compatibility matrix remain later work.
