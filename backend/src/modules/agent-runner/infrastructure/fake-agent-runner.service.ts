import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AgentEvent, AgentRunInput, IAgentRunner } from '../ports/output/agent-runner.port';

/**
 * Scripted, zero-cost stand-in for the real Claude Agent SDK runner — used until a role is
 * ready to be wired to the real one (see AGENT_RUNNER_MODE in env), and in every automated
 * test so state-machine/e2e tests never spend real Claude usage.
 */
@Injectable()
export class FakeAgentRunner implements IAgentRunner {
  async *run(input: AgentRunInput): AsyncGenerator<AgentEvent> {
    const sessionId = randomUUID();
    yield { type: 'system_init', sessionId };
    await sleep(300);
    yield {
      type: 'assistant_text',
      text: `[fake ${input.role}] Working on: ${input.systemPrompt.slice(0, 80)}...`,
    };
    await sleep(300);
    yield {
      type: 'result',
      summary: `[fake] ${input.role} step completed with no real changes (FakeAgentRunner).`,
      sessionId,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
