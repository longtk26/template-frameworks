import { apiFetch } from "./api-fetch";
import type { McpServerConfig, PipelineRun, Project, RoleConfig } from "./queries";

export interface CreateProjectDto {
  name: string;
  description?: string;
  repoUrl: string;
  defaultBranch?: string;
  backendFramework?: string;
  bootstrapFromTemplate?: boolean;
}

export const projectMutations = {
  create: () => ({
    mutationFn: (dto: CreateProjectDto) =>
      apiFetch<Project, CreateProjectDto>("/projects", { method: "POST", body: dto }),
  }),
};

export interface CreateRunDto {
  projectId: string;
  title: string;
  requestDescription: string;
  isNewFeature?: boolean;
}

export interface DecideReviewDto {
  runId: string;
  note?: string;
}

export const runMutations = {
  create: () => ({
    mutationFn: (dto: CreateRunDto) =>
      apiFetch<PipelineRun, CreateRunDto>("/runs", { method: "POST", body: dto }),
  }),

  cancel: () => ({
    mutationFn: (runId: string) =>
      apiFetch<PipelineRun>(`/runs/${runId}/cancel`, { method: "POST" }),
  }),

  approvePlanReview: () => ({
    mutationFn: (runId: string) =>
      apiFetch<PipelineRun>(`/runs/${runId}/plan-review/approve`, { method: "POST" }),
  }),

  requestPlanChanges: () => ({
    mutationFn: ({ runId, note }: DecideReviewDto) =>
      apiFetch<PipelineRun, { note?: string }>(`/runs/${runId}/plan-review/request-changes`, {
        method: "POST",
        body: { note },
      }),
  }),

  approveCodeReview: () => ({
    mutationFn: (runId: string) =>
      apiFetch<PipelineRun>(`/runs/${runId}/code-review/approve`, { method: "POST" }),
  }),

  requestCodeChanges: () => ({
    mutationFn: ({ runId, note }: DecideReviewDto) =>
      apiFetch<PipelineRun, { note?: string }>(`/runs/${runId}/code-review/request-changes`, {
        method: "POST",
        body: { note },
      }),
  }),
};

export interface UpdateRoleConfigDto {
  model?: string;
  systemPromptTemplate?: string;
  allowedTools?: string[];
  mcpServers?: McpServerConfig[];
  skills?: string[];
  enabled?: boolean;
}

export const roleConfigMutations = {
  update: () => ({
    mutationFn: ({ id, ...dto }: UpdateRoleConfigDto & { id: string }) =>
      apiFetch<RoleConfig, UpdateRoleConfigDto>(`/role-configs/${id}`, {
        method: "PATCH",
        body: dto,
      }),
  }),
};

export const notificationMutations = {
  markRead: () => ({
    mutationFn: (id: string) => apiFetch<void>(`/notifications/${id}/read`, { method: "PATCH" }),
  }),

  markAllRead: () => ({
    mutationFn: () => apiFetch<void>("/notifications/read-all", { method: "PATCH" }),
  }),
};
