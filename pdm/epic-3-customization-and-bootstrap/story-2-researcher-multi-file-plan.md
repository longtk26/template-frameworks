# Story 2 — Researcher multi-file plan

Changed the Researcher's default prompt to write `pdm/epic-<n>-<slug>/epic.md` +
`story-<m>.md` files instead of a single PLAN.md. Added `readPdmMarkdownFiles()` (walks
`pdm/`, returns every `.md` file found) and updated `persistArtifactIfApplicable()` in
`run-orchestrator.service.ts` to create one `artifacts` row per file (schema already supported
this via the nullable `artifacts.filePath` column — no migration needed) instead of one row,
falling back to a single summary-text artifact when `pdm/` doesn't exist (always true for
`FakeAgentRunner`). Downstream roles now see the full plan — all `plan_md` rows concatenated
with headers — rather than just whichever row happened to be "latest".

Updated `plan-review.tsx` to render a list of plan artifacts (grouped by file path) instead of
a single blob.

**Outcome:** a large plan is reviewable epic-by-epic/story-by-story instead of as one document.
