# Projects and role configs

## Projects

Plain CRUD. `src/modules/projects/` — `ports/output/project-repository.port.ts`,
`infrastructure/persistence/project.repository.ts`, `usecases/*.usecase.ts`,
`presenter/project.controller.ts`. `mirrorPath` starts `null` and gets filled in by the git
module the first time a run against that project actually clones/mirrors it — don't set it
manually. `repoUrl` doesn't have to be a real remote yet: a local filesystem path works too,
and if it doesn't exist or isn't a git repo yet, `ensureLocalSourceIsGitRepo()` (git module)
creates/initializes one automatically the first time a run needs it — see
`agent-execution-and-git.md`. `bootstrapFromTemplate` is set once at creation (see
`agent-execution-and-git.md` for what it does) and isn't currently editable afterward — there's
no field for it in
`UpdateProjectRequestDto`.

## Role configs

What it does: per-(project, role) or global-default config for the agent's model, system
prompt template, allowed tools, MCP servers, and expected skills. **Editable from the UI** at
`/role-configs` (frontend) — that's the primary way to customize a role's behavior day-to-day;
`default-role-configs.ts` only matters for what gets seeded into a brand-new environment.

| Change you want to make | File |
|---|---|
| Edit a role's behavior day-to-day | The `/role-configs` page in the frontend (`PATCH /role-configs/:id` under the hood) — no restart/reseed needed, takes effect on the next run |
| Change what gets seeded into a *new* environment | `src/modules/role-configs/default-role-configs.ts` — `pnpm seed` is idempotent, only inserts rows that don't already exist, **will not overwrite an already-seeded row** (that's what the UI/API is for) |
| Add a per-project override for a role | `PATCH /role-configs/:id` with `projectId` set (or add a usecase if you want a dedicated "create override" endpoint — currently overrides are only created by directly inserting a `role_configs` row with a non-null `project_id`; there's no usecase or UI for that yet, only editing the global defaults is wired up in the frontend) |
| Change how project-override vs. global-default gets resolved | `src/modules/role-configs/usecases/get-effective-role-config.usecase.ts` — this is what `run-orchestrator.service.ts` calls before every step |
| Add a new field to a role's config | `role_configs` table in `src/libs/database/schema.ts`, `RoleConfigEntity` in `shared/domain/entities/role-config.entity.ts`, `UpdateRoleConfigRequestDto` in `role-configs/presenter/dtos/`, migrate, then add the field to the frontend's `app/routes/role-configs/edit.tsx` |
