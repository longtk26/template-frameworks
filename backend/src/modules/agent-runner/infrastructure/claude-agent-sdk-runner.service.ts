import { Injectable } from '@nestjs/common';
import {
  query,
  type McpServerConfig as SdkMcpServerConfig,
} from '@anthropic-ai/claude-agent-sdk';
import { McpServerConfig } from '../../shared/domain/types';
import { AgentEvent, AgentRunInput, IAgentRunner } from '../ports/output/agent-runner.port';

// A short, fixed kickoff turn — all of the role's real instructions live in `systemPrompt`
// (see role-prompt-builder.ts), so the actual "prompt" here just starts the turn.
const KICKOFF_PROMPT = 'Begin working on this task now.';

/**
 * Real agent runner backed by the Claude Agent SDK. Rides the machine's existing `claude`
 * CLI subscription login rather than API-key billing: the SDK spawns the CLI as a
 * subprocess and resolves credentials exactly like the CLI does, so we explicitly strip
 * any API key/token from the subprocess env to force that path (see buildSdkEnv below).
 */
@Injectable()
export class ClaudeAgentSdkRunner implements IAgentRunner {
  async *run(input: AgentRunInput): AsyncGenerator<AgentEvent> {
    let sessionId = '';
    try {
      const stream = query({
        prompt: KICKOFF_PROMPT,
        options: {
          systemPrompt: input.systemPrompt,
          cwd: input.cwd,
          model: input.model,
          allowedTools: input.allowedTools.length > 0 ? input.allowedTools : undefined,
          mcpServers: buildSdkMcpServers(input.mcpServers),
          permissionMode: 'bypassPermissions',
          allowDangerouslySkipPermissions: true,
          env: buildSdkEnv(),
        },
      });

      for await (const message of stream) {
        switch (message.type) {
          case 'system': {
            if (message.subtype === 'init') {
              sessionId = message.session_id;
              yield { type: 'system_init', sessionId };

              // Cross-check declared expectations against what the CLI actually resolved,
              // rather than guessing skill paths ourselves — warn-and-continue on either.
              for (const skill of input.skills) {
                if (!message.skills.includes(skill)) {
                  yield {
                    type: 'assistant_text',
                    text: `[warning] skill '${skill}' not loaded by the CLI — continuing without it`,
                  };
                }
              }
              const expectedMcpNames = input.mcpServers
                .filter((s) => s.enabled)
                .map((s) => s.name);
              for (const server of message.mcp_servers) {
                if (expectedMcpNames.includes(server.name) && server.status !== 'connected') {
                  yield {
                    type: 'assistant_text',
                    text: `[warning] MCP server '${server.name}' status is '${server.status}', not 'connected' — continuing without it`,
                  };
                }
              }
            }
            break;
          }
          case 'assistant': {
            sessionId = message.session_id;
            for (const block of message.message.content) {
              if (block.type === 'text') {
                yield { type: 'assistant_text', text: block.text };
              } else if (block.type === 'tool_use') {
                yield { type: 'tool_use', name: block.name, input: block.input };
              }
            }
            break;
          }
          case 'user': {
            if (message.session_id) sessionId = message.session_id;
            const content = message.message.content;
            if (Array.isArray(content)) {
              for (const block of content) {
                if (block.type === 'tool_result') {
                  yield {
                    type: 'tool_result',
                    toolUseId: block.tool_use_id,
                    output: block.content,
                    isError: block.is_error,
                  };
                }
              }
            }
            break;
          }
          case 'result': {
            sessionId = message.session_id;
            if (message.subtype === 'success') {
              yield { type: 'result', summary: message.result, sessionId };
            } else {
              yield {
                type: 'error',
                message: `Agent run ended with '${message.subtype}' (${message.errors?.join('; ') ?? 'no details'})`,
              };
            }
            break;
          }
          default:
            break; // background/hook/thinking/etc. — not needed for the pipeline's log view
        }
      }
    } catch (err) {
      yield { type: 'error', message: err instanceof Error ? err.message : String(err) };
    }
  }
}

/** Strips API-key auth from the subprocess env so it falls through to the CLI's stored
 * OAuth/subscription credential instead of metered API billing. */
function buildSdkEnv(): Record<string, string | undefined> {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  return env;
}

/** Only entries with a non-null `config` get passed as an explicit override — an entry
 * enabled with `config: null` (e.g. Stitch) is deliberately omitted so the CLI subprocess
 * resolves it from the machine's own already-configured MCP servers instead. */
function buildSdkMcpServers(
  servers: McpServerConfig[],
): Record<string, SdkMcpServerConfig> | undefined {
  const overrides = servers.filter((s) => s.enabled && s.config != null);
  if (overrides.length === 0) return undefined;
  return Object.fromEntries(
    overrides.map((s) => [s.name, s.config as unknown as SdkMcpServerConfig]),
  );
}

