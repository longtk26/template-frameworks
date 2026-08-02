# Epic 3 — Customization and bootstrap

Make the pipeline's behavior easy to customize, and make brand-new projects self-bootstrap
from the user's own template repo instead of starting from nothing.

## Scope

- `projects.bootstrapFromTemplate`: clone `longtk26/template-frameworks` (branch matched to
  `backendFramework`) into a brand-new project's first-run worktree, only if it's still empty.
- Researcher writes its plan as `pdm/epic-<n>-<slug>/story-<m>.md` files instead of one
  PLAN.md, so a large plan is reviewable incrementally (this very `pdm/` folder documenting
  the orchestrator's own build follows the same convention, applied retroactively).
- A `/role-configs` UI page to edit each role's model/prompt/tools/mcp/skills — chosen over a
  parallel `.agents/*.md`-file mechanism to avoid a two-sources-of-truth problem, since the
  DB-backed `role_configs` + API already existed.

## Stories

1. [Bootstrap-from-template](story-1-bootstrap-from-template.md)
2. [Researcher multi-file plan](story-2-researcher-multi-file-plan.md)
3. [Role-configs editor UI](story-3-role-configs-editor-ui.md)
