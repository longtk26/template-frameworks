import { Module } from '@nestjs/common';
import { EnvModule } from './configs/env.module';
import { DatabaseModule } from './libs/database/database.module';
import { ConcurrencyModule } from './libs/concurrency/concurrency.module';
import { HealthModule } from './modules/health/health.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RoleConfigsModule } from './modules/role-configs/role-configs.module';
import { GitModule } from './modules/git/git.module';
import { AgentRunnerModule } from './modules/agent-runner/agent-runner.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RunsModule } from './modules/runs/runs.module';

@Module({
  imports: [
    EnvModule,
    DatabaseModule,
    ConcurrencyModule,
    RealtimeModule,
    HealthModule,
    ProjectsModule,
    RoleConfigsModule,
    GitModule,
    AgentRunnerModule,
    NotificationsModule,
    RunsModule,
  ],
})
export class AppModule {}
