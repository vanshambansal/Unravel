# Local completion and release preparation

Owner: repository completion. Scope: the approved completion plan, following the read-only audit. User selected MIT, approved 784 agent-tool Git exclusions with local copies retained, and chose free hosting tiers with accepted cold starts/limits. No commit, push, npm publication, infrastructure provisioning or public deployment occurred.

## Implemented

- Split the deterministic test-plan package into schema/types, normalization, validation, descriptions and Playwright output, retaining public exports and stored versions. Stop normalization after its step cap on navigation paths too; original evidence stays untouched.
- Formatted 74 explicitly maintained core/configuration files using pinned Prettier 3.10.1. Added EditorConfig, scoped format commands, and lint coverage for maintained release scripts and manual examples. Avoided renderer/reference/design-history churn.
- Fixed release command exit behavior: disabled ingestion returns failure even when configuration declarations are otherwise complete. Added command-level coverage for both enabled/disabled states and a navigation-limit contract check; 50 unit tests pass.
- Added credential-free GitHub Actions checks. Workflow is configured, not executed remotely. Report/auth/database acceptance remains explicitly separate.
- Added MIT license, SDK README/metadata, rrweb/Zod/base64-arraybuffer notices and a restricted archive file list. Build metadata is excluded from the archive. `sdk:check` checks required files, portable declarations, runtime dependency metadata and lazy chunks.
- Added reproducible packed-consumer preparation and optional standard-test profile. Disposable consumers install the actual archive plus pinned React/Next; neither uses a workspace SDK alias. User manual reporters/configuration are unchanged.
- Updated local onboarding to use the immutable archive path printed by packing. Corrected replay copy/inner-frame title to apply to either mode and explain paired development startup.
- Corrected stale browser checks: visible streamed surfaces rather than hidden retained copies, player ping before initialization, approved masking/full capture, and reviewed safe replacements for sensitive-field actions. No replay sandbox permissions were relaxed.
- Recaptured all four posters after the development-only lockfile update, then stamped. Source fingerprints normalize text line endings; binary assets stay exact. The retained-reference checker accepts only reversible LF/CRLF variants against its original hashes, avoiding false failures on a fresh Linux checkout. Original prototype files/manifest were not changed.
- Rewrote the README, prepared an interview/demo guide, cleanup review, completion roadmap and release checklist. Preserved the previous status/handoff and operational README instructions instead of discarding their evidence.
- Staged exactly 784 approved agent-tool index exclusions and added root ignore rules. Local skill/config copies remain present. No design artifacts, user reports, old builds or Git history were removed as cleanup.

## Verification

| Check                        | Actual outcome                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Final format                 | 74 maintained files checked, no mismatches                                                                                                                                                                                            |
| Expanded lint                | Passed, including maintained scripts/manual React/Next sources                                                                                                                                                                        |
| Root typecheck               | Passed; own verification output references cleaned afterward                                                                                                                                                                          |
| Unit tests                   | 50/50 passed                                                                                                                                                                                                                          |
| Final production build       | `.next-completion-release16` passed; served on 3049 with isolated 4219                                                                                                                                                                |
| Shared SDK/widget            | 65 passed; one intentional Firefox Chromium-CDP touch skip                                                                                                                                                                            |
| Final reports suite          | 11/11 passed on final production candidate, including read-only prepared/revisit checks, delayed replay recovery, large evidence, lost-response retry, owner isolation, sandbox, generator/save/conflict/export and both widget modes |
| Packed standard integrations | 9/9 passed: four scenarios per framework plus actual export execution                                                                                                                                                                 |
| Downloaded proof             | 8 assertion-free reproductions passed;8 regressions failed at intended text assertions on buggy sites; the same8 files passed on fixed sites, unchanged hashes/retries0/no locator corrections                                        |
| Independent full mode        | 2/2 passed on installed-package React/Next: actual201 submission, heading/layout, field/password values, diagnostic HTTP 500, feedback and replay refresh                                                                             |
| Generated adapter proof      | 6 positive passes and 5 expected assertion failures, retries0                                                                                                                                                                         |
| Archive/consumer             | Archive check passed, isolated npm install passed, Node SSR-safe import and strict consumer TypeScript passed                                                                                                                         |
| Posters/reference            | Freshness passed;52 reference files passed; prototype and independent original fixture have no source diff                                                                                                                            |
| History review               | Known-format heuristic scan over 9 commits found no candidate files; tracked environment check found only example files. This is not a comprehensive secret-free certification.                                                       |
| Public release               | Preflight correctly fails six production configuration groups; no public gates enabled                                                                                                                                                |

Candidate archive: `unravel-sdk-0.1.0-903f912c663e.tgz`; SHA256 `903f912c663e83ce9707d37f645fa615bc973832f8559513f6e4061d4c452ba7`. Repacking after checks produced the same hash. Detailed generated evidence remains ignored in `.cache/standard-proof/`, `.cache/plan-adapters/` and `.cache/sdk-distribution/release-review.json`.

Inspected the final mobile report render and recaptured desktop poster. This is bounded visual review, not new physical-device performance/flicker certification. Existing loopback3000/3033 and their players were preserved. Temporary owned 3048/4218 and the earlier3049 preview were stopped;3049/4219 now use the final build.

## Intermediate failures and limits

The initial restricted Firefox run crashed before opening pages; normal-network/outside-restriction rerun passed. Initial report/standard checks retained older assumptions about hidden React copies, unsolicited player readiness, masked textarea content and omitted password-field actions. They were corrected to the approved current policy; final results above supersede those runs. New full-mode checks first targeted deliberately stripped `name`/`role` attributes; corrected them to inspect retained labels and visible feedback. No production attributes or permissions were expanded to satisfy tests.

The poster command's automatic approval review initially timed out; the permitted retry succeeded and all four captures completed before stamping. Some Clerk test teardown warnings report cancelled background requests after context closure; assertions passed. GitHub-hosted CI has not been run, and no real-phone/WebKit/arbitrary-site/hosted acceptance is claimed.

Synthetic reports from these tests remain clearly labelled where suites retain inspection evidence; only suites' own explicitly created evidence is deleted by their cleanup. Existing saved recordings remain immutable.

## Remaining gates

`@unravel/sdk` returned registry404 during the name check; this does not grant scope ownership. `npm whoami` returned 401 on 2026-11-16. Package remains private/unpublished. Owner must authenticate locally, establish the scope/name and approve the exact publish action. No token/password should enter chat or Git.

Free-tier proposal and commands are in RELEASE_CHECKLIST.md: two separate Node deployments, with cold-start/shared-hour limits. Provider choice, account access, edge controls, public HTTPS origins, production Clerk/webhook, database/backup settings and privacy/retention acceptance require actual hosted verification. A declaration flag is not a configured edge control. No provider resources were created.

## Approved scoped release follow-up

The owner completed npm login (whoami: vansham) and selected @vansham/unravel-sdk. Active imports/snippets/workspace and independent demo manifests now use the selected scope, preserving project IDs/origins. The initial401/old903f archive above are historical. Current candidate is vansham-unravel-sdk-0.1.0-ccd4a70bbe2c.tgz, SHA256 ccd4a70bbe2c68f286a8f61521784b49f3531ba441291e7079057d3b50fc5e1e. The workspace remains private; only the staged distribution is publishable, with no devDependencies/lifecycle scripts and registry-ready README. Archive validation and npm publish --dry-run passed; no publication occurred. A scoped production build .next-scoped-release16 passed and replaced the owned3049/4219 preview. Independent installs use --ignore-workspace and relative paths; accidental demo entries were removed from the workspace lockfile, and root/demo frozen installs passed. Scoped browser re-verification is recorded below when complete.

Scoped candidate re-verification completed: SDK Chromium/Firefox65 passed/one intentional skip; installed-package standard suite11/11 passed on .next-scoped-release16, including both full modes and unchanged8-file buggy/fixed proof.50 unit tests, lint, strict consumer types and SSR import passed. Manual demos use the new relative archive and independent frozen lockfiles; React build passed. Root frozen install contains no demo file-archive dependencies. npm dry-run validated the exact ccd4a70bbe2c archive (21 files,109087 compressed bytes); no registry publication was performed.

The free-tier review confirmed an additional operator prerequisite: Clerk production needs a DNS-controlled domain. Provider subdomains alone are insufficient; this is documented with official links in RELEASE_CHECKLIST.md. No domain purchase/authentication change or release-gate relaxation was performed.

## Publication approval and first attempt

Owner explicitly approved publishing the exact scoped0.1.0 archive. Full SHA256 matched before upload. npm10.9.3 with web authentication returned HTTP403: publishing requires2FA or appropriately configured credentials. Account2FA is disabled; registry lookup still returns404. No publication occurred. Owner must complete2FA locally; do not weaken account security or request authentication codes/tokens in chat. Retry of the unchanged approved artifact is authorized. Website remains truthful about local installation until actual registry publication/installation is verified.


## Approved npm release verification

Owner approval, account 2FA and local browser confirmation completed publication of @vansham/unravel-sdk@0.1.0 under MIT. Registry metadata/download were verified after indexing. Downloaded archive: 109087 bytes; SHA256 ccd4a70bbe2c68f286a8f61521784b49f3531ba441291e7079057d3b50fc5e1e, exactly the approved archive. Fresh .cache/sdk-registry-consumer installs plain version 0.1.0 with registry HTTPS resolution, without file/workspace aliases; SSR initialize/mountWidget exports and TypeScript passed.

First registry browser matrix: 10 integration/mode cases passed. Export proof failed one Next navigation fixed assertion: the controlled fixture enabled its button before fetching the fixed/buggy configuration. The fixture now disables configuration-dependent buttons until ready; no SDK/export locator changes or retries were added. A subsequent attempt was interrupted by an operator preview restart and failed with connection refused before cases ran. Final proof is recorded below when complete.

Website setup, package/root SDK documentation and both independent manual example dependency locks now use npm 0.1.0. New production build .next-npm-release16 passed; Chromium setup desktop/mobile, both snippets and refresh passed, zero page errors/viewport overflow. Screenshots inspected. React manual example build, root lint, web TypeScript and scoped formatting passed. Public hosting/auth/edge acceptance remains pending.

Final registry matrix with configuration-readiness fix included: **11/11 passed**, 2026-11-16T03:39:53Z proof timestamp. SDK distribution metadata explicitly names npm registry @vansham/unravel-sdk@0.1.0. Downloaded scripts: 8 reproduction passes, 8 expected buggy toHaveText failures, 8 fixed passes; identical hashes, retries0, locator corrections0. Consumer TypeScript passed again. Setup Copy install command copied the exact pinned npm command; scoped the browser locator to visible workspace to exclude hidden Next streaming copies. Final preview3051/player4221 remains available; temporary task preview3050/player4220 stopped. No package changes/republishing were needed.
