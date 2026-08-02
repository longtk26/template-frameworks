# Epic 1 — Backend pipeline foundation

Build the NestJS backend for the agent orchestrator: the data model, all 8 modules, and the
run state machine that actually drives a pipeline through its 6 roles and 2 human checkpoints.

## Scope

- Scaffold `backend/` from the `nestjs-templates` convention (hexagonal architecture, Drizzle).
- Full data model: projects, pipeline_runs, run_steps, step_events, artifacts,
  review_checkpoints, notifications, role_configs.
- Modules: projects, role-configs, git (worktree-based, no push), agent-runner (Fake + real
  Claude Agent SDK), realtime (SSE), notifications, runs (the state machine).
- Unit tests for the state machine; end-to-end smoke test with `FakeAgentRunner`.

## Stories

1. [Scaffold and data model](story-1-scaffold-and-schema.md)
2. [Projects, role-configs, git, agent-runner, realtime, notifications modules](story-2-supporting-modules.md)
3. [Runs module: state machine and orchestrator](story-3-runs-state-machine.md)
4. [Tests and end-to-end smoke test](story-4-tests-and-smoke-test.md)
