# Development setup

## Requirements and installation

- Node 22.18.0 and Corepack/pnpm 10.34.9, pinned in the repository.
- Your own Clerk development application and PostgreSQL database for the full workflow.
- Network access to install dependencies and reach your configured services.

From the repository root:

```sh
corepack pnpm install --frozen-lockfile
```

No global SDK installation, local tarball, prebuilt demo, private reference folder or repository-owner account is required. Workspace packages and demo assets are built from tracked source.

## Configure your services

Copy `apps/web/.env.example` to `apps/web/.env.local` (`cp` on macOS/Linux or `Copy-Item` in PowerShell). Enter credentials directly in that ignored file.

1. Create your own Clerk **development** application. Configure email sign-in and any social provider you intend to test. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the same application. Use `http://localhost:3000` for local application URLs and the template's sign-in/sign-up routes. Create your own developer account through that application.
2. Create an empty PostgreSQL database you are authorized to initialize. Set `DATABASE_URL` to its application connection URI and `DATABASE_MIGRATION_URL` to a direct connection to the **same database**. A pooled/direct pair is supported; use your provider's required TLS settings. Standard PostgreSQL is supported; Neon is not mandatory.
3. Leave the public-ingestion acknowledgement flags disabled. They are deployment safeguards, not requirements for loopback development.

The remaining template settings are labelled optional, test-only or production-only. `TEST_DATABASE_URL` must point to a separate disposable database for integration tests. Browser end-to-end suites use `E2E_CLERK_USER_EMAIL` and `E2E_CLERK_OTHER_EMAIL` for two accounts you create in your test Clerk application; they do not require shared passwords or a bypass.

Never commit real `.env` files, use another developer's credentials, or point destructive tests at a development/production database.

## Initialize and check the database

```sh
corepack pnpm db:migrate
corepack pnpm db:check
```

`db:migrate` applies the committed Drizzle SQL and journal. Do not generate a new migration for initial setup. Running it again should apply only unapplied migrations. The guarded command rejects mismatched application/migration database targets and never resets data.

`db:check` verifies connectivity and all six application tables: projects, reports, replay payloads, reviewed test plans, ingestion budgets and account-intake blocks. Schema changes require a reviewed migration plus its generated metadata, committed together.

## Run the complete application

```sh
corepack pnpm dev
```

Open **http://localhost:3000**. This command builds the packages/player/React demo and starts the app plus its isolated replay host at **http://127.0.0.1:4192**. Keep the dashboard hostname consistent. The player is deliberately a separate origin.

To use different local ports, set `DEV_PORT` and `DEV_REPLAY_PORT` in the command's environment. The launcher derives matching app/player settings and refuses conflicting player configuration. These launcher variables are shell settings, not values automatically loaded from the app's `.env.local`.

Without credentials, landing and example interactions remain available. Authentication, project creation and saved reports require the services above; missing configuration never bypasses authorization.

## Record your first report

For the owner-authenticated portfolio demo, set `PORTFOLIO_DEMO_ENABLED=true` and `APP_ORIGIN` to your exact application origin (for example `http://localhost:3000`). Keep `PUBLIC_INGESTION_ENABLED=false`. Both in-app demos use the workspace SDK's explicit same-origin delivery option; only signed-in owners can submit to their own current-origin project through `/api/demo/ingest/{projectId}`. This does not enable anonymous external SDK submissions. General public intake retains its separate release requirements.

Hosted demo capture is limited to 3 MB; Vercel intake envelopes and replay responses are bounded to 4 MB. Existing larger evidence is retained for local viewing. The npm 0.1.0 SDK and independent integration examples are unchanged; they do not have the workspace-only authenticated-demo option.

A small same-origin `/demo/session` frame runs Clerk session renewal for both demo documents. Its checked ready message lets the recorder wait for session initialization; it never sends tokens in messages. The standalone React document remains independent of the Next runtime, while authentication renewal is handled separately. Missing credentials still allow browse-only exploration.

1. Sign in and open `/demo`. Prepare your own project for the current origin.
2. Choose React or Next.js. Start the widget, choose a privacy mode and reproduce the intentional failure using synthetic values.
3. Stop and submit; open your private reports to inspect replay, actions, network metadata and errors.
4. Review the reproduction plan, supply safe values and intended assertions, then preview/download Playwright. Run the downloaded file in the target project's Playwright setup.

For independent websites, follow [examples/README.md](../examples/README.md) and the [SDK README](../packages/sdk/README.md). Register each website's exact origin; no personal project IDs are supplied by this repository.

## Build and run in production mode locally

```sh
corepack pnpm build
corepack pnpm start
```

In a second terminal run `corepack pnpm replay:dev` for the default local player. For recording in a **local production-mode** app, set `ALLOW_LOOPBACK_INGESTION=true` in its app environment and restart. Keep public-ingestion flags disabled. Default startup remains dashboard3000/player4192.

The optional `preview:local` verification launcher supports `UNRAVEL_NEXT_OUTPUT`, `PREVIEW_PORT` and `PREVIEW_REPLAY_PORT`. Build with that same isolated output before using it; ordinary contributors can use the standard commands above.

Standalone replay-host settings have their own [environment template](../scripts/.env.example). It must receive no application credentials. Public hosting additionally requires separate HTTPS origins, live Clerk configuration, signed account-deletion webhook delivery, actual edge request controls, retention/privacy review and hosted acceptance. A successful local build does not establish public readiness.

## Verification

External SDK preview intake uses `PUBLIC_INGESTION_ENABLED=true` plus canonical HTTPS `APP_ORIGIN` and isolated `REPLAY_ORIGIN`. It retains registered-origin checks, quotas, storage limits and validation; visitors do not need dashboard authentication. The stricter `release:check` still reports broader production gaps (live Clerk, webhook, edge protection and retention declarations); its failure does not by itself mean preview intake is disabled. `previewIntakeEnabled` reports the separate preview configuration state. Do not set acknowledgement flags merely to silence that checklist.

Credential-free checks:

```sh
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm exec playwright install chromium firefox
corepack pnpm test:sdk
```

Set `SDK_BROWSER=all` to include both browsers in the SDK suite. `posters:check` verifies committed runtime artwork against source fingerprints. Updating the cinematic renderer requires deliberate poster recapture/stamping; no old prototype is needed to build or test the app.

With dedicated services configured, run `db:check`, `test:integration`, `test:auth`, `test:reports` and `test:standard` as relevant. Browser suites use controlled synthetic accounts/reports. Use `REPORTS_BASE_URL` to select a running preview; `test:demo` uses `DEMO_BASE_URL`. Test configs document their owned fixture/player ports, which must be available. Tests requiring an explicitly selected synthetic performance fixture may skip without it; report skips honestly.

`test:integration` uses the separate `TEST_DATABASE_URL`. It must never equal the app database. Do not run service-dependent tests against an account/database you have not approved for synthetic testing.

Generated outputs belong in ignored build/cache directories. A clean clone must be able to regenerate them with these commands. Dependency downloads from a package registry are expected; copying another workspace's `node_modules`, credentials or built artifacts is not.
