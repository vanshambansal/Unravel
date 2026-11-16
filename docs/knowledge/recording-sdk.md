# Recording SDK: observing the browser deliberately

## Explain it simply

The SDK is a small program integrated into a website. The widget gives the visitor controls. The recorder gathers evidence only after Start. Two streams describe the same time interval: what the DOM looked like, and what meaningful actions/errors/requests occurred.

The **DOM** is the browser's tree of elements and text. A DOM recording describes changes to that tree; it is not a screen video.

## Integration and lifecycle

The [public entry](../../packages/sdk/src/index.ts) exports the full `mountWidget` workflow and lower-level `initialize` recorder. Ordinary developers use the widget; they do not need to design a recording form themselves.

```tsx
useEffect(() => {
  const widget = mountWidget({ projectId, applicationOrigin });
  return () => widget.destroy();
}, [projectId, applicationOrigin]);
```

This fragment assumes valid stable settings and an imported `mountWidget`; see the [complete integration](../../packages/sdk/README.md). `applicationOrigin` is Unravel's service origin, not the website being recorded. A project ID is public configuration, not a password.

Importing is SSR-safe. Calling browser initialization during server rendering is not. Effects run in the browser; their cleanup prevents abandoned observers, duplicate UI and later events after unmount. React Strict Mode can exercise setup/cleanup more than once in development, so cleanup must work.

The recorder has `idle`, `starting`, `recording`, `stopped` and `destroyed` states. Widget views such as description/retry are a different UI state machine. Minimize is not Stop; Stop freezes evidence; sending is a separate explicit action.

Async recorder loading can finish after cancellation. A generation/ticket check makes that late result obsolete and disposes it rather than reviving capture. Only one active recorder owns the shared browser instrumentation at a time.

## What rrweb does and what Unravel does

| Responsibility                                                                                 | Owner                              |
| ---------------------------------------------------------------------------------------------- | ---------------------------------- |
| DOM snapshot/change observation and reconstruction primitives                                  | rrweb recorder/replayer libraries. |
| Capture lifecycle, privacy policy, bounded supported representation and presentation filtering | Unravel around those primitives.   |
| Readable actions, fetch/XHR metadata, errors and navigation evidence                           | Unravel instrumentation.           |
| Widget, submission/retry, server validation/storage and private investigation UI               | Unravel.                           |
| Developer-reviewed test plan and Playwright output                                             | Unravel's generator/editor.        |

Do not claim to have written rrweb or a complete browser rendering engine. The engineering work is integrating primitives into a bounded, reliable workflow with clear trust boundaries.

## The two evidence streams

**Replay evidence** begins with a supported full snapshot and continues with changes. Without an initial structure, later element updates would not describe a complete starting page. Sanitization removes unsupported active content; allowed presentation values help reconstruct layout.

**Semantic evidence** records actions such as click, fill, selection and checking a control, plus navigation, network metadata and errors. These events drive readable timelines and plan generation. They are separate from every low-level mouse/DOM event rrweb might observe.

Element targets use bounded identification rules. Explicitly allowed test IDs are stronger than structural CSS paths. A structural path means “this element in this markup,” not “a permanent identifier across every redesign.” Public labels improve readable descriptions without automatically proving a test locator is unique.

## What happens during an interaction

1. Start records initial URL/time and installs owned capture hooks.
2. Typing produces input evidence; submitting can produce both click and submit evidence.
3. The request wrapper observes method/path, status/outcome and duration.
4. Error listeners observe uncaught errors and unhandled rejections where supported.
5. Each item receives relative timing so the workspace can correlate it with replay.
6. Stop removes hooks, freezes the recording and exposes its completion/limit status.

A relative clock based on `performance.now()` measures elapsed intervals without depending on wall-clock adjustments. An epoch start time gives calendar context. Correlation does not prove that a nearby request caused an error.

## Instrumentation must preserve the host website

**Instrumentation** means wrapping or observing existing browser behavior to collect information. A fetch wrapper must still forward the original arguments/result/error. XHR hooks must preserve normal request behavior. Neither should read response/request bodies for this policy.

Cleanup restores a wrapped function only if the SDK still owns that wrapper. Otherwise it could overwrite another library installed afterward. Consumer callbacks are guarded so a UI exception cannot break recorder cleanup.

Network failures, HTTP errors and JavaScript errors differ. An HTTP 500 can arrive as a normal HTTP response without `fetch` rejecting. A caught exception is not necessarily emitted as an uncaught page error. Cross-origin errors may expose incomplete information. The SDK does not have access to server logs or backend stack traces.

## Privacy: the actual two modes

| Data                                                      | Mask entered values     | Full-content recording             |
| --------------------------------------------------------- | ----------------------- | ---------------------------------- |
| Ordinary displayed page text                              | Visible.                | Visible.                           |
| Field values, including sensitive fields where capturable | Masked.                 | Included after explicit selection. |
| Error messages and URL paths                              | Included within bounds. | Included within bounds.            |
| Hidden inputs, SDK UI, developer-blocked sections         | Excluded.               | Excluded.                          |
| Network bodies, headers, cookies, URL queries/fragments   | Excluded.               | Excluded.                          |

A greeting such as “Welcome Vansh” or an entered value echoed into ordinary page text can remain visible in masked mode. This is not automatic personally identifiable information detection. Use synthetic data for demos; applications should mark sections with `data-unravel-block` when those sections must be excluded.

The widget chooses a mode per recording. The low-level recorder, when called without a mode, retains a legacy selector-based policy; do not assume every direct `initialize()` caller gets exactly the widget default. Previously redacted evidence cannot be reconstructed by changing a later setting.

Presentation capture is also bounded: it samples allowed computed style values rather than copying arbitrary stylesheet/resource access. Care is needed with dimensions: flattening flexible/auto dimensions into fixed values can break later layout changes. This helps explain why replay fidelity needs real scenario tests.

### Why an animated page can look empty in replay

A page can insert a heading at `opacity: 0`, then fade it into view using CSS. The DOM tree does not necessarily change during that fade. Recording only DOM mutations can therefore preserve the invisible starting state, even though navigation and the heading itself were captured.

SDK 0.1.1 adds a [presentation observer](../../packages/sdk/src/presentation-observer.ts). While recording, it checks active animations and queues elements affected by DOM, interaction, viewport and supported preference changes. Every 125 ms it reads at most 60 elements and emits changed, allowed styles through the existing replay stream. It also revisits ancestors when content grows, because some browsers expose fixed pixel dimensions. Stop removes the observer, timer and listeners.

This preserves the separate replay origin and disabled scripts. It does not execute captured animations or copy arbitrary CSS. It is bounded visual sampling, not frame-perfect video: very short effects, unsupported resources, canvas and complex rendering can still differ. Existing integrations must upgrade the SDK and redeploy their website to receive this behavior; self-hosted services must also use the compatible server validator. Old recordings cannot recover visual updates that were never captured.

## Limits and delivery

Defaults are 120 seconds, 5,000 combined events and approximately 5 MB of recording data. Custom recorder limits have supported ranges; a separate complete-request 5 MB cap still applies on submission. A report can exceed that cap after its envelope/description is added, so “capture was under budget” is not enough.

Limit stops are surfaced as partial/truncated capture where applicable. Full-document navigation ends the supported recording interval; continuing through an entirely new document is not promised.

Submission freezes the first envelope, shares an in-flight request and uses a bounded timeout. An unchanged retry preserves recording identity. A client timeout/abort does not prove the server rolled back; that is why [server idempotency](database-and-backend.md#why-retry-does-not-create-two-reports) matters.

## Code stops and teach-back

Read [recorder](../../packages/sdk/src/recorder.ts), [events](../../packages/sdk/src/events.ts), [network](../../packages/sdk/src/network.ts), [privacy](../../packages/sdk/src/privacy.ts), [replay sanitizer](../../packages/sdk/src/replay.ts), [submission](../../packages/sdk/src/submission.ts) and [widget](../../packages/sdk/src/widget.ts) for each mechanism above.

Explain: Why are two streams useful? Why should teardown not restore every function unconditionally? Why is an HTTP 500 not necessarily a thrown exception? Which private values can remain visible even in masked mode?
