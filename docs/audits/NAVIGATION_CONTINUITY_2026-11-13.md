# Reports / All projects navigation continuity

The user asked specifically why collections still showed loading after being visited and requested a concrete fix on the original site.

## Reproduced cause

The read-only production prefetch test did not work on development3000: no prepared RSC response appeared during its20s wait. This reproduces the expected development difference, not a database failure. Production full prefetch had already passed repeated collection reuse. Both pages nevertheless had their own `loading.tsx`, allowing an unprepared navigation to replace the completed screen with a skeleton.

## Implemented fix

Move the two collection skeletons into reusable feature components (`ProjectsSkeleton.tsx` and `ReportsSkeleton.tsx`) instead of registering them as automatic route boundaries. Their implementation is retained. The existing first-workspace/auth loading and error/retry boundaries remain. During collection navigation Next retains the current completed view until the new server view is ready; IntentLink's pending treatment remains immediate. Existing full-prefetch caching and mutation refresh are unchanged. No persistent private-data cache, experimental cache setting, authorization bypass or database change is added.

This separates two concerns: production can reuse a prepared result without another request, while an actual wait keeps useful content visible rather than replacing it with skeletons. Development still requests dynamic server output. First loads, expiry and explicit freshness requests are not promised zero network work.

## Verification

- Original localhost3000: a read-only test held the Reports response for500ms and verified Your projects stayed visible with zero collection skeletons. Three round trips then recorded3 project and3 report RSC requests, with no skeleton shown; reload/Back passed.
- Production `.next-navigation13` build and application TypeScript passed; focused ESLint passed. Full original/source work is preserved, no commit/deployment or new dependencies.
- The existing production search/prepared-navigation/shared-generator check passed after the route-boundary change, recording no fallback. The final continuity/recovery results are appended below.

Final production selection passed3/3: search/prepared navigation/shared generator, delayed replay recovery, and collection continuity. Three collection round trips recorded0 additional project RSC requests and0 additional report RSC requests, with no skeletons. The deliberately held destination retained the previous view for500ms; reload/Back also passed. Source whitespace checks passed. Development's production-prefetch expectation failure is retained above rather than reported as an application regression or clean combined cross-mode run.

Original development entry remains localhost3000. The existing production preview address3032 is updated to `.next-navigation13`, with isolated replay4194. No port change is needed for the user. A fresh document load adopts the new route tree; ordinary subsequent navigation should not require manual refresh.
