import { Module } from '@nestjs/common';
import { EnvModule } from '../../configs/env.module';
import { EnvService } from '../../configs/env.service';
import { IAgentRunner } from './ports/output/agent-runner.port';
import { FakeAgentRunner } from './infrastructure/fake-agent-runner.service';
import { ClaudeAgentSdkRunner } from './infrastructure/claude-agent-sdk-runner.service';

@Module({
  imports: [EnvModule],
  providers: [
    FakeAgentRunner,
    ClaudeAgentSdkRunner,
    {
      provide: IAgentRunner,
      useFactory: (envService: EnvService, fake: FakeAgentRunner, real: ClaudeAgentSdkRunner) =>
        envService.agentRunnerMode === 'claude' ? real : fake,
      inject: [EnvService, FakeAgentRunner, ClaudeAgentSdkRunner],
    },
  ],
  exports: [IAgentRunner],
})
export class AgentRunnerModule {}
