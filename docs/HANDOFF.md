# Start here in a new conversation

Updated: 2026-11-16. Owner: continuation/navigation only. PROJECT_STATUS.md owns current facts; do not reconstruct current state from historical preview notes.

## Read first

1. AGENTS.md and docs/PROJECT_STATUS.md.
2. docs/PROJECT_BRIEF.md, docs/ARCHITECTURE.md and current docs/DECISIONS.md.
3. docs/audits/COMPLETION_2026-11-16.md for exact checks, intermediate failures and limits.
4. docs/COMPLETION_PLAN.md and docs/RELEASE_CHECKLIST.md for the remaining release gates.

Read SDK.md/REPORTS.md before recording/privacy/replay changes, TEST_PLANS.md before generation/export changes, and DESIGN.md/INTERNAL_UI.md before internal presentation work.

## Current stopping point

Local stabilization, application-wide formatting/readability, SDK publication and the in-app interview demos are implemented and verified. The owner chose MIT, free hosting tiers/cold-start limits and exclusion of 784 agent-tool files from Git while keeping local copies. The owner explicitly requested commits and a push to origin/main on2026-11-16. Tool exclusions, implementation and independent fixture are committed; publication documentation follows. Do not reset history or treat this as authorization for future unrelated commits/pushes.

SDK `@vansham/unravel-sdk@0.1.0` is published under MIT after explicit owner approval and local 2FA/browser confirmation. The public registry archive matches SHA256 ccd4a70bbe2c68f286a8f61521784b49f3531ba441291e7079057d3b50fc5e1e. A fresh registry-only install passes TypeScript and SSR import checks. The workspace remains private. Do not publish again; PROJECT_STATUS.md owns final browser proof.

The free-tier deployment proposal is documented, not provisioned. Production Clerk/database/webhook, public HTTPS origins, actual edge protection and retention acceptance need provider approval/access and hosted verification. No new Docker/cloud/database resource is implicitly authorized.

## Runtime and retained work

Final interview demo preview is3054/player4224 using `.next-demo-complete16`; PROJECT_STATUS.md owns current verification; task-owned 3048/4218 was stopped. Existing 3000/3033 and other user services were preserved. New work must verify process ownership/ports instead of assuming every old preview is current or killing unrelated services.

The landing's approved architecture remains; first entrance brand does not skip, later/workspace/auth brands go to hero. The user repeatedly rejected unrelated cinematic redesigns. No new visual direction is authorized by completion cleanup.

Original `prototypes/landing-motion`, independent original fixture, user manual reporters and saved evidence are preserved. Agent-tool files are ignored/untracked, not physically deleted. Historical status and this prior handoff are in docs/history; previous operational README is docs/DEVELOPMENT_GUIDE.md.

## Next work

Read CODE_WALKTHROUGH.md for interview source navigation and CLEANUP_REVIEW.md for remaining archive candidates. /demo provides Next and standalone React examples using the published SDK. SDK publication is complete. Discuss/approve the free hosting/provider/edge setup before provisioning, perform hosted acceptance and add real URLs. Follow the existing completion plan rather than restarting product development or adding features.
