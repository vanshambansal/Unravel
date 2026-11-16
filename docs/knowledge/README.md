# Understand Unravel

A handbook for reading the code, explaining the design and preparing for a project interview. Start with the problem, then follow one report through the system. You do not need to memorize every file.

**Hosted portfolio scope:** the main app and isolated player are deployed. In-app React/Next demos now use workspace SDK authenticated same-origin delivery, restricted to signed-in project owners; general anonymous intake stays disabled. Older published-SDK verification results below describe their original environment. Independent examples still use npm 0.1.0. See [current demo setup](../SETUP.md#record-your-first-report).

## Choose a reading path

**First reading:** read the chapters below in order. At each code stop, find the named function and explain its input, output and responsibility before reading more.

**Before an interview:** read the [project briefing](project-context.md), inspect the system and schema diagrams, then answer the [interview questions](interview-questions.md) aloud. Return to a chapter when you cannot explain an answer in your own words.

**Explain the project elsewhere:** copy [project-context.md](project-context.md). It is self-contained; another person or AI does not need our internal conversations. Its final paragraph gives a useful instruction for continuing the discussion without inventing features.

**Walk through the repository:** read the [code tour](code-tour.md). It starts with the GitHub folders, explains the major routes/files and follows three working journeys through the code.

| Read                                                        | What you should understand afterward                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Project briefing](project-context.md)                      | What exists, who uses it, what it promises and what it does not.            |
| [Architecture](architecture.md)                             | Processes, stack choices, repository boundaries and how a request travels.  |
| [Database and backend](database-and-backend.md)             | Six tables, ownership, transactions, duplicate handling and edit conflicts. |
| [Recording SDK](recording-sdk.md)                           | Two evidence streams, instrumentation, lifecycle and privacy.               |
| [Replay and test generation](replay-and-test-generation.md) | Safe reconstruction, normalization, review and executable output.           |
| [Engineering decisions](engineering-decisions.md)           | Performance, failure recovery, tests, deployment and tradeoffs.             |
| [Interview questions](interview-questions.md)               | Short spoken answers, deeper follow-ups and honest personal preparation.    |

## The running example

A visitor enters a synthetic question. Clicking **Submit question** makes an intentional request return HTTP 500. The visitor records this interaction and submits a **bug report**, which is a separate request that should succeed.

The developer opens that report, inspects the replay and failed request, reviews reproduction steps and supplies the intended result: **the question should submit successfully**. A regression test should fail on the broken target and pass after a real fix. Merely observing the recorded 500 is not a correctness check.

Keep these three operations separate:

1. The target website's request fails.
2. Unravel's report submission stores evidence of that failure.
3. The exported Playwright test is run later by a developer.

## Words worth understanding

| Concept                                                              | Learn it here                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| SSR, hydration, Server Components, origin                            | [Architecture](architecture.md#concepts-you-need)      |
| Foreign key, JSONB, transaction, idempotency, optimistic concurrency | [Database and backend](database-and-backend.md)        |
| DOM snapshot, instrumentation, monotonic time, cleanup               | [Recording SDK](recording-sdk.md)                      |
| Sandbox, message bridge, locator, assertion                          | [Replay and generation](replay-and-test-generation.md) |
| Prefetch, deduplication, frame budget, test layers                   | [Engineering decisions](engineering-decisions.md)      |

## Read the claims correctly

Implementation descriptions were checked against repository source on **2026-11-16**. The [verification section](engineering-decisions.md#what-has-actually-been-verified) distinguishes earlier configured-workspace checks from the newer credential-free clean-checkout checks. Public hosting and fresh-service acceptance are not complete.

This handbook explains the code; [SETUP.md](../SETUP.md) owns installation/environment commands, and the [SDK README](../../packages/sdk/README.md) owns the public integration contract. Source wins if a document becomes stale. Update a chapter when its mechanism changes, then refresh the portable briefing and affected interview answers.

The short [architecture overview](../ARCHITECTURE.md) is for visitors who want a quick picture. These chapters contain the deeper explanations. There are no private-note links required to understand them.
