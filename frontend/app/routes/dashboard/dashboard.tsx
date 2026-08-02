import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function meta() {
  return [{ title: "Agent Orchestrator" }];
}

export default function Dashboard() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Agent Orchestrator</h1>
      <p className="text-muted-foreground">
        Run a project through the Researcher → Designer → Frontend → Backend → Tester →
        Reviewer pipeline, with plan and code review checkpoints along the way.
      </p>
      <Button asChild>
        <Link to="/projects">View projects</Link>
      </Button>
    </div>
  );
}
