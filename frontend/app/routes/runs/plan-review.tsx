import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { MarkdownView } from "~/components/markdown-view";
import { RunStatusBadge } from "~/components/pipeline/run-status-badge";
import { runQueries } from "~/lib/queries";
import { runMutations } from "~/lib/mutations";

export function meta() {
  return [{ title: "Plan review — Agent Orchestrator" }];
}

export default function PlanReview() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: run } = useQuery(runQueries.detail(runId!));
  const { data: artifacts } = useQuery(runQueries.artifacts(runId!));
  const planArtifacts = (artifacts ?? [])
    .filter((a) => a.type === "plan_md")
    .sort((a, b) => (a.filePath ?? "").localeCompare(b.filePath ?? ""));

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: runQueries.detail(runId!).queryKey });
  };

  const approve = useMutation({
    ...runMutations.approvePlanReview(),
    onSuccess: () => {
      invalidate();
      void navigate(`/runs/${runId}`);
    },
  });

  const requestChanges = useMutation({
    ...runMutations.requestPlanChanges(),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      void navigate(`/runs/${runId}`);
    },
  });

  if (!run) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Plan review — {run.title}</h1>
        <RunStatusBadge status={run.status} />
      </div>

      {run.status !== "awaiting_plan_review" && (
        <p className="text-sm text-muted-foreground">
          This checkpoint has already been decided.
        </p>
      )}

      {planArtifacts.length === 0 ? (
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">No plan artifact yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {planArtifacts.map((artifact) => (
            <div key={artifact.id} className="rounded-md border p-4">
              {artifact.filePath && (
                <p className="mb-2 font-mono text-xs text-muted-foreground">
                  {artifact.filePath}
                </p>
              )}
              <MarkdownView content={artifact.content} />
            </div>
          ))}
        </div>
      )}

      {run.status === "awaiting_plan_review" && (
        <div className="flex gap-2">
          <Button onClick={() => approve.mutate(run.id)} disabled={approve.isPending}>
            Approve
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Request changes</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request changes to the plan</DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder="What should the Researcher revisit?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
              <DialogFooter>
                <Button
                  onClick={() => requestChanges.mutate({ runId: run.id, note: note || undefined })}
                  disabled={requestChanges.isPending}
                >
                  Send back to Researcher
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
