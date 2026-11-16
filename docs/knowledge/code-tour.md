# Code tour: from GitHub folders to a working report

Start here when someone says, “Open the code and explain how your project works.” You only need the main paths, not every helper function. The paths below refer to the public repository; ignored local builds, design archives and agent tools are not part of this tour.

## 1. What you see when you open GitHub

```text
Unravel/
  apps/web/          Main website and backend
  packages/          SDK, shared data rules and test generator
  examples/          SDK examples and the standalone React demo
  fixtures/          Controlled websites used for verification
  tests/             Shared automated checks
  scripts/           Build, replay, packaging and verification tools
  docs/              Setup, architecture and this handbook
  .github/           GitHub Actions checks
  package.json       Commands for the whole repository
  pnpm-workspace.yaml  Which projects belong to the workspace
  pnpm-lock.yaml     Exact dependency resolution
```

**A workspace** lets several related packages live in one repository. Here, the web app uses shared packages, but the SDK can also be installed independently from npm.

Other root files have small, specific jobs: TypeScript checks types, ESLint checks coding rules, Prettier and EditorConfig keep formatting consistent, Playwright configures browser tests, and `.gitignore` excludes secrets/generated output. Environment examples explain required settings; they are not real credentials. See [SETUP](../SETUP.md) for commands.

Explain it aloud: “The application is in apps, reusable logic is in packages, and examples, fixtures and tests show how we verify it.”

## 2. Inside the main application

Open [apps/web](../../apps/web). These are its main boundaries:

| Location       | Simple explanation                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `src/app`      | Decides which page or HTTP endpoint handles a URL.                                              |
| `src/features` | The actual screens and browser interaction logic.                                               |
| `src/server`   | Authentication, business rules and database operations.                                         |
| `public`       | Files browsers can request directly, such as landing artwork and fonts. Never put secrets here. |
| `drizzle`      | Ordered database migrations.                                                                    |
| `tests`        | Application-specific browser and integration checks.                                            |
| `scripts`      | App-specific build/database tools.                                                              |

The backend is inside Next.js. There is no separate Express server to find. SQL belongs in server repositories; React components should not directly query the database.

## 3. How route folders become URLs

Within `src/app`, `page.tsx` renders a page, `layout.tsx` wraps pages, and `route.ts` handles an HTTP request. A layout is useful for shared navigation that stays around as the user moves between pages. `loading.tsx`, `error.tsx` and `not-found.tsx` provide waiting and recovery views where applicable.

- `(product)` and `(marketing)` are organizational groups. Their names do not appear in the URL.
- `[projectId]` is a value supplied by the URL. It identifies which project to load; it does not prove permission to access it.
- `[[...sign-in]]` lets Clerk handle the sign-in route and its optional extra segments.
- A `#hero` fragment selects a section of a page; it is not a separate server route.

| URL                                            | File under `apps/web/src/app`                                    | What it does                                  |
| ---------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| `/`                                            | `(marketing)/page.tsx`                                           | Landing and cinematic entrance.               |
| `/sign-in`                                     | `(authentication)/sign-in/[[...sign-in]]/page.tsx`               | Sign-in screen.                               |
| `/app/projects`                                | `(product)/app/projects/page.tsx`                                | Developer's projects.                         |
| `/app/projects/new`                            | `(product)/app/projects/new/page.tsx`                            | Create a project.                             |
| `/app/projects/{projectId}/setup`              | `(product)/app/projects/[projectId]/setup/page.tsx`              | SDK integration instructions.                 |
| `/app/projects/{projectId}/settings`           | `(product)/app/projects/[projectId]/settings/page.tsx`           | Project settings.                             |
| `/app/projects/{projectId}/reports`            | `(product)/app/projects/[projectId]/reports/page.tsx`            | Searchable report list.                       |
| `/app/projects/{projectId}/reports/{reportId}` | `(product)/app/projects/[projectId]/reports/[reportId]/page.tsx` | Investigate one report.                       |
| `/demo`                                        | `demo/page.tsx`                                                  | Prepare and choose a demo.                    |
| `/demo/next`                                   | `demo/next/page.tsx`                                             | Next.js demonstration.                        |
| `/demo/react`                                  | `demo/react/route.ts`                                            | Serve the independently built React document. |

The outer [root layout](../../apps/web/src/app/layout.tsx) sets up the application document. The [workspace layout](<../../apps/web/src/app/(product)/app/layout.tsx>) supplies the developer workspace shell. An organizational route group alone is not a security boundary: server authentication and ownership checks are still needed.

## 4. Find the important UI code

Inside [features](../../apps/web/src/features), start with the feature you are explaining:

| Feature              | Major files or location                                                                                                                          | Responsibility                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Landing              | [Landing.tsx](../../apps/web/src/features/landing/Landing.tsx), [motion/controller.ts](../../apps/web/src/features/landing/motion/controller.ts) | Page composition and browser scene lifecycle.                               |
| Workspace            | [workspace](../../apps/web/src/features/workspace)                                                                                               | Shared shell, links and page compositions.                                  |
| Projects             | [projects](../../apps/web/src/features/projects)                                                                                                 | Project forms and management UI.                                            |
| Report investigation | [ReportWorkspace.tsx](../../apps/web/src/features/reports/ReportWorkspace.tsx)                                                                   | Connect investigation views for a report.                                   |
| Replay/timeline      | [ReportViewer.tsx](../../apps/web/src/features/reports/ReportViewer.tsx), [timeline.ts](../../apps/web/src/features/reports/timeline.ts)         | Playback controls and timed evidence.                                       |
| Test editing         | [PlanEditor.tsx](../../apps/web/src/features/reports/PlanEditor.tsx), [plan-state.ts](../../apps/web/src/features/reports/plan-state.ts)         | Review/edit a plan and manage editor state.                                 |
| Demo                 | [DemoRecorder.tsx](../../apps/web/src/features/demo/DemoRecorder.tsx)                                                                            | Mount the published SDK for an authorized demo destination and clean it up. |

A page usually gathers the required data and chooses a feature component. That component handles the detailed UI. This keeps route files easier to follow.

## 5. Journey one: open a project's reports

Start at the [reports page](<../../apps/web/src/app/(product)/app/projects/[projectId]/reports/page.tsx>).

```text
Reports URL
  -> reports/page.tsx
  -> requirePageDeveloper() identifies the developer
  -> projectServices().get() and reportServices().list()
  -> server repositories query PostgreSQL with ownership constraints
  -> page renders the report list and search controls
```

The page reads the project ID and search parameters. It asks the project/report services for data, handles missing resources and renders the result. These server-rendered pages can call server services directly; they do not need to call their own HTTP API first.

The [report API route](../../apps/web/src/app/api/projects/[projectId]/reports/route.ts) is another entry into the backend for HTTP clients. Do not confuse it with the page that displays the list.

In [server/reports/index.ts](../../apps/web/src/server/reports/index.ts), follow how the service receives its repository. A **service** decides what is allowed and what should happen. A **repository** performs database reads/writes. [connection.ts](../../apps/web/src/server/db/connection.ts) manages database connections; [schema.ts](../../apps/web/src/server/db/schema.ts) defines tables and constraints. The [database chapter](database-and-backend.md) explains those rules in detail.

## 6. Journey two: record and submit a bug

The SDK code lives in [packages/sdk/src](../../packages/sdk/src), independently of the main application's UI.

| File                                                  | Main job                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| [index.ts](../../packages/sdk/src/index.ts)           | Public exports developers import.                                |
| [widget.ts](../../packages/sdk/src/widget.ts)         | Visitor controls, privacy choice and recording/submission views. |
| [recorder.ts](../../packages/sdk/src/recorder.ts)     | Start/stop lifecycle and coordination of capture.                |
| [events.ts](../../packages/sdk/src/events.ts)         | Meaningful user actions and event capture.                       |
| [network.ts](../../packages/sdk/src/network.ts)       | Observe supported fetch/XHR metadata.                            |
| [privacy.ts](../../packages/sdk/src/privacy.ts)       | Decide what values/content can be captured.                      |
| [replay.ts](../../packages/sdk/src/replay.ts)         | Prepare the supported replay representation.                     |
| [submission.ts](../../packages/sdk/src/submission.ts) | Send a frozen report and retry unchanged submissions.            |

```text
Website mounts widget -> visitor chooses Start -> recorder captures evidence
  -> visitor stops and submits
  -> POST /api/ingest/{projectId}
  -> server validates evidence and registered origin
  -> repository transaction saves report metadata and payload
```

Open the [ingestion route](../../apps/web/src/app/api/ingest/[projectId]/route.ts), then [report service](../../apps/web/src/server/reports/service.ts), [validation](../../apps/web/src/server/reports/validation.ts) and [repository](../../apps/web/src/server/reports/repository.ts). The route handles HTTP; the deeper modules validate and persist the report. A retry with the same recording identity and evidence can return the existing report.

[packages/contracts/src](../../packages/contracts/src) holds shared runtime data rules. The server still validates incoming data even though the SDK uses those contracts: callers can send requests without using our SDK. Read [recording-sdk.md](recording-sdk.md) for the capture/privacy details.

## 7. Journey three: investigate, edit and export

Open the [report detail page](<../../apps/web/src/app/(product)/app/projects/[projectId]/reports/[reportId]/page.tsx>). It authenticates the developer, loads report details/events and passes them into the investigation UI. Replay is fetched separately when needed; it is not part of every report-list response.

The replay path uses [ReportViewer.tsx](../../apps/web/src/features/reports/ReportViewer.tsx), [replay-origin.ts](../../apps/web/src/features/reports/replay-origin.ts) and [player-host.ts](../../apps/web/src/features/reports/player-host.ts). [scripts/replay-host.mjs](../../scripts/replay-host.mjs) serves the trusted player on a different origin. Recorded scripts remain disabled. The app's `/replay-host` route deliberately returns 410 with instructions to use that separate host; it is not the player implementation.

The generation path is separate:

```text
Recorded semantic events -> deterministic generator -> editable plan
  -> developer reviews values, locators and expected assertions
  -> save plan through its private API
  -> export API validates the saved plan and returns a Playwright file
```

Inside [packages/test-plan/src](../../packages/test-plan/src), [schema.ts](../../packages/test-plan/src/schema.ts) defines a valid plan, [normalization.ts](../../packages/test-plan/src/normalization.ts) simplifies repeated actions, [validation.ts](../../packages/test-plan/src/validation.ts) checks readiness, and [playwright.ts](../../packages/test-plan/src/playwright.ts) writes the test code. [server/reports/plans.ts](../../apps/web/src/server/reports/plans.ts) connects that package to ownership, saved revisions and export.

For the [export route](../../apps/web/src/app/api/projects/[projectId]/reports/[reportId]/export/route.ts) currently discussed, explain these steps:

1. `requireDeveloper()` identifies the caller.
2. Route parameters identify the requested project/report.
3. The handler accepts reproduction or regression mode.
4. `exportPlan()` checks access and the saved plan before generating code.
5. The response sets a download filename and disables caching.
6. Errors become consistent HTTP responses through `errorResponse()`.

That route does not record the browser, infer the intended outcome or run Playwright. The developer runs the downloaded file later. See [replay and generation](replay-and-test-generation.md).

## 8. Explain the supporting folders without opening every file

- **Examples:** `examples/browser-demo` builds the React document used by the in-app demo. `examples/sdk-react` and `examples/sdk-next` show independent npm integrations. Their README explains how to configure them.
- **Fixtures:** controlled targets with intentional failures for automated proof. They are testing inputs, not another production backend.
- **Tests:** `tests/unit` checks isolated rules; `tests/sdk` exercises the recorder/widget in browsers; `tests/e2e` checks public application flows. `apps/web/tests` adds app-specific checks, including configured-service workflows.
- **Scripts:** builds, local process startup, isolated replay hosting, SDK packaging and verification. [scripts/README.md](../../scripts/README.md) groups them by purpose. A profiling script is a development tool; the replay host is part of running replay.
- **Documentation:** SETUP owns installation, the SDK README owns its public API, and this handbook explains implementation.

## 9. A five-minute code walkthrough

Show the root folders, then open one report page, its service and repository. Explain how permission and storage work. Next open the SDK entry/recorder and explain the two evidence streams. Finish at the plan generator and export route, stressing that the developer confirms correctness.

You should be able to answer: **Where does this request enter? Who checks permission? Where is data stored? Which code runs in the browser? What happens on failure?** Use the [interview questions](interview-questions.md) to rehearse; read deeper chapters when you need the implementation details.
