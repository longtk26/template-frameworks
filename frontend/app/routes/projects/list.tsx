import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { projectQueries } from "~/lib/queries";

export function meta() {
  return [{ title: "Projects — Agent Orchestrator" }];
}

export default function ProjectsList() {
  const { data: projects, isPending } = useQuery(projectQueries.list());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Button asChild>
          <Link to="/projects/new">New project</Link>
        </Button>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !projects?.length ? (
        <p className="text-sm text-muted-foreground">
          No projects yet — create one to start a pipeline run.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Repo</TableHead>
              <TableHead>Backend</TableHead>
              <TableHead>Frontend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} className="cursor-pointer">
                <TableCell>
                  <Link to={`/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{project.repoUrl}</TableCell>
                <TableCell>{project.backendFramework}</TableCell>
                <TableCell>{project.frontendFramework}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
