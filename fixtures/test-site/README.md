# Local Unravel test website

A minimal, framework-free integration target with the real local Unravel SDK. It is not the Unravel application or the complete recording-to-test product.

From the repository root, after installing the pinned workspace dependencies:

```powershell
corepack pnpm build:packages
node fixtures/test-site/server.mjs
```

Open <http://127.0.0.1:4173>. Stop with Ctrl+C. The server binds only to loopback. No Docker, database, keys, or external services are required. Only explicitly mapped SDK/test assets are served.

## Test scenarios

- Select a category, enter a synthetic question, and submit. The real `POST /api/questions` deliberately returns HTTP 500. The form displays feedback, retains its values, and permits retry.
- Start recording explicitly, then enter synthetic content and reproduce the failure. Stop shows stop reason/event/byte counts; inspect a copy with `window.fixtureRecorder.getRecording()` in developer tools. Discard destroys it. No upload or replay UI yet.
- Enter a dummy private value. It is excluded from submission and blocked from recording, including after changing its type to text. Browser password display alone is not recording privacy protection.
- Expand the diagnostic check and click **Trigger test error** to produce an intentional uncaught JavaScript error, independently of HTTP failures.

No submitted data is saved or logged. The success feedback branch is present for a future endpoint fix; successful submission is not implemented. Safe synthetic question/category/feedback content, known fixture paths and the exact intentional error message are opted in; other text/values are masked. Read [SDK privacy and limitations](../../docs/SDK.md) before changing opt-ins. The browser suite separately verifies plain React and Next.js integration; this website remains vanilla.

## Verification

```powershell
node --check fixtures/test-site/app.js
node --check fixtures/test-site/server.mjs
node --test fixtures/test-site/server.test.mjs
corepack pnpm test:sdk
```

The Node tests exercise real HTTP requests and require no dependencies. Browser verification must additionally check form feedback, retry, private-field exclusion, and the intentional JavaScript error. Use only synthetic data.
