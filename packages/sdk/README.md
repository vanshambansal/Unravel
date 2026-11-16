# Unravel browser SDK

A framework-independent reporting widget with explicit recording, DOM replay evidence, semantic actions, JavaScript errors and fetch/XHR metadata. React and Next.js use the same package.

**Release status:** published on npm as `@vansham/unravel-sdk@0.1.0` under MIT. A running Unravel service is required. The hosted portfolio currently accepts signed-in in-app demos only; general anonymous intake stays disabled. Independent npm consumers can use their own configured Unravel service.

## Installation

In your website project:

```sh
npm install @vansham/unravel-sdk@0.1.0
```

For SDK development, `corepack pnpm sdk:pack` in the Unravel repository also creates a hash-suffixed archive that can be installed by its printed path.

Register your website's exact origin in Unravel, including protocol and development port. Copy its public project ID. `applicationOrigin` is the Unravel dashboard/service origin, not your website's origin.

## React and Next.js

```tsx
'use client'; // Required for this component in Next.js App Router.
import { useEffect } from 'react';
import { mountWidget } from '@vansham/unravel-sdk';

export function UnravelReporter() {
  useEffect(() => {
    const widget = mountWidget({
      projectId: 'YOUR_PUBLIC_PROJECT_ID',
      applicationOrigin: 'https://YOUR_UNRAVEL_ORIGIN',
    });
    return () => widget.destroy();
  }, []);
  return null;
}
```

React: render `<UnravelReporter />` once in your root application component. Next.js: put the component in its own client file and render it once from `app/layout.tsx`. Importing the package is SSR-safe; mounting requires a browser lifecycle. No React/Next runtime is bundled into this SDK.

The widget captures nothing until Start. Visitors choose a mode, reproduce a problem, stop, describe it and explicitly send. No visitor account is required. A public project ID is not an authentication secret.

## Recording choices

- **Mask entered values** (default): ordinary page text and layout stay visible; field values are masked. Values echoed into normal page text remain visible.
- **Full-content recording**: explicitly includes entered and sensitive field values where capturable. Use synthetic data when demonstrating it.

Both modes include bounded error messages and URL paths, which can contain private text. Both exclude hidden inputs, SDK UI and `data-unravel-block` sections. Network bodies, headers, cookies, URL queries and fragments are not captured. Place `data-unravel-block` on any section that should be excluded entirely.

## API and recovery

The repository's in-app portfolio demos now use the workspace SDK with an explicit authenticated, same-origin submission option. That option is not part of published npm 0.1.0. Independent examples continue using npm; general external intake remains disabled on the portfolio deployment. See [portfolio setup](../../docs/SETUP.md#record-your-first-report).

`mountWidget(options)` returns `open()`, `close()` and idempotent `destroy()`. Mount once per document; close/minimize does not discard a recording. Teardown releases owned instrumentation. Retry submits the same frozen report to avoid duplicates after a lost response; local discard cannot undo a report already delivered.

The lower-level `initialize(options)` API offers `start()`, `stop()`, `getRecording()`, `getStatus()`, `submit()`, `getSubmissionStatus()` and `destroy()`. Choose `privacy.mode: 'masked-values' | 'full'` explicitly to use the visitor-mode policy. Omitting it retains legacy selector-based masking. See [recorder options](src/types.ts) for advanced options.

Defaults: 120 seconds, 5,000 combined events and approximately 5 MB recording data. The complete upload has a separate 5 MB cap. A limit stops capture visibly. HTTPS or a secure loopback context is required.

When sending to a Vercel-hosted Unravel instance, configure `limits: { maxBytes: 3_000_000 }` in `mountWidget` options. The hosted application accepts envelopes up to 4,000,000 bytes, leaving headroom below the platform's function limit; capture needs additional room for report metadata. The published SDK's default is unchanged. Older oversized evidence is retained and can be viewed locally if it exceeds the hosted replay response limit.

## Supported boundaries

Ordinary light-DOM clicks, fields, native selections, checkbox/radio controls and SPA navigation are supported. Replay is a bounded DOM/CSS reconstruction, not video or a pixel-perfect copy. External images/fonts/stylesheets, pseudo-content, canvas, cross-origin frames, Shadow DOM and complex custom controls are limited or unsupported. A full document navigation ends capture. Browser-specific sizing fallback can affect complex dynamic layouts.

Generated tests require developer review, safe replacement values and confirmed expected behavior. Exporting does not execute or certify a test.

## License

MIT for Unravel code. Bundled dependencies retain their own copyright notices; see `THIRD_PARTY_NOTICES.txt`.
