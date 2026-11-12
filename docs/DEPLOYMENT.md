# Release preparation and remaining operator work

Updated 2026-11-12. No deployment, domain provisioning, production provider change or npm publication has occurred. This document is the release contract, not a claim that Unravel is publicly ready.

## Implemented safeguards

- Ingestion stays closed on public origins by default. Development loopback works normally; a local **production preview** must explicitly set `ALLOW_LOOPBACK_INGESTION=true`. That flag is not a public launch setting.
- Public opt-in requires `PUBLIC_INGESTION_ENABLED=true`, canonical `APP_ORIGIN`, an isolated HTTPS `REPLAY_ORIGIN` on another hostname, production Clerk key prefixes, a server-only `CLERK_WEBHOOK_SIGNING_SECRET`, `EDGE_INGESTION_PROTECTED=true`, `PUBLIC_PRIVACY_REVIEWED=true` and `REPORT_RETENTION_POLICY=owner-managed`. The acknowledgement flags do not implement or independently verify the operator's commitments.
- Anonymous POST attempts are counted atomically in PostgreSQL: 30/project/minute, 200/project/UTC day. Invalid bodies and retries count after origin/project admission. Fixed-window boundaries can permit bursts; these are provisional abuse caps, not customer entitlements. No IP addresses or credentials are collected for these budgets.
- New storage is serialized against the registered project: at most 1,000 reports / 100,000,000 serialized bytes per project. Identical retries still deduplicate when storage is full. Owner deletion frees capacity. Origin changes are rechecked under the same project lock before insertion.
- Streaming bodies stop at 5,000,000 bytes and a 15-second read deadline; compression remains unsupported. SDK uploads have a 30-second attempt deadline, explicit retry and an unchanged idempotency envelope. A timed-out request may already have committed; retry confirms its receipt.
- Descriptive edits/status require owner authorization, same-origin JSON and optimistic revision checks. Captured evidence and original submission digest are not rewritten.

## Deployment topology

Run the Next.js Node application and the trusted replay host behind **distinct HTTPS origins**. Prefer a distinct registrable replay domain, host-only auth cookies, no shared credential files, and no dashboard/private API on the replay origin. Never rewrite the player under the dashboard URL. The recorded document keeps scripts/forms disabled; CSP blocks external resources. The host serves only fixed trusted assets.

The existing replay process supports `REPLAY_PUBLIC_ORIGIN`, `REPLAY_PARENT_ORIGINS` (explicit comma-separated parents), `REPLAY_PORT` and `REPLAY_LISTEN_HOST` (loopback by default). An HTTPS reverse proxy may terminate TLS; preserve the public Host header. Optional `REPLAY_TLS_CERT_FILE` / `REPLAY_TLS_KEY_FILE` enable direct TLS for controlled verification. Keep keys outside Git. Static host validation uses the configured public host and exact parent origins.

Set `APP_ORIGIN` consistently for the dashboard's canonical same-origin writes. The public ingestion route accepts a proxy's canonical app origin only when its Host matches configuration. This is routing validation, not proof that the connection traversed TLS. The deployment edge must enforce HTTPS and restrict direct backend exposure.

Choose a host whose request limits support the envelope cap; platform limits may be smaller. Keep ingestion outside middleware body buffering. Configure edge-level rate/concurrency limits, request-size/header/body timeouts, request logging without payloads, and protection for invalid origins/OPTIONS. Application project budgets cannot prevent spoofed-Origin traffic, bot exhaustion of a known project or database lookup floods. CORS is not authentication. No edge provider/configuration has been verified here. See [Next.js self-hosting guidance](https://nextjs.org/docs/app/guides/self-hosting).

## Retention and privacy gate

The current policy remains owner-managed deletion with no automatic expiry; this preserves previously agreed data behavior. Project storage is bounded. Do not introduce destructive expiry jobs without approval. Before public launch, the owner must approve this policy, explain it in visitor/developer disclosures, review opt-ins and masking on the hosted demo, and establish provider backup retention/deletion expectations. Row deletion does not promise instant backup erasure. No masking implementation can prove an arbitrary client supplied consent or removed all sensitive information.

No public privacy policy or legal compliance certification is supplied. A smaller controlled synthetic portfolio demo is the recommended initial audience.

## Authentication and SDK release blockers

The owner reconciled development signup to email-code + Google. Fresh anonymous UI inspection shows no password field; delivery/OAuth/recovery and production domains remain separate manual gates. See [service setup](SERVICE_SETUP.md).

The approved account-closure policy disables intake and retains data. The signed `/api/webhooks/clerk` handler and additive owner-block table are implemented and tested locally. Configure `user.deleted` delivery and its secret at the hosted endpoint, then verify receipt/retries before public release. Missing configuration returns 503. A preflight secret is not proof of a delivered event. No hosted endpoint was provisioned.

`pnpm sdk:pack` creates a locally installable tarball. Independent npm import, types, bundling and browser integration are checked separately from publication. The package intentionally remains private/unpublished. Choose the project's distribution license, verify bundled dependency notices/versioning and publish only with explicit approval. Do not show `npm install @unravel/sdk` as an available registry command yet.

## Preflight and acceptance

Run `pnpm release:check` using the intended production environment. It prints missing settings without keys and fails on the current development configuration. Passing checks configuration declarations only. Public acceptance still requires real HTTPS origins/certificates, live Clerk signup/Google/email/recovery, owner isolation, normal SDK installation on a separate site, actual ingestion quotas/edge controls, restart persistence, replay sandbox/resource checks and unchanged exported-test fail/pass proof.

Local HTTPS verification uses ignored temporary certificates with certificate errors explicitly ignored by test clients. Its Chromium/Firefox results prove protocol/isolation mechanics only. They do not validate a public certificate, real phone, hosted proxy or production account.
