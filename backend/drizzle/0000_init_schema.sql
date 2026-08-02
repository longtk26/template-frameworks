CREATE TYPE "public"."agent_role" AS ENUM('researcher', 'designer', 'frontend', 'backend', 'tester', 'reviewer');--> statement-breakpoint
CREATE TYPE "public"."artifact_type" AS ENUM('plan_md', 'design_md', 'diff', 'test_report', 'review_report', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('plan_ready_for_review', 'code_ready_for_review', 'run_completed', 'run_failed', 'step_failed');--> statement-breakpoint
CREATE TYPE "public"."review_kind" AS ENUM('plan_review', 'code_review');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'changes_requested');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('pending', 'researching', 'awaiting_plan_review', 'designing', 'building_frontend', 'building_backend', 'testing', 'reviewing', 'fixing', 'awaiting_code_review', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."step_event_type" AS ENUM('assistant_text', 'tool_use', 'tool_result', 'system_init', 'result', 'error');--> statement-breakpoint
CREATE TYPE "public"."step_status" AS ENUM('pending', 'running', 'succeeded', 'failed', 'skipped');--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"step_id" uuid,
	"type" "artifact_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"file_path" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid,
	"step_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"request_description" text NOT NULL,
	"is_new_feature" boolean DEFAULT false NOT NULL,
	"status" "run_status" DEFAULT 'pending' NOT NULL,
	"branch_name" varchar(255),
	"worktree_path" varchar(1000),
	"fix_iteration_count" integer DEFAULT 0 NOT NULL,
	"max_fix_iterations" integer DEFAULT 3 NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"repo_url" varchar(500) NOT NULL,
	"default_branch" varchar(255) DEFAULT 'main' NOT NULL,
	"mirror_path" varchar(1000),
	"backend_framework" varchar(100) DEFAULT 'nestjs' NOT NULL,
	"frontend_framework" varchar(100) DEFAULT 'react-router' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"kind" "review_kind" NOT NULL,
	"iteration_number" integer DEFAULT 1 NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"reviewer_note" text,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"role" "agent_role" NOT NULL,
	"model" varchar(100) DEFAULT 'claude-sonnet-5' NOT NULL,
	"system_prompt_template" text NOT NULL,
	"allowed_tools" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mcp_servers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"role" "agent_role" NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"sequence_index" integer NOT NULL,
	"status" "step_status" DEFAULT 'pending' NOT NULL,
	"claude_session_id" varchar(255),
	"summary" text,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"step_id" uuid NOT NULL,
	"seq" integer NOT NULL,
	"type" "step_event_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_run_id_pipeline_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."pipeline_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_step_id_run_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."run_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_run_id_pipeline_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."pipeline_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_step_id_run_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."run_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_checkpoints" ADD CONSTRAINT "review_checkpoints_run_id_pipeline_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."pipeline_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_configs" ADD CONSTRAINT "role_configs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_run_id_pipeline_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."pipeline_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_events" ADD CONSTRAINT "step_events_step_id_run_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."run_steps"("id") ON DELETE no action ON UPDATE no action;