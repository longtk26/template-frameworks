import { AgentRole, McpServerConfig } from '../../../shared/domain/types';

export type AgentEvent =
  | { type: 'system_init'; sessionId: string }
  | { type: 'assistant_text'; text: string }
  | { type: 'tool_use'; name: string; input: unknown }
  | { type: 'tool_result'; toolUseId: string; output: unknown; isError?: boolean }
  | { type: 'result'; summary: string; sessionId: string }
  | { type: 'error'; message: string };

export type AgentRunInput = {
  role: AgentRole;
  runId: string;
  stepId: string;
  /** Working directory — the git worktree for this run. */
  cwd: string;
  /** Fully-rendered system prompt (template substitution already applied by the caller). */
  systemPrompt: string;
  model: string;
  allowedTools: string[];
  mcpServers: McpServerConfig[];
  /** Skill names this role expects to be available — the runner warns (not fails) if missing. */
  skills: string[];
};

export abstract class IAgentRunner {
  abstract run(input: AgentRunInput): AsyncGenerator<AgentEvent>;
}
