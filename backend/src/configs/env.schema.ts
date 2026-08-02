import { z } from 'zod';

export const envSchema = z.object({
  APP_NAME: z.string().default('Agent Orchestrator'),
  PORT: z.coerce.number().int().positive().default(8080),
  DB_URL: z.string().min(1, 'DB_URL is required'),
  GIT_WORKSPACES_DIR: z.string().default('./.workspaces'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // 'fake' (default) costs nothing and is safe for local dev/tests; switch a role over to
  // 'claude' only once you're ready to spend real subscription usage on it (see agent-runner.module.ts).
  AGENT_RUNNER_MODE: z.enum(['fake', 'claude']).default('fake'),
  // Cloned (branch matched to backendFramework) into a brand-new project's worktree when
  // `projects.bootstrapFromTemplate` is set — see modules/git/template-frameworks.ts.
  TEMPLATE_FRAMEWORKS_REPO_URL: z
    .string()
    .default('https://github.com/longtk26/template-frameworks'),
});

export type Env = z.infer<typeof envSchema>;
