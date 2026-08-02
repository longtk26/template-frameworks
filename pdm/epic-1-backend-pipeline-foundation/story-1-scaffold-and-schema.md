# Story 1 — Scaffold and data model

Scaffolded `agent-orchestrator/backend/` by copying `nestjs-templates`'s conventions (hexagonal
architecture, Drizzle ORM, `@Transactional()` via AsyncLocalStorage), dropping the `users`
module/table (no auth in v1), and creating the `agent_orchestrator` database in the shared
Postgres container.

Defined the full schema in `src/libs/database/schema.ts`: 8 pg enums (`run_status`,
`agent_role`, `step_status`, `step_event_type`, `artifact_type`, `review_kind`,
`review_status`, `notification_type`) and 8 tables (`projects`, `pipeline_runs`, `run_steps`,
`step_events`, `artifacts`, `review_checkpoints`, `notifications`, `role_configs`). Migrated
via `drizzle-kit`.

**Outcome:** both apps' scaffolds boot with just `health`; schema migrated cleanly.
