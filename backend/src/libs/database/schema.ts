// Every Drizzle table lives in this single file — drizzle-kit points at it for migration
// generation, and repositories import their tables from here directly.
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const runStatusEnum = pgEnum('run_status', [
  'pending',
  'researching',
  'awaiting_plan_review',
  'designing',
  'building_frontend',
  'building_backend',
  'testing',
  'reviewing',
  'fixing',
  'awaiting_code_review',
  'completed',
  'failed',
  'cancelled',
]);

export const agentRoleEnum = pgEnum('agent_role', [
  'researcher',
  'designer',
  'frontend',
  'backend',
  'tester',
  'reviewer',
]);

export const stepStatusEnum = pgEnum('step_status', [
  'pending',
  'running',
  'succeeded',
  'failed',
  'skipped',
]);

export const stepEventTypeEnum = pgEnum('step_event_type', [
  'assistant_text',
  'tool_use',
  'tool_result',
  'system_init',
  'result',
  'error',
]);

export const artifactTypeEnum = pgEnum('artifact_type', [
  'plan_md',
  'design_md',
  'diff',
  'test_report',
  'review_report',
  'other',
]);

export const reviewKindEnum = pgEnum('review_kind', [
  'plan_review',
  'code_review',
]);

export const reviewStatusEnum = pgEnum('review_status', [
  'pending',
  'approved',
  'changes_requested',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'plan_ready_for_review',
  'code_ready_for_review',
  'run_completed',
  'run_failed',
  'step_failed',
]);

// role_configs.mcp_servers shape — see agent-runner module for how `enabled`/`config`
// decide whether an MCP server is actually passed to the SDK for a given role invocation.
export type McpServerConfig = {
  name: string;
  enabled: boolean;
  config: Record<string, unknown> | null;
};

export const projectsTable = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  repoUrl: varchar('repo_url', { length: 500 }).notNull(),
  defaultBranch: varchar('default_branch', { length: 255 })
    .notNull()
    .default('main'),
  // Shared local mirror of `repoUrl` — reused across every project/run that points at the
  // same repo, since the real convention is one repo with many branches, not one repo per project.
  mirrorPath: varchar('mirror_path', { length: 1000 }),
  backendFramework: varchar('backend_framework', { length: 100 })
    .notNull()
    .default('nestjs'),
  frontendFramework: varchar('frontend_framework', { length: 100 })
    .notNull()
    .default('react-router'),
  // Set once at project-creation time — if true, the first run's Backend setup clones
  // longtk26/template-frameworks (branch matched to backendFramework) into the worktree
  // before any role starts working, but only if the worktree turns out to be empty.
  bootstrapFromTemplate: boolean('bootstrap_from_template').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const pipelineRunsTable = pgTable('pipeline_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectsTable.id),
  title: varchar('title', { length: 255 }).notNull(),
  // The feature/change request text every agent role reads as its starting context.
  requestDescription: text('request_description').notNull(),
  isNewFeature: boolean('is_new_feature').notNull().default(false),
  status: runStatusEnum('status').notNull().default('pending'),
  branchName: varchar('branch_name', { length: 255 }),
  worktreePath: varchar('worktree_path', { length: 1000 }),
  fixIterationCount: integer('fix_iteration_count').notNull().default(0),
  maxFixIterations: integer('max_fix_iterations').notNull().default(3),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const runStepsTable = pgTable('run_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id')
    .notNull()
    .references(() => pipelineRunsTable.id),
  role: agentRoleEnum('role').notNull(),
  // Increments on re-run (fix loop / human-requested revision) instead of overwriting history.
  attemptNumber: integer('attempt_number').notNull().default(1),
  sequenceIndex: integer('sequence_index').notNull(),
  status: stepStatusEnum('status').notNull().default('pending'),
  claudeSessionId: varchar('claude_session_id', { length: 255 }),
  summary: text('summary'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const stepEventsTable = pgTable('step_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  stepId: uuid('step_id')
    .notNull()
    .references(() => runStepsTable.id),
  seq: integer('seq').notNull(),
  type: stepEventTypeEnum('type').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const artifactsTable = pgTable('artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id')
    .notNull()
    .references(() => pipelineRunsTable.id),
  stepId: uuid('step_id').references(() => runStepsTable.id),
  type: artifactTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  // Holds PLAN.md/DESIGN.md text, unified-diff text, or a review report — whatever fits `type`.
  content: text('content').notNull(),
  filePath: varchar('file_path', { length: 1000 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reviewCheckpointsTable = pgTable('review_checkpoints', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id')
    .notNull()
    .references(() => pipelineRunsTable.id),
  kind: reviewKindEnum('kind').notNull(),
  iterationNumber: integer('iteration_number').notNull().default(1),
  status: reviewStatusEnum('status').notNull().default('pending'),
  reviewerNote: text('reviewer_note'),
  decidedAt: timestamp('decided_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id').references(() => pipelineRunsTable.id),
  stepId: uuid('step_id').references(() => runStepsTable.id),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const roleConfigsTable = pgTable('role_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  // null = global default for the role, overridable per project.
  projectId: uuid('project_id').references(() => projectsTable.id),
  role: agentRoleEnum('role').notNull(),
  model: varchar('model', { length: 100 }).notNull().default('claude-sonnet-5'),
  systemPromptTemplate: text('system_prompt_template').notNull(),
  allowedTools: jsonb('allowed_tools').$type<string[]>().notNull().default([]),
  mcpServers: jsonb('mcp_servers')
    .$type<McpServerConfig[]>()
    .notNull()
    .default([]),
  skills: jsonb('skills').$type<string[]>().notNull().default([]),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
