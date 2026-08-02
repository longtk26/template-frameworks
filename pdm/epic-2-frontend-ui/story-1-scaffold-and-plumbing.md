# Story 1 — Scaffold and API/SSE plumbing

Scaffolded `frontend/` from the `react-router` template (shadcn/ui already set up, TanStack
Query loader/component pattern), dropping the `auth/` route tree and `welcome/` scaffold.

Built `app/lib/queries.ts` (query factories + all API response TS interfaces),
`app/lib/mutations.ts` (mutation factories), and `app/lib/sse.ts` (`useRunEvents`/
`useNotificationStream`, plain `EventSource`, no socket client library). Fixed
`app/lib/api-fetch.ts`'s `getBaseUrl()` to use `VITE_API_BASE_URL` client-side, since the
backend runs on a different port with CORS enabled rather than behind a same-origin proxy —
needed for both `fetch` and `EventSource` to reach the backend in dev.

**Outcome:** typed, reusable data layer in place before any page was built on top of it.
