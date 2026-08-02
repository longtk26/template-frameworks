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
import { DiffViewer } from "~/components/diff/diff-viewer";
import { RunStatusBadge } from "~/components/pipeline/run-status-badge";
import { cn } from "~/lib/utils";
import { runQueries } from "~/lib/queries";
import { runMutations } from "~/lib/mutations";

export function meta() {
  return [{ title: "Code review — Agent Orchestrator" }];
}

export default function CodeReview() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState<"diff" | "notes">("diff");

  const { data: run } = useQuery(runQueries.detail(runId!));
  const { data: artifacts } = useQuery(runQueries.artifacts(runId!));
  const { data: diffData } = useQuery(runQueries.diff(runId!));
  const reviewArtifact = artifacts?.find((a) => a.type === "review_report");

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: runQueries.detail(runId!).queryKey });
  };

  const approve = useMutation({
    ...runMutations.approveCodeReview(),
    onSuccess: () => {
      invalidate();
      void navigate(`/runs/${runId}`);
    },
  });

  const requestChanges = useMutation({
    ...runMutations.requestCodeChanges(),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      void navigate(`/runs/${runId}`);
    },
  });

  if (!run) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Code review — {run.title}</h1>
        <RunStatusBadge status={run.status} />
      </div>

      {run.status !== "awaiting_code_review" && (
        <p className="text-sm text-muted-foreground">
          This checkpoint has already been decided.
        </p>
      )}

      <div className="flex gap-1 border-b">
        {(["diff", "notes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-1.5 text-sm font-medium",
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
            )}
          >
            {t === "diff" ? "Diff" : "Review notes"}
          </button>
        ))}
      </div>

      {tab === "diff" ? (
        <DiffViewer diff={diffData?.diff ?? ""} />
      ) : (
        <div className="rounded-md border p-4">
          {reviewArtifact ? (
            <MarkdownView content={reviewArtifact.content} />
          ) : (
            <p className="text-sm text-muted-foreground">No review report yet.</p>
          )}
        </div>
      )}

      {run.status === "awaiting_code_review" && (
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
                <DialogTitle>Request changes to the code</DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder="What needs to change?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
              <DialogFooter>
                <Button
                  onClick={() => requestChanges.mutate({ runId: run.id, note: note || undefined })}
                  disabled={requestChanges.isPending}
                >
                  Send back for fixes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
