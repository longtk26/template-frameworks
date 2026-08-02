// String-union types mirroring the pg enums in libs/database/schema.ts — kept here so
// usecases/entities never need to import the Drizzle schema module directly.
export type RunStatus =
  | 'pending'
  | 'researching'
  | 'awaiting_plan_review'
  | 'designing'
  | 'building_frontend'
  | 'building_backend'
  | 'testing'
  | 'reviewing'
  | 'fixing'
  | 'awaiting_code_review'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AgentRole =
  | 'researcher'
  | 'designer'
  | 'frontend'
  | 'backend'
  | 'tester'
  | 'reviewer';

export const AGENT_ROLE_SEQUENCE: AgentRole[] = [
  'researcher',
  'designer',
  'frontend',
  'backend',
  'tester',
  'reviewer',
];

export type StepStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';

export type StepEventType =
  | 'assistant_text'
  | 'tool_use'
  | 'tool_result'
  | 'system_init'
  | 'result'
  | 'error';

export type ArtifactType =
  | 'plan_md'
  | 'design_md'
  | 'diff'
  | 'test_report'
  | 'review_report'
  | 'other';

export type ReviewKind = 'plan_review' | 'code_review';

export type ReviewStatus = 'pending' | 'approved' | 'changes_requested';

export type NotificationType =
  | 'plan_ready_for_review'
  | 'code_ready_for_review'
  | 'run_completed'
  | 'run_failed'
  | 'step_failed';

export type McpServerConfig = {
  name: string;
  enabled: boolean;
  config: Record<string, unknown> | null;
};
