import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getBaseUrl } from "./api-fetch";
import { runQueries, notificationQueries, type AppNotification } from "./queries";

/**
 * Subscribes to `GET /runs/:id/events` and keeps the run/steps/artifacts/review-checkpoint
 * queries in sync as the pipeline progresses — no socket client library needed, `EventSource`
 * is a browser built-in and reconnects on its own.
 */
export function useRunEvents(runId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!runId) return;

    const source = new EventSource(`${getBaseUrl()}/runs/${runId}/events`);

    const invalidateRun = () => {
      void queryClient.invalidateQueries({ queryKey: runQueries.detail(runId).queryKey });
      void queryClient.invalidateQueries({ queryKey: runQueries.steps(runId).queryKey });
      void queryClient.invalidateQueries({ queryKey: runQueries.artifacts(runId).queryKey });
      void queryClient.invalidateQueries({
        queryKey: runQueries.reviewCheckpoints(runId).queryKey,
      });
    };

    source.addEventListener("run.updated", invalidateRun);
    source.addEventListener("step.updated", invalidateRun);
    source.addEventListener("step.log", () => {
      // Step event payloads are appended to a per-step list the log viewer queries directly —
      // invalidate broadly rather than trying to patch the cache from a raw SSE payload.
      void queryClient.invalidateQueries({ queryKey: ["runs", "detail", runId, "steps"] });
    });

    return () => source.close();
  }, [runId, queryClient]);
}

/** Subscribes to `GET /notifications/stream` — refetches the notification list on every
 * event and fires a toast so a new checkpoint is noticed even off the pipeline page. */
export function useNotificationStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource(`${getBaseUrl()}/notifications/stream`);

    source.addEventListener("notification.created", (event) => {
      void queryClient.invalidateQueries({ queryKey: notificationQueries.list().queryKey });
      try {
        const notification = JSON.parse(event.data) as AppNotification;
        toast(notification.title, { description: notification.body });
      } catch {
        // malformed payload — the invalidation above still refreshes the list
      }
    });

    return () => source.close();
  }, [queryClient]);
}
