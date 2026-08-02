import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "~/components/ui/scroll-area";
import { runQueries } from "~/lib/queries";
import type { StepEvent } from "~/lib/queries";

function renderEvent(event: StepEvent): { text: string; className?: string } {
  const payload = event.payload as Record<string, unknown>;
  switch (event.type) {
    case "system_init":
      return { text: "Session started.", className: "text-muted-foreground" };
    case "assistant_text":
      return { text: String(payload.text ?? "") };
    case "tool_use":
      return { text: `→ using tool: ${String(payload.name ?? "unknown")}`, className: "text-muted-foreground" };
    case "tool_result":
      return {
        text: `← tool result${payload.isError ? " (error)" : ""}`,
        className: payload.isError ? "text-destructive" : "text-muted-foreground",
      };
    case "result":
      return { text: String(payload.summary ?? ""), className: "font-medium" };
    case "error":
      return { text: `Error: ${String(payload.message ?? "")}`, className: "text-destructive" };
    default:
      return { text: JSON.stringify(payload) };
  }
}

export function StepLogViewer({ runId, stepId }: { runId: string; stepId: string | null }) {
  const { data: events } = useQuery({
    ...runQueries.stepEvents(runId, stepId ?? ""),
    enabled: !!stepId,
    refetchInterval: 2000,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [events]);

  if (!stepId) {
    return <p className="text-sm text-muted-foreground">Select a step above to view its log.</p>;
  }

  return (
    <ScrollArea className="h-80 rounded-md border bg-muted/20 p-3 font-mono text-xs">
      {!events?.length ? (
        <p className="text-muted-foreground">No output yet…</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {events.map((event) => {
            const { text, className } = renderEvent(event);
            return (
              <p key={event.id} className={className}>
                {text}
              </p>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </ScrollArea>
  );
}
