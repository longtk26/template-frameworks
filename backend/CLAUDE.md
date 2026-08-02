# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start:dev                    # Start Nest dev server (watch mode)
pnpm build                        # Compile to dist/
pnpm test / pnpm test:e2e         # Unit / e2e tests
pnpm seed                         # Seed the 6 global default role_configs rows (idempotent)
make newmg name="<description>"   # Auto-generate a Drizzle migration from schema changes
make mghead                       # Apply all pending migrations
make mgdrop                       # Drop the last generated (unapplied) migration
```

## What this app is

An AI agent workflow orchestrator: register a **project** (one repo, on whichever branch), kick
off a **run** for a feature/change, and watch six agent roles (Researcher → Designer → Frontend →
Backend → Tester → Reviewer) work through it in sequence, pausing at two human checkpoints (plan
review, code review). See `docs/features/*.md` for a per-feature file map — that's the fast path
for "I want to change X, which files do I touch" — this file covers the shared architecture.

## Architecture

Module-based hexagonal (clean) architecture, mirroring the `fast-api` template in this repo. Each module owns its own layers; shared domain lives in `modules/shared/`.

```
src/
├── main.ts              # App entry point; global ValidationPipe, CORS (for the frontend's SSE calls)
├── app.module.ts         # Root module — imports every module below
├── seed.ts               # Idempotent seed of the 6 global default role_configs rows
├── configs/
│   ├── env.schema.ts      # Zod schema for every env var
│   ├── env.ts             # Loads .env and parses it against env.schema — throws on load if invalid
│   ├── env.service.ts     # @Injectable EnvService — typed getters
│   └── env.module.ts      # @Global module exposing EnvService
│
├── modules/
│   ├── shared/domain/
│   │   ├── types.ts                 # RunStatus/AgentRole/StepStatus/... string unions (mirror the pg enums)
│   │   └── entities/                # Plain TS domain entity classes — one per table
│   │
│   ├── health/                      # Liveness endpoint, no DB
│   ├── projects/                    # Project CRUD (repoUrl, defaultBranch, mirrorPath)
│   ├── role-configs/                # Per-role model/prompt/tools/mcp/skills config (project override > global default)
│   ├── git/                         # Worktree-based git ops — clone/fetch once, branch per run, commit only, NO push
│   ├── agent-runner/                # IAgentRunner port + FakeAgentRunner (default) + ClaudeAgentSdkRunner
│   ├── realtime/                    # SSE broadcaster (IRealtimeBroadcaster) — GET /runs/:id/events, /notifications/stream
│   ├── notifications/                # Notification center: create/list/mark-read
│   └── runs/                        # THE STATE MACHINE — see below
│
└── libs/
    ├── database/                    # schema.ts (every table), drizzle-client.ts, database.module.ts, transaction.context.ts
    ├── decorators/transactional.decorator.ts
    ├── concurrency/serial-queue.ts   # Global FIFO — every real agent-runner call goes through ONE instance
    └── prompt/render-template.ts     # `{{key}}` substitution for role system prompts
```

### `modules/runs/` in detail

- `domain/run-state-machine.ts` — **pure** functions (`computeNextStatus`, `isActiveStatus`) implementing the `pipeline_runs.status` transition table. No DB/DI — this is what `run-state-machine.spec.ts` exhaustively tests.
- `infrastructure/orchestration/run-orchestrator.service.ts` — the engine. `advance(runId)` loops: run the current status's agent role (or the fix loop) → persist step/events/artifact → compute+apply the next status → repeat until a human checkpoint or terminal state. Every real agent call goes through the shared `SerialQueue` (protects the user's Claude subscription rate limit across all runs).
- `infrastructure/orchestration/role-prompt-context.ts` — renders a role's `system_prompt_template` with `{{projectName}}`/`{{requestDescription}}`/`{{planMd}}`/`{{designMd}}`.
- `infrastructure/orchestration/read-artifact-file.ts` — reads `PLAN.md`/`DESIGN.md`/`REVIEW.md` back from the worktree after a step succeeds (falls back to the SDK's summary text if the agent didn't write the file — always true for `FakeAgentRunner`). Also parses the Reviewer's `STATUS: BLOCKING`/`STATUS: READY` sentinel line.
- `usecases/` — one per HTTP action (`create-run`, `approve-plan-review`, `request-plan-changes`, `approve-code-review`, `request-code-changes`, `cancel-run`, plus read usecases). **Deliberately not `@Transactional()`** on any usecase that calls `runOrchestrator.advance()` afterward — advance() reads the run back from the DB and must only run after the triggering write is actually committed.

## Key Concepts

- **Entity** (`shared/domain/entities/`): Plain TS class — no ORM/decorators.
- **Output port** (`ports/output/`): Abstract class = interface + Nest DI token.
- **Use case**: `@Injectable()`, depends on port abstract classes only.
- **Schema** (`libs/database/schema.ts`): every Drizzle `pgTable`/`pgEnum` — one file, do not create per-module schema files.
- **Repository**: implements the port, maps Drizzle row <-> domain entity.
- **Agent role config** (`role_configs` table): `project_id: null` = global default (seeded by `pnpm seed`), overridable per project. `mcp_servers` entries with `enabled: true, config: null` mean "don't override — let the `claude` CLI subprocess resolve it from the machine's own MCP config" (this is how Stitch is wired for Designer/Frontend). `skills` are cross-checked against the CLI's actual `system/init` message at runtime, not guessed from the filesystem.

## Transactions

Same `@Transactional()` decorator as before (AsyncLocalStorage-based, see `libs/database/transaction.context.ts`) — apply it to use-case methods that write to the DB, **except** where noted above in `modules/runs/usecases/`.

## Adding a New Module

1. Add the entity to `modules/shared/domain/entities/`, the table to `libs/database/schema.ts`, any new enums to `shared/domain/types.ts`.
2. Create `src/modules/<name>/` with `ports/output/`, `infrastructure/persistence/`, `usecases/`, `presenter/`, `<name>.module.ts` (see `projects/` for the simplest example, `runs/` for the most complex).
3. `make newmg name="<description>"`, review, `make mghead`.
4. Import the new module in `src/app.module.ts`.
5. Add a doc to `docs/features/` per the project convention (see that directory's existing docs) so future changes have a fast file-map instead of re-deriving it.

## Stack

- **NestJS 11**, **Drizzle ORM** (all tables in `libs/database/schema.ts`), **PostgreSQL**, **zod** (env + role-config jsonb validation)
- **@anthropic-ai/claude-agent-sdk** — the real agent runner; rides the machine's existing `claude` CLI subscription login (API key explicitly stripped from the subprocess env), not pay-per-token billing
- **simple-git** — worktree-based git operations, no push/PR method exists anywhere in the port
- **Server-Sent Events** via Nest's built-in `@Sse()` (rxjs, already a dependency) — chosen over WebSocket since updates only ever flow server→client
- **class-validator**/**class-transformer** for DTOs

## Environment Variables

`APP_NAME`, `PORT`, `DB_URL` (as before) plus:
- `GIT_WORKSPACES_DIR` — where the shared repo mirror + per-run worktrees live (default `./.workspaces`)
- `CORS_ORIGIN` — the frontend's origin, for SSE/API CORS (default `http://localhost:5173`)
- `AGENT_RUNNER_MODE` — `fake` (default, zero cost, used in dev/tests) or `claude` (real Claude Agent SDK, spends real usage) — see `agent-runner.module.ts`
- `TEMPLATE_FRAMEWORKS_REPO_URL` — repo cloned into `backend/`/`frontend/` for bootstrap-flagged projects (default `https://github.com/longtk26/template-frameworks`)

## API Documentation (Swagger)

Served at `/docs`, schemas inferred from DTOs via the `@nestjs/swagger` CLI plugin — **but
wrapped in a try/catch in `main.ts`** that logs a warning and skips `/docs` rather than
crashing the whole app on failure. This exists because of a known, unresolved issue: the CLI
plugin's static type inference silently drops the `type` metadata for `PipelineRunEntity`'s
`fixIterationCount`/`maxFixIterations` fields (both plain `number`, assigned via a `?? default`
pattern in the constructor — compare the compiled `dist/.../pipeline-run.entity.js`, where most
fields get `type: () => String`/`Date` but these two get nothing), which then trips
`@nestjs/swagger`'s runtime schema factory into a false "circular dependency detected" error
that otherwise prevents the app from booting at all. The proper fix would be an explicit
`@ApiProperty()` on those two fields, but `PipelineRunEntity` is a domain entity that's
deliberately framework-agnostic (no NestJS/Swagger decorators) per this file's own convention —
so for now, `/docs` degrades gracefully instead. If you add a response DTO layer for `runs`
endpoints (instead of controllers returning `PipelineRunEntity` directly), revisit whether this
try/catch is still needed.
