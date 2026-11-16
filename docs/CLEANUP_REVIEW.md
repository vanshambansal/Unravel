# Repository cleanup review

Owner: repository maintenance. Prepared 2026-11-16. The owner approved excluding the 784 agent-tool files from Git while retaining their local copies. Their Git exclusions were committed in f1458fd; no local copies were deleted. The owner subsequently requested publishing the completed work to GitHub. Counts below describe the audit baseline.

## Keep

- `apps/web`, `packages/contracts`, `packages/sdk`, `packages/test-plan`: active application and reusable boundaries.
- SDK examples and supported-case fixtures: independent integration evidence; do not overwrite the user's copied reporter configuration.
- Tests and maintenance scripts with a reproducible purpose.
- `prototypes/landing-motion`: retained original migration reference, explicitly protected.
- Root AGENTS.md and current product/design/operation documents.
- Existing font/texture provenance and third-party license files. The MIT project license does not replace third-party asset terms.

## Approved public-repository exclusions

| Candidate                                                            | Baseline tracked files | Assessment                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------- | ---------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.agents/skills/**`                                                  |                    540 | Local agent skill libraries dominate the repository inventory. No runtime/build references were found in application/packages/scripts/fixtures/README/package configuration. Preserve tooling locally or in a separate configuration repository if desired. |
| `.agent/**`, `.claude/**`, `.gemini/**`, `.opencode/**`, `.codex/**` |           244 combined | Agent-specific copies/configuration. Inspect the final file list and retain any deliberately shared workflow instructions before removal.                                                                                                                   |

The committed exclusion list can be reviewed with `git show --name-only --diff-filter=D f1458fd`. Root ignore rules keep the local copies out of future additions. The files remain in Git history; no history rewrite is proposed. Design/history/data removals below remain unapproved.

## Archive or inspect before deciding

- `design/**` (43 tracked files): Blender sources, texture provenance and design concepts have different maintenance value. Do not bulk-delete; check each asset against the runtime/source-maintenance chain. In particular, the original Blender builder targets the retained prototype.
- Historical handoffs/audits: preserve evidence but link from concise current docs. Superseded status is preserved in `docs/history/` during completion work.
- Dependencies: Motion supports authentication; GSAP supports landing choreography; CodeMirror supports plan/code editing. No dependency removal is justified merely by their size or name. Investigate individual imports and bundle contributions before proposing removals.

## Ignored local disk usage

`.cache`, `.next-*`, browser screenshots, test output and node_modules are not equivalent to tracked repository clutter. Review resolved paths and process ownership before removing old builds; a running preview may still depend on one. Do not touch database rows or user reports as repository cleanup.

## Completed maintenance direction

Core formatting is explicit and incremental rather than a whole-repository rewrite. The generator separates schemas, normalization, validation, descriptions and Playwright export while retaining its public API. Credential-free CI is separate from real-provider verification. These changes do not authorize the removals above.


## Application/demo cleanup review - 2026-11-16

Implemented: formatting now covers maintained application, landing and example source; a documentation map and code walkthrough identify entry points. Generated browser-demo bundles are ignored. The new browser-demo workspace uses the root lockfile; its earlier local standalone lock is ignored. Root skill/tool libraries remain excluded as previously approved. No source/reference/history files were deleted.

The following concrete candidates require a separate archive/removal decision before changing their paths or Git tracking:

| Candidate | Recommendation and consequence |
| --- | --- |
| docs/ANTIGRAVITY_DESIGN_HANDOFF.md | Historical design conversation; archive under docs/history after updating incoming links. No runtime dependency. |
| docs/PROJECT_STATUS_HISTORY.md, docs/DESIGN_HISTORY.md, docs/DECISIONS_HISTORY.md, docs/PROMPT_LOG_HISTORY.md | Consolidate historical placement under docs/history after link review. Preserve content; do not erase evidence. |
| Older entries in docs/PROMPT_LOG.md and docs/DECISIONS.md | Split historical entries into dated archives while keeping concise current pointers and mandated append logs. Requires careful preservation of current decisions. |
| design/concepts, design/references, design/figma | Review per asset before archiving; these contain approval/provenance evidence. Do not bulk-ignore design/assets or assume everything is disposable. |
| skills-lock.json | Local agent-library metadata; inspect tool references and untrack only with explicit approval. Runtime source does not require the skills library. |

Keep tests, reproducible verification scripts, SDK example source, package lockfiles and third-party notices. Keep prototypes/landing-motion unchanged under the existing instruction. Optional profiling scripts are grouped in scripts/README.md instead of being removed merely because they are not runtime code.
