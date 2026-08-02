/**
 * Query option factories for TanStack Query — see the pattern description this template
 * shipped with (each factory returns `{ queryKey, queryFn }`, usable from both a loader's
 * `prefetchQuery` and a component's `useQuery`).
 */
import { apiFetch } from "./api-fetch";

export type RunStatus =
  | "pending"
  | "researching"
  | "awaiting_plan_review"
  | "designing"
  | "building_frontend"
  | "building_backend"
  | "testing"
  | "reviewing"
  | "fixing"
  | "awaiting_code_review"
  | "completed"
  | "failed"
  | "cancelled";

export type AgentRole = "researcher" | "designer" | "frontend" | "backend" | "tester" | "reviewer";
export type StepStatus = "pending" | "running" | "succeeded" | "failed" | "skipped";
export type ArtifactType = "plan_md" | "design_md" | "diff" | "test_report" | "review_report" | "other";
export type ReviewKind = "plan_review" | "code_review";
export type ReviewStatus = "pending" | "approved" | "changes_requested";
export type NotificationType =
  | "plan_ready_for_review"
  | "code_ready_for_review"
  | "run_completed"
  | "run_failed"
  | "step_failed";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  repoUrl: string;
  defaultBranch: string;
  backendFramework: string;
  frontendFramework: string;
  bootstrapFromTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineRun {
  id: string;
  projectId: string;
  title: string;
  requestDescription: string;
  isNewFeature: boolean;
  status: RunStatus;
  branchName: string | null;
  worktreePath: string | null;
  fixIterationCount: number;
  maxFixIterations: number;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface RunStep {
  id: string;
  runId: string;
  role: AgentRole;
  attemptNumber: number;
  sequenceIndex: number;
  status: StepStatus;
  claudeSessionId: string | null;
  summary: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface StepEvent {
  id: string;
  stepId: string;
  seq: number;
  type: "assistant_text" | "tool_use" | "tool_result" | "system_init" | "result" | "error";
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface Artifact {
  id: string;
  runId: string;
  stepId: string | null;
  type: ArtifactType;
  title: string;
  content: string;
  filePath: string | null;
  createdAt: string;
}

export interface ReviewCheckpoint {
  id: string;
  runId: string;
  kind: ReviewKind;
  iterationNumber: number;
  status: ReviewStatus;
  reviewerNote: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  runId: string | null;
  stepId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface McpServerConfig {
  name: string;
  enabled: boolean;
  config: Record<string, unknown> | null;
}

export interface RoleConfig {
  id: string;
  projectId: string | null;
  role: AgentRole;
  model: string;
  systemPromptTemplate: string;
  allowedTools: string[];
  mcpServers: McpServerConfig[];
  skills: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const roleConfigQueries = {
  all: () => ({ queryKey: ["role-configs"] as const }),

  list: (projectId?: string) =>
    ({
      queryKey: ["role-configs", "list", projectId ?? "global"] as const,
      queryFn: () =>
        apiFetch<RoleConfig[]>("/role-configs", { params: projectId ? { projectId } : undefined }),
    }) as const,
};

export const projectQueries = {
  all: () => ({ queryKey: ["projects"] as const }),

  list: () =>
    ({
      queryKey: ["projects", "list"] as const,
      queryFn: () => apiFetch<Project[]>("/projects"),
    }) as const,

  detail: (id: string) =>
    ({
      queryKey: ["projects", "detail", id] as const,
      queryFn: () => apiFetch<Project>(`/projects/${id}`),
    }) as const,
};

export const runQueries = {
  all: () => ({ queryKey: ["runs"] as const }),

  list: (projectId: string) =>
    ({
      queryKey: ["runs", "list", projectId] as const,
      queryFn: () => apiFetch<PipelineRun[]>("/runs", { params: { projectId } }),
    }) as const,

  detail: (runId: string) =>
    ({
      queryKey: ["runs", "detail", runId] as const,
      queryFn: () => apiFetch<PipelineRun>(`/runs/${runId}`),
    }) as const,

  steps: (runId: string) =>
    ({
      queryKey: ["runs", "detail", runId, "steps"] as const,
      queryFn: () => apiFetch<RunStep[]>(`/runs/${runId}/steps`),
    }) as const,

  stepEvents: (runId: string, stepId: string) =>
    ({
      queryKey: ["runs", "detail", runId, "steps", stepId, "events"] as const,
      queryFn: () => apiFetch<StepEvent[]>(`/runs/${runId}/steps/${stepId}/events`),
    }) as const,

  artifacts: (runId: string) =>
    ({
      queryKey: ["runs", "detail", runId, "artifacts"] as const,
      queryFn: () => apiFetch<Artifact[]>(`/runs/${runId}/artifacts`),
    }) as const,

  reviewCheckpoints: (runId: string) =>
    ({
      queryKey: ["runs", "detail", runId, "review-checkpoints"] as const,
      queryFn: () => apiFetch<ReviewCheckpoint[]>(`/runs/${runId}/review-checkpoints`),
    }) as const,

  diff: (runId: string) =>
    ({
      queryKey: ["runs", "detail", runId, "diff"] as const,
      queryFn: () => apiFetch<{ diff: string }>(`/runs/${runId}/diff`),
    }) as const,
};

export const notificationQueries = {
  list: () =>
    ({
      queryKey: ["notifications"] as const,
      queryFn: () =>
        apiFetch<{ notifications: AppNotification[]; unreadCount: number }>("/notifications"),
    }) as const,
};
