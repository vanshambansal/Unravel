# Release handoff

Owner: release operator. Updated 2026-11-16. SDK publication is complete; provider provisioning and public application deployment remain pending.

## SDK

- Owner selected MIT. Package README, repository metadata and distribution notices are present.
- npm login is verified as `vansham`. The owner selected `@vansham/unravel-sdk`; active imports and examples now use this personal scope. The earlier `@unravel/sdk` lookup did not establish organization rights.
- The workspace stays private. Published SDK: `@vansham/unravel-sdk@0.1.0` under MIT. Registry archive SHA256: `ccd4a70bbe2c68f286a8f61521784b49f3531ba441291e7079057d3b50fc5e1e`; exact approved bytes verified.
- Run `pnpm sdk:pack` and `pnpm sdk:check`; review `.cache/sdk-distribution/release-review.json`. Install the printed immutable archive in external consumers.
- Explicit publication approval and owner-completed 2FA/browser confirmation produced a successful npm release. Do not republish 0.1.0 or request authentication codes.
- Registry metadata/download, fresh independent installation, SSR-safe import and TypeScript are verified. Browser proof and its limits belong to PROJECT_STATUS.md; active website/examples now use the published version.

## Hosting proposal to approve

Use one Node 22-capable host for the existing Next.js app and one separate Node/static-capable deployment for the trusted replay host. Reuse Clerk and PostgreSQL providers; choose production resources explicitly instead of sharing test state by accident. No separate API application, Docker cluster, queue or cache service is required.

The provider selection must satisfy:

| Requirement           | Acceptance                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application admission | Supports the 5 MB request cap and body timeout; enforce HTTPS, edge request-size/rate/concurrency controls and prevent direct unprotected backend access.                            |
| Replay                | Separate HTTPS hostname, exact parent allowlist, fixed trusted assets only, no application credentials/private API. Prefer a separate registrable domain and host-only auth cookies. |
| Authentication        | Production Clerk keys, real email/Google/redirect/recovery verification and delivered signed `user.deleted` events/retries.                                                          |
| Database              | Explicit migration review, configured connection limits, provider backup/retention expectations and restart persistence.                                                             |
| Operations            | Payload-free error logging, service health, startup/restart behavior, rollback build and a copy of required configuration names.                                                     |

The owner selected free tiers and accepts cold starts/limits. Needed decisions/access: exact providers/URLs, production provider access and public retention/privacy acceptance. Do not enable public ingestion until the controls in DEPLOYMENT.md are actually verified. Its acknowledgement flags implement no edge protection themselves.

### Free-tier proposal, not provisioned

**Domain prerequisite:** free compute does not remove Clerk's production domain requirement. Before approving this proposal, identify a domain/subdomain whose DNS the owner can control; a hosting-provider URL is not sufficient for Clerk production setup. See [Clerk setup requirements](https://clerk.com/docs/getting-started/quickstart/setup-clerk) and [production deployment](https://clerk.com/docs/guides/development/deployment/production). No domain purchase, provider signup or authentication migration is approved here. If no controlled domain is available and the budget is strictly zero, discuss that constraint before changing authentication or weakening release gates.

The smallest change from the tested topology is two Render Free Node web services: one Next.js app and one isolated trusted replay host. Render documents sleep after 15 idle minutes and 750 shared free-instance hours per workspace/month; two services share that allowance. Cold-start delays and quota suspension are acceptable for a controlled portfolio demonstration, not an always-fast public-product claim. See [Render Free limitations](https://render.com/docs/free).

Proposed commands from the repository root (operator must supply the actual origins/credentials and approve resources):

| Service | Build                                                                   | Start                                                                                 |
| ------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| App     | `corepack pnpm install --frozen-lockfile && corepack pnpm build`        | `corepack pnpm --filter @unravel/web exec next start --hostname 0.0.0.0 --port $PORT` |
| Replay  | `corepack pnpm install --frozen-lockfile && corepack pnpm build:replay` | `REPLAY_PORT=$PORT node scripts/replay-host.mjs`                                      |

Use Node 22.18.0. Set `REPLAY_LISTEN_HOST=0.0.0.0`, the player's own public HTTPS `REPLAY_PUBLIC_ORIGIN` and exact `REPLAY_PARENT_ORIGINS` on the player only. The player must receive no Clerk/database credentials. Configure the app with the environment contract in DEPLOYMENT.md; apply reviewed database migrations separately. Reuse an explicitly selected Neon production branch/database rather than provisioning a short-lived database implicitly.

This proposal does **not** establish that the free edge supplies the required rate/concurrency/request controls. Verify those before approving hosting and public ingestion; do not set `EDGE_INGESTION_PROTECTED=true` on assumption. If the chosen free platform cannot provide the controls, revise the hosting proposal or keep intake disabled. A static replay deployment is a possible later alternative: [Cloudflare Pages supports response-header rules](https://developers.cloudflare.com/pages/configuration/headers/), but requires a reviewed static packaging/configuration step and is not implemented here.

## Hosted acceptance

Run the supported journey from a separate HTTPS React/Next application using the registry package. Check both recording modes, delivery/retry deduplication, private authorization, replay isolation/recovery, diagnostics, persisted plan/export and unchanged buggy/fixed execution. Confirm production-only lab routes are unavailable. Record actual results rather than inferring readiness from a successful build/preflight.

The detailed environment contract and security limits remain in [DEPLOYMENT.md](DEPLOYMENT.md); avoid duplicating secret values here.
