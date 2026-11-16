# Interview preparation

Use these as answer guides, not a script to memorize. Close the answer, explain it aloud, then open the linked code or chapter. For personal questions, replace the preparation prompts with your actual experience. Do not claim work or measurements you cannot explain.

## Product and project story

### 1. What is Unravel? Give a 30-second introduction.

Unravel helps turn a browser bug report into reproducible evidence. A visitor explicitly records the issue; a developer reviews the replay, actions, errors and network metadata, then reviews a test plan and exports Playwright. The important boundary is that recorded behavior shows what happened; the developer must say what should have happened. See the [project briefing](project-context.md).

### 2. How would you explain it in two minutes?

Start with the problem: a screenshot and “it broke” often omit the sequence and failed request. Walk through a synthetic question submission returning HTTP 500, capture, private storage, isolated replay, reviewed steps and an expected success assertion. End with the unchanged-test fail-before/pass-after proof and the limits: supported DOM replay, human review and public deployment still pending. Use the [architecture diagram](architecture.md#the-system-at-a-glance) rather than listing every dependency.

### 3. Who uses it, and do visitors need an account?

Developers sign in to manage projects and read their reports. A visitor on an integrated website can start and submit a recording without an Unravel account. Public intake therefore needs validation and abuse controls; a public project identifier is not a secret. The [backend chapter](database-and-backend.md) explains the different trust boundaries.

### 4. Why not just use a screenshot, video or manually written test?

A screenshot misses the sequence; a video usually lacks structured actions and correlated request/error metadata. A manual test can be excellent but requires reconstructing that sequence. Unravel connects those tasks, while still requiring a developer to review locators and expected results. It does not replace all debugging tools or guarantee lower debugging time for every bug.

### 5. What did you build yourself, and what came from libraries or assistance?

rrweb supplies DOM recording/reconstruction primitives; Playwright supplies browser automation; Clerk supplies identity. Project-specific logic connects privacy, semantic instrumentation, ingestion, ownership, retry behavior, timeline review and deterministic plan generation. Explain the actual code you understand and disclose assistance honestly; do not describe a dependency's engine as your own implementation. Use the [SDK responsibility table](recording-sdk.md) to prepare.

## Architecture and core concepts

### 6. Why use Next.js instead of a separate React and Express application?

It puts routing, server rendering and HTTP handlers in one application while keeping feature, service and repository modules separate. That suits the current project without introducing a second backend deployment. It does not make every route fast automatically; service latency and browser work still matter. See [stack choices](architecture.md).

### 7. What are SSR and hydration, and why can hydration fail?

SSR produces initial HTML on the server. Hydration attaches React behavior to matching browser markup; incompatible server/client initial output can trigger recovery and warnings. Browser-only SDK startup belongs in a lifecycle effect, not rendering. Explain how you would compare the initial markup and find the mismatch rather than hiding the warning. See [core concepts](architecture.md#concepts-you-need).

### 8. What is the difference between TypeScript and runtime validation?

TypeScript helps check code before it runs; an arbitrary HTTP request does not become safe because an interface exists. Zod schemas check incoming data at runtime, including shapes, enums and limits. Both are needed because the SDK/server boundary is untrusted.

**Follow-up:** A valid schema is only one boundary. Ownership, size limits and supported inert replay content still need enforcement.

### 9. Why use workspaces and shared packages?

The SDK, contracts and test-plan generator have separate responsibilities and can share typed definitions without copying them into the app. The public SDK is separately packaged; it does not require Next.js. Workspaces help development, but independent npm consumer tests are still needed to catch packaging assumptions. See the [repository map](architecture.md#repository-map-important-boundaries).

### 10. Are the React and Next.js demos actually different integrations?

Yes. The Next demo is an ordinary application route; the React demo serves an independently built React document with no Next runtime. Both use a published-package alias and the same scenario UI. External examples separately exercise npm installation and environment configuration. See [demo boundaries](architecture.md).

### 11. Trace one report through the application.

The widget collects bounded evidence, freezes a submission and sends it to intake. The server validates it, resolves the registered project and transactionally stores metadata and payload. An authenticated owner then reads the report; the viewer sends replay evidence to the isolated player and the generator creates a reviewable plan. Trace this in the [architecture](architecture.md) and [backend](database-and-backend.md) chapters.

## Recording, privacy and browser behavior

### 12. Is a recording a video?

No. It contains a supported DOM snapshot/change stream plus a semantic event stream. rrweb reconstructs supported page changes; semantic events make actions and diagnostics useful for a timeline and test plan. This can be smaller and more structured than video, but fidelity and resource support are limited. See [recording streams](recording-sdk.md).

### 13. Why maintain two evidence streams?

A low-level DOM mutation tells the player how the page changed, not necessarily which user action should become a test step. Semantic events describe actions, navigation, errors and requests in a form the generator can process. Correlating their times helps a developer connect visible failure with surrounding evidence.

### 14. How are fetch and XMLHttpRequest tracked without breaking the website?

Wrappers call the original browser behavior and collect bounded metadata around it. Cleanup restores a wrapper only when Unravel still owns that installed wrapper, avoiding removal of another library's later patch. The capture excludes network bodies, headers and cookies. Read the [SDK lifecycle and instrumentation](recording-sdk.md) before claiming transparent support for every possible patch combination.

**Follow-up:** HTTP 500 normally resolves a fetch response; it is not necessarily a rejected promise. Network metadata and uncaught JavaScript errors are different evidence.

### 15. What do the two widget privacy modes do?

Masked-values mode hides field values while preserving ordinary page text and structure. Explicit full-content mode can include sensitive entered values where supported. Both keep bounded diagnostic messages/URL paths, and both exclude hidden inputs, blocked sections, SDK UI, request bodies/headers/cookies and URL queries/fragments. Neither promises to automatically identify every private value rendered as ordinary page text. See the [privacy policy explanation](recording-sdk.md).

### 16. Does masking change the real website or only the recording?

It must transform captured evidence without rewriting the live page that React or the visitor is using. Otherwise privacy code could break layout, interaction or hydration. Test the live page as well as the reconstructed replay, including dynamic content and both modes. Previously removed information cannot be recovered from a stored masked report.

### 17. Why use performance.now() for event offsets?

It measures elapsed time using a monotonic clock, so wall-clock adjustments do not reorder the sequence. Calendar time still identifies when a session started. The player and timeline use relative offsets; request durations and navigation timing must remain consistent with that recording clock.

### 18. What happens if someone stops while asynchronous startup is pending?

A generation ticket prevents an obsolete startup from activating later. A single active-recorder guard and owned cleanup protect against duplicate capture and leaking browser hooks. Explain the state transitions and test start/stop/unmount/restart, rather than relying on one successful recording. See [SDK lifecycle](recording-sdk.md).

**Follow-up:** In React development, Strict Mode can expose repeated setup/cleanup. Do not fix duplicate hooks by disabling that check.

### 19. What websites or interactions are not fully supported?

Full document navigation ends the current capture; canvas, cross-origin frames, Shadow DOM and complex controls do not have universal replay/test support. Duration, event and byte limits also bound capture. The honest answer is a documented supported subset with explicit review, not arbitrary-site compatibility.

## Database, APIs and concurrency

### 20. Why PostgreSQL, and why JSONB as well as relational columns?

Projects, ownership, recording identities and revisions benefit from relational constraints and transactions. Variable evidence and plans fit JSONB after runtime validation. Splitting large replay/event payloads from report metadata avoids loading them for every list. See the [schema](database-and-backend.md).

### 21. Explain the six tables and their relationships.

Projects own reports; each report has a payload and may have a saved test plan. Ingestion budgets count project intake attempts, while account intake blocks prevent later submissions for a deleted identity. Clerk manages identity outside this schema; it is not a seventh application SQL table. Explain the [ER diagram](database-and-backend.md#schema-at-a-glance) and the reason each table exists.

**Follow-up:** A foreign key ensures a payload's report exists; the insertion transaction supplies the stronger application invariant that an accepted new report also receives its payload.

### 22. How do you prevent one developer reading another developer's report?

Server reads and mutations resolve the authenticated developer and check ownership through the project relationship. UI hiding and unpredictable UUIDs are insufficient. Public recording intake is a separate capability and must not grant private report access. Test both unauthorized reads and writes.

### 23. Why isn't CORS enough to secure ingestion?

CORS limits what browser JavaScript can read across origins; a non-browser caller can forge an Origin header. Registered origins reduce accidental/misconfigured submissions, but are not identity authentication or complete abuse prevention. Payload caps, budgets and deployment edge controls have different responsibilities.

### 24. What if the server saves a report but the response is lost?

The visitor cannot know whether it committed. The widget retries the frozen recording identity/body; the server compares the existing recording's canonical digest and returns the same report for the same evidence. Different content under that identity conflicts instead of silently replacing the original. See [retry handling](database-and-backend.md).

**Follow-up:** This is bounded idempotent storage while that identity remains retained, not an unlimited exactly-once-delivery guarantee. Attempts can still consume intake budget.

### 25. Why use both a transaction and a unique constraint?

A transaction commits report metadata and payload together or rolls them back. The project lock coordinates related checks, and the unique project/recording constraint remains a database-level duplicate guard. A prior JavaScript lookup alone can race with another request. Trace the [insertion sequence](database-and-backend.md) to explain all three roles.

### 26. What if two tabs save the same plan?

A save includes the revision it read. The database update only succeeds if that revision is still current, then increments it; a stale save receives a conflict. The first save uses insert-on-conflict behavior for the unsaved revision-zero case. This is optimistic concurrency: detect competing edits and preserve the draft for recovery, rather than silently overwrite.

**Follow-up:** Keeping an edit form open must not hold a database lock for minutes. Revision comparison happens when the save arrives.

### 27. How would you reason about list/query performance?

List queries select bounded metadata with pagination and owner/project/status filters, not replay blobs. Appropriate indexes help supported filter/order patterns, but a normal B-tree does not automatically accelerate arbitrary substring search. Inspect query plans and timings before adding indexes or introducing a cache. See [queries and indexes](database-and-backend.md).

## Replay and test generation

### 28. Why host replay on a separate origin?

Captured page content is untrusted and should not inherit the authenticated dashboard's origin. A trusted player runs separately; its inner recorded-document frame has scripts and forms disabled. This limits what reconstructed content can do even if evidence is hostile. See [replay isolation](replay-and-test-generation.md).

### 29. How do you trust postMessage events?

Check the exact sender origin, source window and per-mount channel, validate the message shape and send to an explicit target origin. A familiar message type alone is not authentication. Also distinguish permissions needed by the trusted player from permissions forbidden to the recorded document.

### 30. How do raw events become useful reproduction steps?

Deterministic normalization folds repeated fills, focus clicks and closely associated click/submit events. It treats some recent SPA transitions as consequences using a bounded heuristic, while unknown targets and unsupported cases need review. The source recording stays immutable; the plan is a separate editable interpretation. See [normalization](replay-and-test-generation.md#from-semantic-events-to-a-plan).

**Follow-up:** Explain why blindly exporting both a click and its resulting submit/navigation can perform the action twice. Time proximity is a heuristic, not proof of causality.

### 31. Does Unravel use AI to generate tests?

The current generator is deterministic and schema-driven, with no LLM service. This makes supported transformations inspectable and repeatable, but it cannot infer business intent from a failed recording. The developer supplies safe values, reviews locators and confirms expected behavior.

### 32. Why can't you infer expected results from the recording?

The recording contains the bug: repeating its error would preserve the wrong behavior. Reproduction repeats the reviewed sequence; regression mode additionally requires confirmed assertions about the intended outcome. An HTTP success alone can also be insufficient if the expected business result never appears.

### 33. What makes an exported locator or test usable?

It must identify the intended target reliably in the actual application, use safe data and wait for meaningful conditions. Syntax validation cannot prove selector uniqueness or runtime stability. The exported file still needs a configured target and appropriate authentication/data; export does not execute or certify it.

**Follow-up:** Response assertions must start listening before the relevant action and match a new response, rather than accidentally accept an earlier request.

### 34. How did you verify a regression test actually detects a bug?

Run the actual downloaded file against the broken target and confirm failure at the intended assertion. Fix the target, then run the unchanged file and compare hashes; a locator/setup failure is not valid bug detection. The controlled local proof recorded eight intended buggy failures and eight fixed passes without retries or locator corrections. Keep this scoped to the [dated verification evidence](engineering-decisions.md#what-has-actually-been-verified).

## Performance, delivery and personal preparation

### 35. Why can a Next.js application still show loading states?

SSR helps initial delivery but does not remove database, provider or navigation latency. Persistent layouts, selective prefetching and short-lived request reuse reduce repeated work; cold or invalidated reads still need recovery/loading UI. Unravel keeps private APIs authenticated and no-store rather than globally sharing private evidence. See [navigation performance](engineering-decisions.md#navigation-and-data-work).

**Follow-up:** Prefetch begins likely work early; deduplication shares work already underway; caching reuses a completed result. Explain their lifetime and invalidation instead of using the words interchangeably.

### 36. How would you investigate animation hitches?

Separate network delays from CPU, GPU, layout and scheduling work. At 60 Hz the approximate frame budget is 16.7 ms, and occasional slow frames can feel bad despite a good average. Trace sustained scrolling, direction changes and hidden/visible transitions before changing scene quality. Describe measured results only for the tested environment.

### 37. What tests matter most, and what remains unverified?

Combine pure-policy tests with real SDK browser checks, configured database/auth workflows, independently installed consumers and actual exported-test execution. A fresh tracked-files-only checkout has passed credential-free installation/build checks, but its dedicated Clerk/empty-database acceptance remains pending. Public application deployment is also pending. See the [test layers and dated results](engineering-decisions.md).

### 38. What was the hardest part, or a mistake you learned from?

Prepare one real example: ambiguous delivery after a lost response, replay structure damaged by masking, or a stale plan edit. State the symptom, the evidence you inspected, the cause you actually confirmed, the fix and a recovery test. Choose a case you personally understand; the handbook's examples are preparation material, not a fabricated personal history.

### 39. What would you improve next, and how would you avoid overengineering?

Complete fresh-service and hosted workflow acceptance before adding features. If evidence later shows payload storage or replay coverage is the bottleneck, evaluate a targeted change and explain its cost. Do not claim Redis, queues, object storage or hosted test execution already exist. See [release boundaries](engineering-decisions.md#production-and-future-changes).

### 40. How will you demonstrate this project confidently?

Use synthetic data in your own demo project, record the intentional failure, submit it, refresh the saved report and inspect replay plus diagnostics. Review safe values/expected assertions and show a downloaded test's execution. Keep a bounded fallback recording/test proof for service outages and state what is live versus prerecorded. Be ready to open the relevant source and explain one lifecycle, transaction and generator path without reading a script.

## Final rehearsal

Pick any answer and ask: **Why this approach? Where is the code? What happens on failure? What did I actually verify?** A strong explanation connects those four questions. If you cannot do that yet, return to the relevant chapter and run the supported workflow yourself using [SETUP.md](../SETUP.md).
