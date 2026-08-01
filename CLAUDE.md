# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start:dev                    # Start Nest dev server (watch mode)
pnpm build                        # Compile to dist/
pnpm test / pnpm test:e2e         # Unit / e2e tests
make newmg name="<description>"   # Auto-generate a Drizzle migration from schema changes
make mghead                       # Apply all pending migrations
make mgdrop                       # Drop the last generated (unapplied) migration
```

## Architecture

Module-based hexagonal (clean) architecture, mirroring the `fast-api` template in this repo. Each module owns its own layers; shared domain and infrastructure live in `modules/shared/`.

```
src/
├── main.ts              # App entry point; global ValidationPipe
├── app.module.ts         # Root module — imports EnvModule, DatabaseModule + every feature module
├── configs/
│   ├── env.schema.ts      # Zod schema for every env var (defaults, required fields)
│   ├── env.ts             # Loads .env and parses it against env.schema — throws on load if invalid
│   ├── env.service.ts     # @Injectable EnvService — typed getters (appName, port, dbUrl)
│   └── env.module.ts      # @Global module exposing EnvService
│
├── modules/
│   ├── shared/
│   │   └── domain/
│   │       └── entities/           # Plain TS domain entity classes (no ORM)
│   │           └── user.entity.ts
│   │
│   ├── health/
│   │   ├── usecases/
│   │   │   └── health-check.usecase.ts  # Use-case class, @Injectable
│   │   ├── presenter/
│   │   │   ├── health.controller.ts     # Nest controller
│   │   │   └── dtos/
│   │   └── health.module.ts
│   │
│   └── users/
│       ├── ports/
│       │   └── output/                  # Output port abstract classes (DI tokens)
│       │       └── user-repository.port.ts   # IUserRepository
│       ├── usecases/
│       │   ├── create-user.usecase.ts
│       │   └── get-user.usecase.ts
│       ├── infrastructure/
│       │   └── persistence/
│       │       └── user.repository.ts   # UserRepository — implements IUserRepository
│       ├── presenter/
│       │   ├── user.controller.ts
│       │   └── dtos/
│       └── users.module.ts              # Binds IUserRepository -> UserRepository
│
└── libs/
    ├── database/
    │   ├── schema.ts                    # Every Drizzle pgTable definition lives here
    │   ├── drizzle-client.ts            # Singleton pg Pool + drizzle instance (reads env.ts directly)
    │   ├── database.module.ts           # @Global module exposing the DRIZZLE DI token
    │   └── transaction.context.ts       # AsyncLocalStorage bridging @Transactional -> repos
    └── decorators/
        └── transactional.decorator.ts   # @Transactional() method decorator
```

## Key Concepts

- **Entity** (`shared/domain/entities/`): Plain TS class — no ORM/decorators. Shared across modules.
- **Output port** (`ports/output/`): Abstract class defining the repository interface a use case depends on. Also doubles as the Nest DI token (abstract classes are valid provider tokens).
- **Use case** (`usecases/<action>.usecase.ts`): `@Injectable()` class implementing business logic. Depends on the output port abstract class only, never on the concrete repository or the ORM.
- **Schema** (`libs/database/schema.ts`): every Drizzle `pgTable` definition — one file for the whole project, imported directly by `drizzle-kit` and by repositories. Do not create per-module schema files.
- **Repository** (`infrastructure/persistence/`): Implements the output port. Maps between the Drizzle row type and the domain entity.
- **Presenter** (`presenter/`): Nest controller + DTOs (`class-validator`/`class-transformer`). Injects use cases and handles HTTP.

## Dependency Injection Pattern

Ports are abstract classes bound to their concrete implementation in the module's `providers` array:

```typescript
// ports/output/user-repository.port.ts
export abstract class IUserRepository {
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract findById(id: string): Promise<UserEntity | null>;
}

// usecases/create-user.usecase.ts
@Injectable()
export class CreateUserUsecase {
  constructor(@Inject(IUserRepository) private readonly userRepo: IUserRepository) {}

  @Transactional()
  async execute(dto: CreateUserRequestDto) {
    return this.userRepo.create(dto.toEntity());
  }
}

// users.module.ts
@Module({
  providers: [{ provide: IUserRepository, useClass: UserRepository }, CreateUserUsecase, ...],
})
export class UsersModule {}
```

For use cases with no repository (e.g. health), just `@Injectable()` the concrete class and add it to `providers`.

## Transactions

Drizzle has no per-request "session" object to commit/rollback like SQLAlchemy — `@Transactional()` instead wraps the method in `db.transaction(...)` and propagates the active transaction through `AsyncLocalStorage` (`libs/database/transaction.context.ts`). Any repository invoked (directly or transitively) during that method picks up the same transaction automatically via `getDb(this.db)`; no need to thread a `tx` object through constructors.

```typescript
@Transactional()
async execute(dto: CreateUserRequestDto) {
  // every repository call inside here shares one transaction
  const user = await this.userRepo.create(dto.toEntity());
  return { id: user.id };
}
```

Only apply `@Transactional()` to use-case methods that write to the database.

## Adding a New Module

1. Add shared domain types (if cross-module):
   - `src/modules/shared/domain/entities/<name>.entity.ts` — plain TS class
   - Add the table to `src/libs/database/schema.ts` (all tables live in this one file)
2. Create `src/modules/<name>/` with:
   - `ports/output/<name>-repository.port.ts` — `I<Name>Repository` abstract class *(skip if no DB)*
   - `infrastructure/persistence/<name>.repository.ts` — concrete repo *(skip if no DB)*
   - `usecases/<action>.usecase.ts` — use-case class
   - `presenter/<name>.controller.ts` — Nest controller, tagged with `@ApiTags('<name>')`
   - `presenter/dtos/<name>.dto.ts` — request/response DTOs
   - `<name>.module.ts` — binds the port to its implementation and declares providers/controllers
3. Run `make newmg name="<description>"`, review the generated SQL, then `make mghead`
4. Import the new module in `src/app.module.ts`

Migrations generated this way are committed to the repo (`drizzle/*.sql`) and applied automatically on every deploy — see "Migrations on container start" below.

## Migrations on Container Start

`src/migrate.ts` applies every pending migration in `drizzle/` using `drizzle-orm/node-postgres/migrator`'s `migrate()` — not the `drizzle-kit` CLI, which is a devDependency and isn't present in the production image. The Dockerfile's `CMD` runs it before starting the app:

```
CMD ["sh", "-c", "node dist/migrate.js && node dist/main.js"]
```

So every container start (including redeploys) brings the schema up to date before serving traffic; if a migration fails, the container exits non-zero and the app never starts serving on a stale/broken schema. `migrate.ts` is a plain file under `src/`, so `nest build` compiles it to `dist/migrate.js` automatically — no separate build step. The runtime image also copies the `drizzle/` folder (the SQL files `migrate()` reads at startup); if you add a new migration, make sure it's committed so it ships with the image.

## Key Conventions

- **`@Transactional()`**: Apply to use-case methods that write to the database; auto-commits on success, rolls back on exception.
- **Exceptions**: Use Nest's built-in HTTP exceptions (`NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, etc. from `@nestjs/common`) rather than throwing raw errors.
- **ORM ↔ Entity mapping**: Repositories map between the Drizzle row type and the domain entity. Use cases never import Drizzle table/schema objects.
- **Environment**: Copy `.env.example` to `.env`. Required vars: `APP_NAME` (default provided), `PORT` (default `8080`), `DB_URL` (PostgreSQL connection string, required — no default).

## Environment Validation

`src/configs/env.schema.ts` defines a zod schema for every env var; `src/configs/env.ts` parses `process.env` against it once, at import time, and throws immediately with the list of missing/invalid vars if parsing fails — the app never boots into a broken state. Two ways to consume it:

- **Inside Nest DI** (controllers, use cases, etc.): inject `EnvService` (from the `@Global()` `EnvModule`) — e.g. `envService.port`, `envService.dbUrl`.
- **Outside Nest DI** (module-level singletons created at import time, like `libs/database/drizzle-client.ts`, or `drizzle.config.ts` at the repo root): import the validated `env` object directly from `src/configs/env.ts`.

Add a new env var by adding it to `envSchema` in `env.schema.ts` (with a `.default(...)` if optional) and exposing it via `EnvService` if Nest code needs it.

## API Documentation (Swagger)

`main.ts` wires up `DocumentBuilder`/`SwaggerModule` and serves the UI at `/docs` (raw spec at `/docs-json`). Schemas are derived automatically — `nest-cli.json` enables the `@nestjs/swagger` CLI plugin, which reads each DTO's TypeScript types and `class-validator` decorators (`@IsEmail()` → `format: email`, optional `?` → not required, etc.) at compile time, and also infers each handler's response schema from its declared return type (e.g. `Promise<GetUserResponseDto>`). This only works through `nest build`/`nest start` (already the case for every script in `package.json`) — plain `tsc` would skip it.

- Add `@ApiTags('<name>')` to a new controller so its routes group correctly in the UI.
- Avoid manual `@ApiProperty()` / `@ApiOkResponse()` / `@ApiCreatedResponse()` — the plugin already covers types, required fields, and response shapes from the DTO/return-type declarations alone. Only reach for them when documenting something the plugin can't infer (e.g. a custom example, description, or a response shape the handler's return type doesn't literally match).

## Stack

- **NestJS 11** with `@nestjs/platform-express`
- **Drizzle ORM** (`drizzle-orm/node-postgres`) — all tables in `libs/database/schema.ts`
- **drizzle-kit** for migrations
- **PostgreSQL** via `pg`
- **zod** for env var validation (`src/configs/env.schema.ts`)
- **class-validator** / **class-transformer** for DTO validation (global `ValidationPipe` in `main.ts`)
