# Internal product A/B exploration

Date: 2026-11-11. Surface mode: **Operate**. Authentication may carry a stronger architectural brand moment; evidence and controls remain stable and readable.

## Contract

Developers need to register a website, integrate the standalone visitor widget, investigate reports and turn reviewed evidence into a regression test. Visitors need explicit recording, understandable local/submitted state, safe retry and no account. Success is a coherent proposed interface for the real bounded workflow, not a claim that a Figma interaction implements it.

A uses a framed architectural glass workspace and adjacent replay/evidence inspector. B uses an open canvas, wider replay and a horizontal evidence sequence. These two concepts were explicitly approved as the exploration scope; no additional concept workshop or application scaffolding is required. User aesthetic selection is pending. DESIGN.md owns current frame links and comparison; PROJECT_STATUS.md owns implemented capabilities and runtime blockers.

## Maintenance

- `internal-redesign-state.json` is the current node/validation ledger. Create a new Figma task session when resuming and retain the old session as history if needed.
- The four `internal-redesign-*.js` helpers document native Figma construction. They are not application code or a rerunnable full rebuild. Inspect and update exact ledger nodes rather than creating duplicates or re-running old construction blocks.
- Temporary per-phase creation checkpoints are retained under ignored `.cache/internal-redesign-build/`. The final ledger contains current frame/family IDs and validation.
- Current screenshots live under ignored `.cache/internal-redesign-review/`; they are exports of actual editable frames. Signed export URLs are ephemeral and must not be committed.
- `internal-redesign-review.md` records the independent static review and its limited disposition. Neither a reviewer nor a bounds check replaces user aesthetic acceptance or later runtime browser verification.

Previous Figma pages, original scene artwork and local supplied references are preserved. The new exploration reuses approved scene artwork already in Figma; no local reference image was uploaded. No runtime package, shader, provider or database setup belongs to this task.
