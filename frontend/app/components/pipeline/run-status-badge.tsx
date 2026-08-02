import { Badge } from "~/components/ui/badge";
import type { RunStatus, StepStatus } from "~/lib/queries";

const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  pending: "Pending",
  researching: "Researching",
  awaiting_plan_review: "Awaiting plan review",
  designing: "Designing",
  building_frontend: "Building frontend",
  building_backend: "Building backend",
  testing: "Testing",
  reviewing: "Reviewing",
  fixing: "Fixing",
  awaiting_code_review: "Awaiting code review",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const RUN_STATUS_VARIANT: Record<RunStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  researching: "secondary",
  awaiting_plan_review: "default",
  designing: "secondary",
  building_frontend: "secondary",
  building_backend: "secondary",
  testing: "secondary",
  reviewing: "secondary",
  fixing: "secondary",
  awaiting_code_review: "default",
  completed: "outline",
  failed: "destructive",
  cancelled: "outline",
};

export function RunStatusBadge({ status }: { status: RunStatus }) {
  return <Badge variant={RUN_STATUS_VARIANT[status]}>{RUN_STATUS_LABEL[status]}</Badge>;
}

const STEP_STATUS_VARIANT: Record<StepStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  running: "secondary",
  succeeded: "outline",
  failed: "destructive",
  skipped: "outline",
};

export function StepStatusBadge({ status }: { status: StepStatus }) {
  return <Badge variant={STEP_STATUS_VARIANT[status]}>{status}</Badge>;
}
