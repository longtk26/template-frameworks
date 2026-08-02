# Agent execution (Claude Agent SDK) and git (worktrees)

## Agent execution

What it does: runs a role's turn either for free via a scripted fake (dev/tests) or for real via
the Claude Agent SDK, riding the machine's existing `claude` CLI subscription login.

| Change you want to make | File |
|---|---|
| Switch a deployment/role over to real Claude usage | `AGENT_RUNNER_MODE` env var (`fake` default, `claude` for real) — see `src/modules/agent-runner/agent-runner.module.ts`. This is currently an all-or-nothing switch, not per-role; making it per-role would mean moving the choice into `role_configs` and resolving it in `run-orchestrator.service.ts` instead |
| Change the real SDK call (tools, permission mode, model resolution, env stripping) | `src/modules/agent-runner/infrastructure/claude-agent-sdk-runner.service.ts` — `permissionMode: 'bypassPermissions'` is hardcoded (needed for headless/unattended operation); `buildSdkEnv()` is what strips `ANTHROPIC_API_KEY`/`ANTHROPIC_AUTH_TOKEN` so it falls through to the CLI's stored credential instead of pay-per-token billing |
| Change how MCP servers get resolved (e.g. Stitch) | Same file, `buildSdkMcpServers()` — only `mcp_servers` entries with a non-null `config` get passed as an explicit override; `enabled: true, config: null` (Stitch's default) means "let the CLI subprocess resolve its own already-configured server" |
| Change the fake runner's scripted behavior (dev/test data) | `src/modules/agent-runner/infrastructure/fake-agent-runner.service.ts` |
| Change the normalized event shape (`AgentEvent`) consumed by the orchestrator/frontend | `src/modules/agent-runner/ports/output/agent-runner.port.ts` — keep `AgentEvent['type']` in sync with `stepEventTypeEnum` in `schema.ts`, they're intentionally identical string sets |

## Git (worktrees, no push)

What it does: all of a project's work lives in **one repo on different branches** (not one repo
per project) — this module clones/mirrors that repo once, then gives each run its own `git
worktree` off the same `.git`, so concurrent runs never clobber each other's checkout.

| Change you want to make | File |
|---|---|
| Change how the shared mirror is created/refreshed | `src/modules/git/infrastructure/simple-git.service.ts` — `ensureRepoMirror()` (`fetch --all --prune` if it exists, else `git clone`) |
| Change how a run's worktree/branch gets created | Same file, `createWorktree()` — idempotent (checks `git worktree list` first) |
| Change how a local (not-yet-on-GitHub) folder gets treated as a project's source | Same file, `ensureLocalSourceIsGitRepo()` — called from `ensureRepoMirror()` before cloning. If `repoUrl` isn't a remote URL (`http(s)://`/`git@`/`ssh://`) and the local path doesn't exist or has no `.git` yet, creates the directory and runs `git init -b <defaultBranch>` + an empty commit, so there's something for the mirror clone (and later, worktree creation off `origin/<defaultBranch>`) to work with |
| Change where mirrors/worktrees live on disk | `GIT_WORKSPACES_DIR` env var (default `./.workspaces`); path construction is in `run-orchestrator.service.ts`'s `setupGitWorktree()` |
| Add a new git operation | Add it to `IGitService` in `src/modules/git/ports/output/git-service.port.ts` first — **the port has no push/PR method on purpose**, don't add one without the user explicitly asking, since local-commits-only is a deliberate safety boundary, not an oversight |

## Bootstrap-from-template (brand-new projects)

What it does: if a project has `bootstrapFromTemplate: true` (set once at project-creation
time), every run's `setupGitWorktree()` independently checks the worktree's `backend/` and
`frontend/` subfolders and, for whichever one is still empty, clones the matching branch of
`longtk26/template-frameworks` — the user's own published version of this monorepo, as branches
instead of folders — into that subfolder as its own commit. **Never overwrites existing
content** — this runs on every new run of a flagged project, not just once, since without
pushing there's no durable way to mark "already bootstrapped" on the remote; it's simply a
no-op for a subfolder once real content exists there.

| Change you want to make | File |
|---|---|
| Change the template repo URL | `TEMPLATE_FRAMEWORKS_REPO_URL` env var (default `https://github.com/longtk26/template-frameworks`) |
| Change/add a `backendFramework`/`frontendFramework` → branch mapping | `src/modules/git/template-frameworks.ts` — `TEMPLATE_BRANCH_FOR_BACKEND_FRAMEWORK` (`nestjs`, `fastapi`, `go`) and `TEMPLATE_BRANCH_FOR_FRONTEND_FRAMEWORK` (`react-router`) — confirmed via `git ls-remote` against the real repo. An unmapped framework value logs a warning and skips that subfolder rather than failing the run |
| Change the emptiness check or how content gets copied in | `src/modules/git/infrastructure/simple-git.service.ts` — `bootstrapFromTemplate()` now takes a `subdirectory` param (`backend`/`frontend`), checks *that subfolder* for existing content, shallow single-branch clones to a temp dir, `cpSync`s everything but `.git` into the subfolder, cleans up the temp dir |
| Change when/whether this runs, or add a third subfolder/framework | `src/modules/runs/infrastructure/orchestration/run-orchestrator.service.ts` — `setupGitWorktree()` calls the private `bootstrapSubdirectoryIfNeeded()` helper once per subfolder, right after `createWorktree()` |
