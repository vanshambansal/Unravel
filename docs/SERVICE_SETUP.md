# Development service setup

Status: Clerk/Neon development configuration, database migration, real-session ownership tests and restart persistence are verified. The user also confirmed actual email-code and Google sign-in.

## Clerk: existing Unravel application

The user created the Unravel Clerk application. Reuse it; do not run an accountless initializer or create a replacement. The supplied setup text is guidance, not proof that the SDK or credentials are installed locally. No Clerk CLI or extra agent skill is needed for this manual integration.

1. Open the existing application in the [Clerk Dashboard](https://dashboard.clerk.com/) and select its **Development** instance.
2. Under user/authentication settings, enable email sign-up and sign-in with **email verification codes**. Password authentication is not required for the agreed flow.
3. Enable **Google** as a social connection for all users. Development instances can use Clerk's shared Google OAuth credentials. Custom Google credentials and production consent configuration are a later release task.
4. Copy `apps/web/.env.example` to `apps/web/.env.local` only if that file does not already exist. If it exists, add missing variables without overwriting it.
5. From the application's API keys screen, use the **Copy** controls to enter the full development publishable and secret keys into the corresponding local variables. Do not copy the shortened on-screen preview containing dots or an ellipsis. Never paste keys into chat. Only the publishable key has a `NEXT_PUBLIC_` prefix; secret keys and database URLs stay server-side.
6. Tell the agent that local keys are ready, without sending their values. Restart the development server after environment changes.

We will use Clerk's maintained authentication components and theme their surrounding layout; the Figma composition is a visual proposal, not a promise of pixel-identical provider internals. Email verification, resend/error states, Google redirects, sign-out and protected access must be tested against this actual development instance before declaring auth complete.

References: [Next.js integration](https://clerk.com/docs/nextjs/getting-started/quickstart), [email sign-in options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options), [Google connection](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google).

## Neon: configured development/test databases

The user created the Neon project and entered connection details locally. Development/migration targets match, the test target is separate, and both empty databases were inspected before applying the reviewed SQL. No project was provisioned by the agent and no Docker was used.

Configuration:

- `DATABASE_URL`: development application connection.
- `DATABASE_MIGRATION_URL`: direct connection to that same database for reviewed migrations.
- `TEST_DATABASE_URL`: separate disposable test database/branch; integration tests must refuse to use the application database.

The Drizzle configuration and database/test scripts explicitly load the app-local environment file. The initial projects migration in apps/web/drizzle has been reviewed and applied to development and the isolated test database. PostgreSQL 18.6 connections and persistence/owner isolation tests passed.

## Cost boundary

On 2026-11-10, the published [Clerk Hobby plan](https://clerk.com/pricing) and [Neon Free plan](https://neon.com/pricing) offer no-credit-card entry tiers. Use those for development; no paid upgrade, billing add-on, phone authentication or paid service is authorized. Recheck limits before provisioning and before release. Development success does not establish public-deployment readiness.

## Guided Neon setup (user action, no automatic provisioning)

1. Sign in to the [Neon Console](https://console.neon.tech/) and choose the **Free** plan. No billing add-on or paid upgrade is needed.
2. For a new project, use Unravel as its name and discuss the available region with the agent. Singapore is a candidate for local development from India; do not assume a region exists without checking the Console. Keep Neon Auth/other backend services disabled: Clerk owns developer identities.
3. Use a dedicated development database (for example unravel_dev). Create a separate empty database or disposable branch for tests (for example unravel_test), before inserting any real data. A child branch may inherit parent data; keep it synthetic and isolated.
4. In Connect, select the development database/role. Copy the pooled PostgreSQL URL into DATABASE_URL and its direct connection URL into DATABASE_MIGRATION_URL in apps/web/.env.local. Preserve Neon-supplied TLS query parameters; do not disable certificate verification.
5. Select the isolated test database/branch and copy its direct URL into TEST_DATABASE_URL. The test URL must target a different database or branch from development.
6. Confirm readiness without sending values. We will run db:check, review/apply db:migrate, then test:integration. Integration tests apply the same migrations to the test database and clean only their own uniquely named rows; they never drop databases, tables or volumes. No Docker is started.

## Live authentication proof

For browser ownership tests, create two synthetic users in the existing Clerk **Development** application (or sign them up through the real email-code flow). Put their different email addresses in E2E_CLERK_USER_EMAIL and E2E_CLERK_OTHER_EMAIL locally. Do not enable password authentication solely for testing.

corepack pnpm test:auth uses Clerk's maintained testing helper to obtain real sessions for those existing test users. It does not create Clerk accounts. The user separately authorized creation of the two named synthetic development accounts during setup; they now exist. It exercises form validation, project creation, reload, foreign-owner rejection, forged owner input, duplicate/cross-origin rejection and sign-out. It leaves clearly named E2E project rows in the development database; no deletion capability is added just for tests. Use synthetic test accounts only.

Auth traces, videos and screenshots are disabled to avoid retaining session headers. No reusable storage-state file is written. This suite proves session/authorization wiring; it bypasses first-factor verification and is **not** evidence that Google OAuth or email delivery worked. Separately perform an actual email-code sign-in and a Google sign-in with the user before declaring authentication complete.

## Local preview after entering configuration

A preview may already occupy port 3000. Tell the agent when configuration is ready so it can restart the owned preview safely. Use http://localhost:3000 consistently; a 127.0.0.1 binding caused an observed Next.js authentication rewrite failure. Use corepack pnpm dev for development; a production build must be rebuilt when NEXT_PUBLIC values change. Do not start competing servers on the same port or kill unrelated Node processes.

## Safe authentication diagnostics

Check credential presence/format using boolean results, never values. When inspecting Clerk failures, report only request paths and status codes: handshake query parameters, cookies and session headers can contain transient tokens. Do not dump raw authentication URLs, server logs or SDK error causes into chat, tracked artifacts or documentation.

## Verified outcomes (2026-11-10)

Read-only checks confirmed valid Clerk backend access and empty development/test PostgreSQL databases. The reviewed migration was applied without dropping or replacing data. The isolated PostgreSQL test passed owner scoping, uniqueness under concurrency and reconnect persistence. The two-user browser proof passed project creation/validation/reload, cross-owner and forged-owner protection, duplicate/cross-origin rejection and sign-out. A separate authenticated read after restarting Next.js confirmed persistence. The user confirmed both real Google and email-code sign-in; test helpers alone are not that evidence.

Two approved synthetic Clerk development users and E2E-labelled project rows remain for repeatable tests, scoped to those accounts. Their local email variables and all credentials are ignored by Git. Do not remove real user data or revoke keys during routine cleanup.

The pinned pg 8 driver emitted a forward-compatibility notice about sslmode=require aliases. Current connections use its certificate-verifying behavior; TLS verification was not disabled. Review explicit verify-full semantics when intentionally upgrading the driver; do not automatically rewrite the user's connection secrets.
