# Story 3 — Runs module: state machine and orchestrator

Built the core: `run-state-machine.ts` (pure `computeNextStatus`/`isActiveStatus` functions
implementing the transition table — Researcher only runs if `isNewFeature`; the automated fix
loop is bounded by `maxFixIterations`, the human-requested one is not) and
`run-orchestrator.service.ts` (the engine that actually drives a run: sets up the git worktree,
runs each role's turn through the global `SerialQueue`, persists every step/event/artifact,
broadcasts over SSE, and stops at `awaiting_plan_review`/`awaiting_code_review`).

Added the full set of usecases (`create-run`, `approve/request-changes` for both checkpoints,
`cancel-run`, plus read usecases) and the controller. Deliberately did **not** mark any usecase
that calls `runOrchestrator.advance()` afterward as `@Transactional()` — advance() reads the
run back from the DB and must only run after the triggering write actually commits.

**Outcome:** a run can go from `pending` all the way to a human checkpoint or `completed`
without any manual intervention beyond the two approve/request-changes decisions.
