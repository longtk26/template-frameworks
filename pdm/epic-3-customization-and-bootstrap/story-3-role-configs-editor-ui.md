# Story 3 — Role-configs editor UI

Considered a file-based `.agents/*.md` mechanism (mirroring Claude Code's own custom-subagent
definition format) as a way to make each role's behavior easy to customize, but chose a UI
editor instead: the `role_configs` table + `GET`/`PATCH /role-configs` API already existed from
Epic 1, so a file-based layer would have introduced a second, potentially-conflicting source of
truth for no real benefit.

Built `app/routes/role-configs/edit.tsx` — one card per global role config (model, system
prompt template, allowed tools, skills, MCP servers as JSON, enabled toggle), saving via the
existing `PATCH /role-configs/:id` endpoint. Added a "Role configs" link to the app nav.

**Outcome:** every role's model/prompt/tools/mcp/skills is editable from the UI, takes effect
on the next run with no restart or reseed. Per-project overrides remain API-only (no UI yet) —
a natural fast-follow if needed.
