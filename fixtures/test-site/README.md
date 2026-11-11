# Local Unravel test website

A minimal, framework-free integration target with the real local Unravel SDK. It is not the Unravel application or the complete recording-to-test product. Explicit submission, persistence and masked replay are verified locally; see SDK.md and REPORTS.md for operation and limitations, and PROJECT_STATUS.md for actual outcomes.

From the repository root, after installing the pinned workspace dependencies:

```powershell
corepack pnpm build:packages
node fixtures/test-site/server.mjs
```

Open the URL printed by the server (the example configuration uses <http://127.0.0.1:4184>; the unconfigured CLI default remains 4173). Stop with Ctrl+C. The server binds only to loopback. No Docker, database, keys, or external services are required. Only explicitly mapped SDK/test assets are served.

## Test scenarios

- Select a category, enter a synthetic question, and submit. The real `POST /api/questions` deliberately returns HTTP 500. The form displays feedback, retains its values, and permits retry.
- Developer setup: copy `.env.example` to `.env.local` in this folder only if no local configuration exists. Enter `UNRAVEL_PROJECT_ID` from the registered project and `UNRAVEL_APPLICATION_ORIGIN` (normally `http://localhost:3000`). Match `FIXTURE_PORT` to the project's registered website origin, then restart the fixture. These are public SDK settings; never put Clerk/database credentials here.
- Visitors open the bare website URL and immediately see **Report a bug**. There are no project configuration fields or setup step. Open, explicitly Start, reproduce the failure, Stop, enter a title, optionally expand Add details, and Send. Retry preserves the report; minimize retains a draft; discard is deliberate.
- Move the launcher or minimized timer by dragging it, or use the panel header/grip. Focus the launcher/grip and use arrow keys (Shift for larger steps); Home or Reset restores bottom-right positioning. Only normalized coordinates are remembered in session storage per project. Recordings/drafts remain in memory and are lost on reload.
- Missing/invalid integration configuration is reported in the developer terminal/console; the visitor form remains usable and no fake widget/project is substituted. The `/unravel-config.js` endpoint contains only validated public settings, never arbitrary environment values.
- Automated fixtures explicitly set `FIXTURE_ALLOW_TEST_CONFIG=1`. Only those processes accept `projectId`/`applicationOrigin` URL overrides and `?debug=1` low-level controls. The normal fixture ignores visitor overrides. Tests never read your local `.env.local` when this flag is enabled.

- Enter a dummy private value. It is excluded from submission and blocked from recording, including after changing its type to text. Browser password display alone is not recording privacy protection.
- Expand the diagnostic check and click **Trigger test error** to produce an intentional uncaught JavaScript error, independently of HTTP failures.

The question endpoint does not save or log submitted questions and intentionally returns HTTP 500; its success branch awaits the later fixture fix. This is separate from the working Unravel bug-report submission, which persists a report in the configured application. Safe synthetic question/category/feedback content, known fixture paths and the exact intentional error message are opted in; other text/values are masked. Read [SDK privacy and limitations](../../docs/SDK.md) before changing opt-ins. The browser suite separately verifies plain React and Next.js integration; this website remains vanilla.

## Verification

```powershell
node --check fixtures/test-site/app.js
node --check fixtures/test-site/server.mjs
node --test fixtures/test-site/server.test.mjs
corepack pnpm test:sdk
```

The Node tests exercise real HTTP requests and require no dependencies. Browser verification must additionally check form feedback, retry, private-field exclusion, and the intentional JavaScript error. Use only synthetic data.
