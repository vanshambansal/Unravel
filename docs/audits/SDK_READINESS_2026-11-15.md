# SDK repair and readiness verification

Owner: recording SDK/report integration. Scope: the user's broken full recording, unreadable diagnostics, widget text/recovery and independent React/Next consumers. This is local verification, not public-release certification.

## Causes and changes

- React's configured dashboard3033 was stopped. The browser could not deliver a report. Restarted the existing local dashboard and paired isolated4195 using existing credentials; no provider provisioning.
- Explicit masked/full modes still inherited legacy diagnostic allowlists. Both now include bounded error messages and URL paths. Headers, bodies, cookies, URL queries/fragments remain excluded. Legacy initialize without a mode retains its earlier opt-ins. Messages/paths can themselves contain user text; the widget and setup explain the policy.
- Native details/dialog open state was dropped, and dialog was converted to a div. Preserve the native tag, open attribute and rrweb modal/non-modal marker through SDK/server validation. rrweb requires open as an empty string rather than boolean true; final real replay verified open=true and :modal=true. No recorded scripts/forms enabled.
- Computed pixel heights froze initially auto-growing containers. Retain auto/percentage width/height through Typed OM when available; unsupported browsers keep resolved sizing. Preserve intentionally fixed clipped-demo dimensions.
- Widget source contained mojibake in preparing/sending/optional-details text. Replaced it with clean text, clarified service failure, added a discard exit from retry and warned that discarding local content cannot undo a report already delivered. Retry remains the same frozen envelope.
- Replacing an unchanged tarball path could retain stale consumer contents. sdk:pack now also prints an immutable hash-suffixed archive. Both independent apps consume the same final artifact; installed ESM SHA256 matches the shared SDK: d62b2337845c711305c87504b1ba107fcc1813db21efe53349d36d881beae2c7.
- Error details now expose the available filename and line/column alongside the message/source. Existing recordings cannot recover omitted text or native state.

## Actual checks

| Workflow | Result |
| --- | --- |
| Shared SDK/widget Chromium + Firefox suite | 65 passed, one Firefox Chromium-CDP touch case intentionally skipped |
| Final native-state/diagnostic/recovery regression | 14/14 passed across both browsers |
| Real response-loss pipeline | Passed: committed report, lost response, unchanged retry, one receipt/report, other-owner denial, replay seek and test-owned cleanup |
| Independent React actual capture | Both modes submitted with201 and opened in authenticated saved reports |
| React interactions | HTTP500 form, field/password input, category, filters, completion toggle, modal, disclosure, tabs, echoed heading, dynamic content, notification and intentional JS error exercised |
| Final native modal | Saved replay open=true, modal=true,500x273; heading and surrounding page retained in both modes; screenshot inspected |
| Masked/full values and diagnostics | Masked password redacted; full synthetic password retained; both include /api/question, HTTP500, JS message and file position |
| Independent Next package | Both picker/start/minimize/form500/stop/review/details/discard/reset paths passed; real Next submission not additionally claimed |
| Mobile/refresh |390px picker/report without horizontal overflow, readable controls; saved replay ready after refresh |
| Static checks | Repository TypeScript, focused lint,48 unit tests and isolated production build passed; final preview uses .next-sdk-native15 |
| Public release preflight | Failed as expected: current local development deployment is not publicly configured |

Six synthetic React reports from iterative diagnosis remain under the user's React project. Earlier pairs exposed missing/incorrect native-open replay; they are immutable diagnostic evidence. Use the latest two titled **SDK verified native state**:

- Masked: e9794e6e-02d8-4ce6-b320-666060790745
- Full: dc6cc714-b8d1-4e6c-84af-21e9cd3c61a7

Both are in project13fc2e43-866c-437a-bd19-e7509f208986 on dashboard3033. No user reports were deleted or rewritten. Automated pipeline owns its temporary synthetic report cleanup.

## Limits and failures retained

Initial runs used a production-only lab URL, then encountered an existing Next development-server lock; reran against verified development3000. Earlier text-sensitive assertions failed after copy changes; restored the relevant widget phrase and made the pipeline retry assertion case-insensitive. Native-state inspection found that boolean open was ignored by rrweb; fixed and reran native checks plus actual persistence/replay. An initial shell edit/lint attempt failed and was corrected. Final results above supersede those intermediate failures.

This is bounded DOM replay, not video or arbitrary-site visual fidelity. External images/fonts/stylesheets, pseudo-content, arbitrary CSS, shadow/canvas/cross-origin content and full-navigation continuity remain limited or unsupported. Resolved-size fallback on browsers without Typed OM can still constrain complex dynamic layouts. Physical phones, WebKit and arbitrary third-party applications are not certified by these checks.

Public HTTPS dashboard/replay origins, production authentication, delivered signed account webhook, edge abuse/timeout controls, retention/privacy review and package license/notices/versioning/publication remain gates in [DEPLOYMENT.md](../DEPLOYMENT.md). No automatic public deployment or npm publication was performed.

Running local services: dashboard3033 + isolated4195 (.next-sdk-native15), React4201 and Next4200. Existing development3000 is preserved. See [manual examples](../../examples/README.md) for refreshing packages and browser bundles.
