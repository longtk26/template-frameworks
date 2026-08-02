# Frontend UI — route and component map

The backend's `docs/features/*.md` cover the pipeline model this UI visualizes. This doc is the
fast path for "I want to change X in the UI, which file."

## Files to touch

| Change you want to make | File |
|---|---|
| Add/change a route | `app/routes.ts` (route tree) + the route file itself under `app/routes/` |
| Change the header/nav or where the notification bell lives | `app/routes/app-layout.tsx` |
| Change the projects list/create/detail pages | `app/routes/projects/{list,new,detail}.tsx` — `new.tsx` also has the backend-framework select + "bootstrap from template-frameworks" checkbox |
| Change the role-configs editor (model/prompt/tools/mcp/skills per role) | `app/routes/role-configs/edit.tsx` — one card per global role config; MCP servers are edited as a raw JSON textarea, allowed tools/skills as comma-separated text, not rich list widgets — no per-project override editor yet, only global defaults |
| Change the run-creation form (title/description/"new feature" toggle) | `app/routes/runs/new.tsx` — note there's no shadcn `Switch`/`Checkbox` installed, the toggle is a plain styled `<input type="checkbox">` |
| Change the pipeline visualization (role status row + live log) | `app/routes/runs/pipeline.tsx` + `app/components/pipeline/role-stepper.tsx` (per-role status, click to select) + `app/components/pipeline/step-log-viewer.tsx` (polls `runQueries.stepEvents`, also live-updated via SSE invalidation) |
| Change the "working directory" line (lets you open the run's live worktree in your own editor while an agent is running) | `WorktreePathLine` in `app/routes/runs/pipeline.tsx` — just displays `run.worktreePath` with a copy button, no file-browser/live-diff view in the app itself |
| Change the plan-review or code-review page | `app/routes/runs/plan-review.tsx` / `code-review.tsx` — both follow the same shape: fetch the run + relevant artifact, render via `MarkdownView`, Approve/Request-changes buttons (the latter opens a `Dialog` for a note) |
| Change how diffs render | `app/components/diff/parse-unified-diff.ts` (the parser — backend sends raw `git diff` text, no diff-computing library) + `app/components/diff/diff-viewer.tsx` (rendering) |
| Change how Markdown artifacts render | `app/components/markdown-view.tsx` — uses `react-markdown`; styling is hand-rolled Tailwind child-selectors since no `@tailwindcss/typography` plugin is installed |
| Change the notification bell/dropdown | `app/components/notifications/notification-bell.tsx` — custom dropdown (no shadcn `Popover`/`DropdownMenu` installed), closes via a fullscreen backdrop button |
| Add/change an API call | `app/lib/queries.ts` (reads — also where the `Project`/`PipelineRun`/`RunStep`/... TS interfaces live) or `app/lib/mutations.ts` (writes) |
| Change SSE behavior (what triggers a refetch, toast-on-notification) | `app/lib/sse.ts` — `useRunEvents(runId)` (mounted in `pipeline.tsx`) and `useNotificationStream()` (mounted once in `app-layout.tsx`) |
| Change the backend origin the frontend talks to | `.env`'s `API_BASE_URL` (server-side) / `VITE_API_BASE_URL` (client-side) — see `app/lib/api-fetch.ts`'s `getBaseUrl()`. The backend and frontend run on different ports with CORS enabled rather than a same-origin proxy, specifically so `EventSource` (which can't go through most proxy setups as easily as `fetch`) works the same way in dev as `fetch` does |

## Known simplifications (intentional, not bugs)

- No route `loader`s prefetch data server-side yet — every page fetches client-side via
  `useQuery` after mount, so there's a brief loading state on first paint instead of the
  template's usual SSR-prefetch-then-hydrate pattern. Wiring loaders per route (mirroring
  `lib/queries.ts`'s factories, same pattern as the template's own example) is a
  straightforward follow-up if the loading flicker matters.
- UI was verified via typecheck + SSR curl smoke tests (pages render, correct titles, no
  errors in the payload) in this session, **not** by clicking through in an actual browser —
  do that before treating any single page as fully verified.
