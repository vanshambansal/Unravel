# Start here in a new conversation

Updated 2026-11-12. This is a navigation/handoff note; PROJECT_STATUS.md owns current implementation and verification facts. Previous chat history is not required to continue.

## Read and inspect

Read root AGENTS.md, PROJECT_STATUS.md, PROJECT_BRIEF.md, ARCHITECTURE.md and DECISIONS.md. Inspect Git and actual source before acting. For UI read DESIGN.md/INTERNAL_UI.md/LANDING.md; for recording read SDK.md/REPORTS.md; for generation read TEST_PLANS.md. README owns commands. The latest detailed results are audits/AUTH_RESPONSIVENESS_2026-11-12.md; earlier feature results are in audits/DEFECTS_LANDING_2026-11-12.md. Historical logs are optional, not a required context dump.

## Latest continuation

Read [the authentication/responsiveness continuation](audits/AUTH_RESPONSIVENESS_2026-11-12.md) first. Local production3020 login now works: the user confirmed Google and email-code. The original agent-started preview had restricted outbound networking; protection-subdomain DNS warnings were not established as the cause. The normal-network final preview uses `.next-responsive-complete` with isolated replay4191. Normal cinematic rendering and shader improvements are preserved. Internal interaction optimizations are implemented and focused workflows passed; cold database latency and whole-app perceived smoothness remain unresolved. Next bounded task: correlate an actually slow authenticated request with numeric Server-Timing/storage diagnostics, then address its demonstrated cause. The user authorized a local checkpoint commit on 2026-11-12. No push, deployment, provider/security changes or provisioning are authorized.

## Where we stopped

The user authorized defect fixes followed by completion of the landing. Both are implemented locally; the new landing still needs the user's aesthetic review. Preserve the accepted cinematic scene and A internal/B authentication direction. Do not restart design exploration or rewrite the working pipeline.

Recent work corrected SVG-child clicks and native multiple selects through recording/replay/export, prepared signed account-closure intake blocking with retained evidence, refined investigation/onboarding/navigation, and completed the landing story/diagnostic zoom. See status for actual browser outcomes and intermediate failures. Eight independent React/Next reproduction exports ran; unchanged regressions failed against bugs and passed after fixes. These are controlled cases, not arbitrary-site guarantees. No further implementation is currently in progress.

## Remaining work (resume here)

- [ ] **Next bounded task: cold authenticated request latency.** Reproduce the multi-second generator/navigation delay in GPU-accelerated production Chrome. Correlate numeric Server-Timing and safe storage diagnostics with connection acquisition/query waits; fix the measured cause and compare cold/warm runs. Warm plan reads230-346ms do not explain away the observed3996ms generator load. Do not provision or reconfigure a database/provider without discussion.
- [ ] **Consistent cinematic smoothness.** Preserve shader-startup gains; investigate remaining steady scroll/frame spikes on capable hardware. Measure real frame behavior before changing effects or quality. Full-app perceived smoothness still needs user acceptance.
- [ ] **Physical constrained devices and broader browser coverage.** Test an actual low-end phone/desktop, memory pressure, software keyboard, reduced motion and long sessions. Current CPU/network simulations use a real laptop GPU, not a physical low-end GPU/RAM test. Safari, screen readers and full Firefox auth/product workflows remain unverified.
- [ ] **Product/design and independent installation review.** User reviews the landing/internal experience and performs one clean separate-site installation with displayed instructions. Resolve reproducible defects without an unapproved redesign. A polished public demo remains future work; controlled independent fixture tests already pass.
- [ ] **Release decisions and setup, only with approval.** Agree app/replay HTTPS topology, live Clerk domains/keys/recovery, signed account-closure webhook delivery/retries, edge abuse protections, privacy/retention/backups, license/notices and SDK publication. SERVICE_SETUP.md/DEPLOYMENT.md own these gates. Local Google/email-code login is already user-confirmed; hosted login is a separate gate.
- [ ] **Hosted acceptance after approved setup.** Verify real provider/recovery/webhook delivery, private ownership/persistence/replay isolation, independent hosted capture and unchanged exported regression execution. Local focused workflow/proof passes do not establish public readiness.

Keep the replay seek target at500ms and investigate misses on representative recordings; do not raise it to disguise latency. Test original evidence as immutable and require developer-confirmed expected assertions. Detailed completed checks, negative results and limitations belong to the linked audits.

Custom controls, full reloads, Shadow DOM/frames, resource fidelity and concurrent/delayed assertions retain documented support limits. Completion does not require silently expanding all of those into new features.

## Working state and safeguards

The user requested a local checkpoint of all progress to this point on 2026-11-12. This checkpoint includes the earlier report/release/landing work and the authentication/performance continuation. Inspect Git on resume; do not reset, clean, discard, commit again or push automatically. Local screenshots, credentials, caches, generated outputs and session artifacts remain outside the commit.

Latest verified services: development3000, fixture4184, local production3020 and its isolated replay4191 returned200. Existing development replay4192 is independent. Services may stop between sessions; inspect ownership before starting/terminating anything. The final preview uses `.next-responsive-complete`; README documents rebuilding and the matched `preview:local` runner from a normal-network terminal. Generated output/artifacts remain ignored. Earlier process-local successful-DNS caches were verification workarounds, not production defaults; do not reuse stale cached addresses.

No Docker, public deployment, npm publication, new services or data destruction was performed/authorized by the completion task. The user wants discussion before consequential product/architecture/security/design choices, and autonomous routine implementation with actual browser verification afterward.

## Suggested opening message

> Continue Unravel from docs/HANDOFF.md. Read the linked current documents and inspect the repository/Git first. Summarize what is complete and the remaining release/demo work. Help me choose the next bounded task; do not redesign the approved landing, provision services, publish, commit or delete work without agreement. Judge completion by actual browser journeys and executable exports, not test counts.
