# nestjs-templates

A NestJS starter following the same module-based hexagonal (clean) architecture as the `fast-api` template in this repo, using **Drizzle ORM** + PostgreSQL for persistence.

## Setup

```bash
pnpm install
cp .env.example .env         # fill in APP_NAME / PORT / DB_URL — validated at startup via zod
docker compose up -d         # starts a local Postgres instance on :5432
pnpm db:migrate               # apply migrations
pnpm start:dev                # http://localhost:8080
```

If an env var is missing or malformed, the app throws immediately on boot with a clear message instead of failing later — see `src/configs/env.ts`.

API docs (Swagger UI) are served at `http://localhost:8080/docs` once the app is running, with the raw OpenAPI document at `/docs-json`. Request/response schemas are generated automatically from each DTO's TypeScript types and `class-validator` decorators via the `@nestjs/swagger` CLI plugin (`nest-cli.json`) — no manual `@ApiProperty()` needed on the DTOs themselves. Note this exposes `/docs` in every environment including production; gate or remove it in `main.ts` if that's not desired for your deployment.

## Commands

```bash
pnpm start:dev                    # start Nest in watch mode
pnpm build                        # compile to dist/
pnpm test                         # unit tests
pnpm test:e2e                     # e2e tests (includes a real-Postgres @Transactional check)
pnpm db:generate                  # generate a Drizzle migration from schema changes
pnpm db:migrate                   # apply pending migrations
pnpm db:drop                      # drop the last generated (unapplied) migration
pnpm db:studio                    # open Drizzle Studio
```

Or via `make`: `make run`, `make newmg name="<description>"`, `make mghead`, `make mgdrop`.

## Deploying (Docker)

```bash
docker build -t nestjs-templates .
docker run -p 8080:8080 --env-file .env nestjs-templates
```

The image's `CMD` applies every pending migration (`dist/migrate.js`, via `drizzle-orm`'s migrator) before starting the app, so each deploy/container start brings the database schema up to date automatically — no separate migration step needed in your deploy pipeline. If a migration fails, the container exits without starting the app. See `CLAUDE.md` → "Migrations on Container Start" for details.

## Project Architecture

Module-based hexagonal (clean) architecture — each feature module owns its own ports, use cases, infrastructure, and presenter layers; only cross-module domain types are shared.

```
src/
├── main.ts                # entry point, global ValidationPipe
├── app.module.ts           # root module — imports EnvModule, DatabaseModule, feature modules
├── configs/                # zod-validated global env module (src/configs/env.*)
├── libs/
│   ├── database/            # drizzle client, DI token, schema.ts (all tables), tx context
│   └── decorators/           # @Transactional()
└── modules/
    ├── shared/domain/entities/   # plain TS entities shared across modules
    ├── health/                    # usecases -> presenter (no persistence)
    └── users/
        ├── ports/output/          # IUserRepository (abstract class = DI token)
        ├── usecases/              # business logic, depends only on the port
        ├── infrastructure/persistence/  # UserRepository — the only place touching Drizzle
        └── presenter/             # controller + DTOs
```

Request flow: **controller → use case → repository (port) → Drizzle → Postgres**, with use cases never importing Drizzle directly. See `CLAUDE.md` for the full guide, the DI/port-binding pattern, and instructions for adding a new module.

## Git Conventions

**Commits** follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`

| Type       | Use for                                      |
|------------|-----------------------------------------------|
| `feat`     | new functionality                             |
| `fix`      | bug fixes                                     |
| `refactor` | code change that isn't a fix or a feature     |
| `chore`    | tooling, deps, config                         |
| `docs`     | documentation only                            |
| `test`     | adding or fixing tests                        |
| `perf`     | performance improvements                      |
| `build`    | build system / Docker / CI changes            |

Example: `feat(users): add get-user-by-email usecase`

**Branches**: `<type>/<short-description>`, e.g. `feat/create-user-endpoint`, `fix/transaction-rollback`.

**Pull requests**: keep them scoped to one logical change; the PR description should explain *why*, not restate the diff.
