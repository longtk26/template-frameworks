# Story 2 — Supporting modules

Built the five modules the runs state machine depends on:

- **projects** — plain CRUD, hexagonal pattern.
- **role-configs** — per-(project, role) or global-default model/prompt/tools/mcp/skills,
  seeded via `pnpm seed` from `default-role-configs.ts`.
- **git** — worktree-based (`ensureRepoMirror`/`createWorktree`/`commitAll`/`getDiff`), no
  push/PR method anywhere in the port — a deliberate safety boundary, not an oversight, since
  all of the user's real projects live in one repo on different branches.
- **agent-runner** — `IAgentRunner` port, `FakeAgentRunner` (default, free) and
  `ClaudeAgentSdkRunner` (real, gated behind `AGENT_RUNNER_MODE=claude`), riding the machine's
  existing `claude` CLI subscription login rather than API-key billing.
- **realtime** — Server-Sent Events (`@Sse()` + rxjs), chosen over WebSocket since updates only
  ever flow server→client.
- **notifications** — persisted notification center, every notification also pushed live via
  the realtime broadcaster.

**Outcome:** each module independently unit-testable via its port; `IAgentRunner` being a port
is what let the rest of the build (and all future tests) avoid spending real Claude usage.
