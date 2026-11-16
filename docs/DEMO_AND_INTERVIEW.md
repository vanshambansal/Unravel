# Demonstration and engineering walkthrough

Owner: portfolio presentation. Use synthetic data; public deployment/publication remains subject to DEPLOYMENT.md. Current verification is in PROJECT_STATUS.md.

## Five-minute demonstration

1. Open `/demo`, prepare your own project and choose React or Next.js. Explain that both use published SDK 0.1.0 and a registered origin; reports remain owner-private. Independent external integration examples are also retained.
2. Open the reporter. Explain Mask entered values versus Full-content recording. Choose masking, start and reproduce the intentional question-submit HTTP 500. Trigger the separate JavaScript error; stop and submit.
3. Open the saved report. Replay and seek to an action, request and error. Show readable labels, status/timing and available error location. Explain that network metadata is evidence, not a backend root-cause diagnosis.
4. Open Reproduction & test plan. Review actions, replace masked inputs with synthetic test values and define the intended successful outcome. Show steps, JSON and Playwright sharing one reviewed plan.
5. Download the actual test. Run it against buggy and fixed fixture variants without editing the file. Point to the intended assertion failure, then the pass and unchanged hash. A prepared proof is different from a live run; label it accordingly.

Recovery demonstrations: lost response followed by unchanged retry/one report; unavailable player followed by Retry; report refresh; stale draft recovery. Do not remove user data to stage a demonstration.

## Explain the important concepts

| Concept                   | Explanation and code entry point                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Explicit lifecycle        | `packages/sdk/src/recorder.ts` owns start/stop/destroy, cancellation tickets, limits and cleanup. Importing does not record.                                                                    |
| Two evidence streams      | rrweb supplies reconstructable DOM changes; `events.ts` supplies semantic actions/errors/navigation and `network.ts` supplies fetch/XHR metadata. Relative and epoch timestamps are correlated. |
| Instrumentation ownership | Wrappers forward original behavior and restore a function only if they still own it, avoiding overwriting later instrumentation.                                                                |
| Capture policy            | `privacy.ts` handles selected modes; `replay.ts` and `presentation.ts` reconstruct supported content/styles. Masked mode does not infer private text already rendered outside fields.           |
| Untrusted ingestion       | Server schemas and `server/reports/validation.ts` independently validate and reconstruct bounded inert evidence. Origin registration is not authentication.                                     |
| Retry correctness         | `submission.ts` freezes the envelope. Transactional storage uses recording identity plus canonical digest to return the same report or reject conflicting reuse.                                |
| Authorization             | Private repository queries join project ownership. Knowing a project/report ID does not grant access.                                                                                           |
| Replay isolation          | Dashboard messages go to an exact separate trusted origin/channel. rrweb's recorded-document frame cannot run recorded scripts or submit forms.                                                 |
| Generation                | `packages/test-plan/src/normalization.ts` folds observed actions; `schema.ts`/`validation.ts` constrain plans. `playwright.ts` exports code, not an execution result.                           |
| Intended behavior         | A recorded failure cannot establish correctness. The developer supplies assertions and safe inputs. Structural selectors still need review.                                                     |

## Honest resume wording

Adapt these after the corresponding release gate is verified:

- Built a TypeScript browser SDK and Next.js investigation dashboard that correlate DOM replay, user actions, JavaScript errors and network metadata.
- Implemented transactional report ingestion with owner authorization, bounded validation and idempotent retry handling, plus isolated session replay.
- Developed a versioned, editable test-plan pipeline that exports Playwright reproduction/regression tests with developer-confirmed assertions; verified unchanged exports against controlled buggy/fixed applications.

Do not claim universal website fidelity, automatic root-cause detection, AI generation, production scale or hosted deployment before those claims are verified. npm publication and registry installation are verified; public application hosting is still pending. Avoid reporting idle animation scheduling as rendered FPS.

For the code demonstration, follow [CODE_WALKTHROUGH.md](CODE_WALKTHROUGH.md). The in-app demo remains local until the deployment phase is completed.
