# Story 3 — Pipeline visualization

Built `app/routes/runs/pipeline.tsx`, `app/components/pipeline/role-stepper.tsx` (6-role status
row, colored by status, click to select) and `step-log-viewer.tsx` (per-step event log,
live-updated via SSE-triggered query invalidation). `useRunEvents(runId)` from `lib/sse.ts`
keeps the run/steps/artifacts/checkpoint queries in sync as the pipeline progresses.

**Outcome:** a run's progress is visible live without polling or manual refresh.
