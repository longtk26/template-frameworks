import { useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { RunStatusBadge } from "~/components/pipeline/run-status-badge";
import { RoleStepper } from "~/components/pipeline/role-stepper";
import { StepLogViewer } from "~/components/pipeline/step-log-viewer";
import { runQueries } from "~/lib/queries";
import { runMutations } from "~/lib/mutations";
import { useRunEvents } from "~/lib/sse";
import type { RunStep } from "~/lib/queries";

export function meta() {
  return [{ title: "Run — Agent Orchestrator" }];
}

function WorktreePathLine({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-xs">
      <span className="text-muted-foreground">Working directory (open it in your editor to watch changes live):</span>
      <code className="font-mono">{path}</code>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => {
          void navigator.clipboard.writeText(path);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

export default function RunPipeline() {
  const { runId } = useParams<{ runId: string }>();
  const queryClient = useQueryClient();
  useRunEvents(runId);

  const { data: run } = useQuery(runQueries.detail(runId!));
  const { data: steps } = useQuery(runQueries.steps(runId!));
  const [selectedStep, setSelectedStep] = useState<RunStep | null>(null);

  const cancelRun = useMutation({
    ...runMutations.cancel(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: runQueries.detail(runId!).queryKey }),
  });

  if (!run) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const canCancel = !["completed", "failed", "cancelled"].includes(run.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{run.title}</h1>
          <p className="text-sm text-muted-foreground">{run.requestDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <RunStatusBadge status={run.status} />
          {canCancel && (
            <Button variant="outline" size="sm" onClick={() => cancelRun.mutate(run.id)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {run.status === "awaiting_plan_review" && (
        <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
          The plan is ready for your review.{" "}
          <Link to={`/runs/${run.id}/plan-review`} className="font-medium underline">
            Review the plan
          </Link>
        </div>
      )}
      {run.status === "awaiting_code_review" && (
        <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
          The code is ready for your review.{" "}
          <Link to={`/runs/${run.id}/code-review`} className="font-medium underline">
            Review the code
          </Link>
        </div>
      )}
      {run.status === "failed" && run.errorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {run.errorMessage}
        </div>
      )}

      {run.worktreePath && <WorktreePathLine path={run.worktreePath} />}

      <RoleStepper
        steps={steps ?? []}
        isNewFeature={run.isNewFeature}
        selectedStepId={selectedStep?.id ?? null}
        onSelectStep={setSelectedStep}
      />

      <StepLogViewer runId={run.id} stepId={selectedStep?.id ?? null} />
    </div>
  );
}
