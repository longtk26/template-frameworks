import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "~/components/ui/field";
import { projectQueries, runQueries } from "~/lib/queries";
import { runMutations } from "~/lib/mutations";

export function meta() {
  return [{ title: "New run — Agent Orchestrator" }];
}

export default function NewRun() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project } = useQuery({
    ...projectQueries.detail(projectId),
    enabled: !!projectId,
  });

  const [title, setTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [isNewFeature, setIsNewFeature] = useState(false);

  const createRun = useMutation({
    ...runMutations.create(),
    onSuccess: (run) => {
      void queryClient.invalidateQueries({ queryKey: runQueries.list(projectId).queryKey });
      void navigate(`/runs/${run.id}`);
    },
  });

  if (!projectId) {
    return <p className="text-sm text-destructive">Missing projectId — start a run from a project's page.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-semibold">New run</h1>
      {project && <p className="mb-4 text-sm text-muted-foreground">for {project.name}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createRun.mutate({ projectId, title, requestDescription, isNewFeature });
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="requestDescription">What should be built or changed?</FieldLabel>
            <Textarea
              id="requestDescription"
              rows={5}
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              required
            />
            <FieldDescription>
              This is the context every agent role reads to understand the task.
            </FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <input
              id="isNewFeature"
              type="checkbox"
              className="size-4 rounded border-input"
              checked={isNewFeature}
              onChange={(e) => setIsNewFeature(e.target.checked)}
            />
            <FieldLabel htmlFor="isNewFeature" className="font-normal">
              New feature or big change — run the Researcher first and review its plan before
              anything else starts.
            </FieldLabel>
          </Field>
          {createRun.isError && (
            <p className="text-sm text-destructive">
              {createRun.error instanceof Error ? createRun.error.message : "Failed to create run"}
            </p>
          )}
          <Button type="submit" disabled={createRun.isPending}>
            {createRun.isPending ? "Starting…" : "Start run"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
