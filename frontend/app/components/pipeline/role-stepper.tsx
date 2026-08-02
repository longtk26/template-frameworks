import { cn } from "~/lib/utils";
import type { AgentRole, RunStep } from "~/lib/queries";

const ROLE_SEQUENCE: AgentRole[] = ["researcher", "designer", "frontend", "backend", "tester", "reviewer"];
const ROLE_LABEL: Record<AgentRole, string> = {
  researcher: "Researcher",
  designer: "Designer",
  frontend: "Frontend",
  backend: "Backend",
  tester: "Tester",
  reviewer: "Reviewer",
};

function latestStepForRole(steps: RunStep[], role: AgentRole): RunStep | undefined {
  return steps
    .filter((step) => step.role === role)
    .sort((a, b) => a.attemptNumber - b.attemptNumber)
    .at(-1);
}

const NODE_CLASS: Record<RunStep["status"] | "not_started", string> = {
  not_started: "border-border bg-background text-muted-foreground",
  pending: "border-border bg-background text-muted-foreground",
  running: "border-primary bg-primary/10 text-primary animate-pulse",
  succeeded: "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  failed: "border-destructive bg-destructive/10 text-destructive",
  skipped: "border-border bg-muted text-muted-foreground",
};

export function RoleStepper({
  steps,
  isNewFeature,
  selectedStepId,
  onSelectStep,
}: {
  steps: RunStep[];
  isNewFeature: boolean;
  selectedStepId: string | null;
  onSelectStep: (step: RunStep) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ROLE_SEQUENCE.map((role) => {
        const isSkippedByDesign = role === "researcher" && !isNewFeature;
        const step = latestStepForRole(steps, role);
        const status = isSkippedByDesign ? "skipped" : (step?.status ?? "not_started");
        const clickable = !!step;

        return (
          <button
            key={role}
            type="button"
            disabled={!clickable}
            onClick={() => step && onSelectStep(step)}
            className={cn(
              "flex min-w-32 flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left text-sm transition-colors",
              NODE_CLASS[status],
              clickable && "cursor-pointer hover:brightness-95",
              !clickable && "cursor-default opacity-60",
              selectedStepId && step?.id === selectedStepId && "ring-2 ring-ring",
            )}
          >
            <span className="font-medium">{ROLE_LABEL[role]}</span>
            <span className="text-xs opacity-80">
              {status === "not_started" ? "not started" : status}
              {step && step.attemptNumber > 1 ? ` (attempt ${step.attemptNumber})` : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
