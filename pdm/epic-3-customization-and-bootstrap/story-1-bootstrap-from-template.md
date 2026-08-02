# Story 1 — Bootstrap-from-template

Confirmed via `git ls-remote` that `longtk26/template-frameworks` is the user's own published
version of this monorepo, as branches: `feat/nestjs-templates`, `feat/fastapi`, `feat/go-gin`,
`feat/react-router`.

Added `projects.bootstrapFromTemplate` (boolean, set once at project creation — a checkbox in
the New Project form), `IGitService.bootstrapFromTemplate()` (shallow single-branch clone to a
temp dir, copies everything but `.git` into the worktree, only if the worktree is otherwise
empty — never overwrites real work), and `src/modules/git/template-frameworks.ts`'s
`backendFramework` → branch mapping. Wired into `run-orchestrator.service.ts`'s
`setupGitWorktree()`, right after the worktree is created and before any role runs.

**Outcome:** verified live against the real GitHub repo — an empty scratch project's first run
got the full `nestjs-templates` scaffold committed as `chore: bootstrap from
template-frameworks (feat/nestjs-templates)`, then the pipeline continued normally.
