# Pipeline orchestration (the state machine)

What it does: drives a `pipeline_run` through Researcher → Designer → Frontend → Backend →
Tester → Reviewer, pausing at two human checkpoints (plan review, code review), with a bounded
automated fix loop and an unbounded human-requested fix loop reusing the same `fixing` state.

## Files to touch

| Change you want to make | File |
|---|---|
| Add/remove a role, or change the order roles run in | `src/modules/runs/domain/run-state-machine.ts` (`ROLE_FOR_STATUS`, `FIX_LOOP_ROLES`) — also add the enum value to `run_status`/`agent_role` in `src/libs/database/schema.ts` and migrate |
| Change what happens after a role finishes (e.g. add a new checkpoint) | `computeNextStatus()` in `run-state-machine.ts` — this is a pure function, exhaustively unit-tested in `run-state-machine.spec.ts` |
| Change how the automated fix loop decides "blocking issues" | `reviewReportHasBlockingIssues()` in `src/modules/runs/infrastructure/orchestration/read-artifact-file.ts` (currently a `STATUS: BLOCKING`/`STATUS: READY` sentinel line, see the Reviewer's prompt in `src/modules/role-configs/default-role-configs.ts`) |
| Change what gets persisted/broadcast per step, or how the agent SDK call is invoked | `src/modules/runs/infrastructure/orchestration/run-orchestrator.service.ts` — `runRoleStep()` is the core method |
| Change which artifact file a role's output gets read from (DESIGN.md/REVIEW.md) | `ARTIFACT_TYPE_FOR_ROLE` in `run-orchestrator.service.ts` + `ARTIFACT_FILENAMES` in `read-artifact-file.ts` |
| Change the Researcher's plan structure (currently `pdm/epic-<n>-<slug>/story-<m>.md`, one `artifacts` row per file) | `readPdmMarkdownFiles()` in `read-artifact-file.ts` (the walk) + the researcher-specific branch in `persistArtifactIfApplicable()` in `run-orchestrator.service.ts` (falls back to one summary-text artifact if `pdm/` doesn't exist, e.g. under `FakeAgentRunner`) + the folder-structure instructions in the Researcher's prompt in `default-role-configs.ts`. Downstream roles see the full plan concatenated from all `plan_md` rows for the run — see the `planMd` assembly in `runRoleStep()`, not a single "latest" row |
| Change the system prompt a role receives, or what context (plan/design) gets injected | `src/modules/role-configs/default-role-configs.ts` (the template text) + `src/modules/runs/infrastructure/orchestration/role-prompt-context.ts` (the `{{...}}` substitution) |
| Add/change an HTTP endpoint for run actions | `src/modules/runs/presenter/run.controller.ts` + a new usecase in `src/modules/runs/usecases/` |
| Change how many agent calls can run concurrently (currently: exactly one, globally) | `src/libs/concurrency/serial-queue.ts` — bound as a singleton in `src/libs/concurrency/concurrency.module.ts` |

## Data model

`pipeline_runs` (status/branch/worktree/fix-iteration bookkeeping), `run_steps` (one row per
role invocation, `attempt_number` increments on re-run), `step_events` (every normalized SDK
message — this is what the frontend's step log viewer polls), `artifacts` (PLAN.md/DESIGN.md/
REVIEW.md/diff content), `review_checkpoints` (one row per plan/code review occurrence). All in
`src/libs/database/schema.ts`.

## Known simplifications (intentional, not bugs)

- The automated fix loop always re-runs **all three** of frontend/backend/tester (`FIX_LOOP_ROLES`), not just the role the Reviewer implicated — there's no structured parsing of *which* role broke something, only whether something needs fixing at all.
- `run_steps.attempt_number` and sequencing are recomputed by re-querying `findAllByRun` on every step — fine for a personal tool's run sizes, would need indexing/caching at real scale.
