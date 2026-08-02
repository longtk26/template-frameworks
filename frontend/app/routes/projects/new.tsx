import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "~/components/ui/field";
import { projectMutations } from "~/lib/mutations";
import { projectQueries } from "~/lib/queries";

export function meta() {
  return [{ title: "New project — Agent Orchestrator" }];
}

export default function NewProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [description, setDescription] = useState("");
  const [backendFramework, setBackendFramework] = useState("nestjs");
  const [bootstrapFromTemplate, setBootstrapFromTemplate] = useState(false);

  const createProject = useMutation({
    ...projectMutations.create(),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectQueries.all().queryKey });
      void navigate(`/projects/${project.id}`);
    },
  });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">New project</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createProject.mutate({
            name,
            repoUrl,
            defaultBranch: defaultBranch || undefined,
            description: description || undefined,
            backendFramework,
            bootstrapFromTemplate,
          });
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="repoUrl">Repository</FieldLabel>
            <Input
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="git@github.com:you/repo.git or /home/you/projects/new-app"
              required
            />
            <FieldDescription>
              All of a project&apos;s work happens on branches of this one repo — cloned/mirrored
              once and reused across every run. Don&apos;t have a GitHub repo yet? Enter an
              absolute path to a local folder instead — if it doesn&apos;t exist yet, or exists
              but isn&apos;t a git repo, one gets created/initialized for you automatically.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="defaultBranch">Default branch</FieldLabel>
            <Input
              id="defaultBranch"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="backendFramework">Backend framework</FieldLabel>
            <select
              id="backendFramework"
              value={backendFramework}
              onChange={(e) => setBackendFramework(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm dark:bg-input/30"
            >
              <option value="nestjs">NestJS</option>
              <option value="fastapi">FastAPI</option>
              <option value="go">Go (Gin)</option>
            </select>
          </Field>
          <Field orientation="horizontal">
            <input
              id="bootstrapFromTemplate"
              type="checkbox"
              className="size-4 rounded border-input"
              checked={bootstrapFromTemplate}
              onChange={(e) => setBootstrapFromTemplate(e.target.checked)}
            />
            <FieldLabel htmlFor="bootstrapFromTemplate" className="font-normal">
              Brand new project — bootstrap from template-frameworks on the first run
            </FieldLabel>
          </Field>
          {bootstrapFromTemplate && (
            <FieldDescription>
              Each run will clone <span className="font-mono">longtk26/template-frameworks</span>{" "}
              into <span className="font-mono">backend/</span> (branch matching the backend
              framework above) and <span className="font-mono">frontend/</span> (branch matching
              the frontend framework), but only into whichever of those is still empty — existing
              code is never overwritten.
            </FieldDescription>
          )}
          {createProject.isError && (
            <p className="text-sm text-destructive">
              {createProject.error instanceof Error
                ? createProject.error.message
                : "Failed to create project"}
            </p>
          )}
          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? "Creating…" : "Create project"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
