import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { RunStatusBadge } from "~/components/pipeline/run-status-badge";
import { projectQueries, runQueries } from "~/lib/queries";

export function meta() {
  return [{ title: "Project — Agent Orchestrator" }];
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useQuery(projectQueries.detail(projectId!));
  const { data: runs, isPending: runsPending } = useQuery(runQueries.list(projectId!));

  if (!project) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p>{project.repoUrl}</p>
          <p>
            Default branch <span className="font-mono">{project.defaultBranch}</span> ·{" "}
            {project.backendFramework} + {project.frontendFramework}
            {project.bootstrapFromTemplate && " · bootstraps from template-frameworks"}
          </p>
          {project.description && <p>{project.description}</p>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Runs</h2>
        <Button asChild>
          <Link to={`/runs/new?projectId=${project.id}`}>New run</Link>
        </Button>
      </div>

      {runsPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !runs?.length ? (
        <p className="text-sm text-muted-foreground">No runs yet for this project.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <Link to={`/runs/${run.id}`} className="hover:underline">
                    {run.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <RunStatusBadge status={run.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(run.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
