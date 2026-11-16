# Maintenance scripts

Normal commands are in the root README. These scripts are reproducible maintenance tools, not application modules.

| Purpose | Files |
| --- | --- |
| Local app/player lifecycle | `dev-local.mjs`, `preview-local.mjs`, `replay-host.mjs` |
| Build independent demos and SDK fixtures | `build-browser-demo.mjs`, `build-standard-sites.mjs`, `build-sdk-smoke.mjs` |
| SDK distribution and registry verification | `pack-sdk.mjs`, `check-sdk-package.mjs`, `prepare-sdk-consumer.mjs`, `verify-sdk-registry.mjs` |
| Code formatting and release checks | `format.mjs`, `release-check.mjs` |
| Runtime renderer assets | `capture-posters.mjs`, `check-posters.mjs` |
| Exported test and isolation proof | `verify-generated.mjs`, `verify-standard-generated.mjs`, `verify-plan-adapters.mjs`, `verify-replay-https.mjs` |
| Optional local measurement | `profile-*.mjs`, `measure-sdk.mjs` |
| Browser installation | `install-browser.mjs` |

Generated builds, screenshots, traces, package archives and proof JSON belong in ignored output directories. Keep scripts that reproduce a documented claim; review one-off tools before removal. Do not confuse deleting local output with deleting reports or database data.
