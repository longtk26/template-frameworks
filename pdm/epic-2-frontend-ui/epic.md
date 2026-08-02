# Epic 2 — Frontend UI

Build the React Router UI: manage projects, kick off runs, watch them live over SSE, and act
on the two review checkpoints.

## Scope

- Scaffold `frontend/` from the `react-router` template convention (shadcn, TanStack Query).
- API/query/mutation/SSE plumbing.
- Projects (list/new/detail) and run-creation routes.
- Live pipeline visualization (role status row + streaming log).
- Plan-review and code-review pages, with a hand-rolled diff viewer and Markdown rendering.
- Notification bell wired to the live SSE notification stream.

## Stories

1. [Scaffold and API/SSE plumbing](story-1-scaffold-and-plumbing.md)
2. [Projects and run-creation routes](story-2-projects-and-run-creation.md)
3. [Pipeline visualization](story-3-pipeline-visualization.md)
4. [Review pages, diff viewer, notifications](story-4-review-pages-and-notifications.md)
