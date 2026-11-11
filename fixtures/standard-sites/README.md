# Standard SDK installation checks

These independent React and Next.js websites exist only for repeatable integration verification. They mount `mountWidget({projectId, applicationOrigin})` with no test-ID, text, value, error or path allowlists. Visitors never configure the widget. The public integration values come from ignored local config files written by the authorized test owner.

From the repository root, run `corepack pnpm test:standard`. Existing synthetic Clerk development users and the configured development database are required. Set `REPORTS_BASE_URL` to a production preview if apps/web already has a development process; its replay origin must be 4191. See root README for preview commands and environment setup. The test owns ports 4194/3017 plus the existing report-test fixture/player ports and stops them afterward.

The sites exercise real client navigation, a non-form details button, a form submitted by click and by Enter. The UI test downloads reproduction and regression files, then executes those exact files against buggy and fixed versions. No test-specific SDK options or locator corrections are used. Privacy-masked forms need one synthetic replacement value; developers explicitly supply intended outcome text.

The fixed flag is a test-only business-response switch in ignored `.cache/standard-*-config.json`; it is restored afterward. It changes the question response and details result, not SDK behavior or locators. Reports created by this suite are clearly labelled E2E and retained; it never deletes existing developer reports. Proof, hashes, exports and browser artifacts live in `.cache/standard-proof/`. These controlled Chromium sites do not establish arbitrary-site compatibility.
