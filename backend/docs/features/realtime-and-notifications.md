# Realtime (SSE) and notifications

## Realtime

What it does: one-way server→client push over Server-Sent Events (chosen over WebSocket since
nothing ever flows client→server on this channel). No socket library on either side —
Nest's built-in `@Sse()` (backend) and the browser's built-in `EventSource` (frontend).

| Change you want to make | File |
|---|---|
| Add a new event type broadcast to the frontend | Add a method to `IRealtimeBroadcaster` (`src/modules/realtime/ports/output/realtime-broadcaster.port.ts`) + implement in `rxjs-broadcaster.service.ts` + call it from wherever the event originates (usually `run-orchestrator.service.ts`) + listen for it in the frontend's `app/lib/sse.ts` |
| Add a new SSE endpoint (e.g. per-project stream) | `src/modules/realtime/presenter/run-events.controller.ts` |
| Free per-run memory when a run ends | `completeRunStream(runId)` — already called from `run-orchestrator.service.ts`'s `failRun()`, `ApproveCodeReviewUsecase`, and `CancelRunUsecase`; if you add a new way for a run to reach a terminal state, call it there too or the `Subject` for that run leaks for the process lifetime |

## Notifications

What it does: persisted notification center (`GET /notifications`, mark read/all-read) — every
notification is also pushed live via the realtime broadcaster.

| Change you want to make | File |
|---|---|
| Add a new notification type / change when one fires | Add the enum value to `notification_type` in `schema.ts`, then call `CreateNotificationUsecase.execute()` from wherever the triggering event happens (currently only `run-orchestrator.service.ts` and the review usecases in `modules/runs/usecases/`) |
| Change notification delivery (e.g. add email/Slack) | `src/modules/notifications/usecases/create-notification.usecase.ts` — this is the single choke point every notification goes through |
