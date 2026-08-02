import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { RoleConfigsModule } from '../role-configs/role-configs.module';
import { GitModule } from '../git/git.module';
import { AgentRunnerModule } from '../agent-runner/agent-runner.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RunController } from './presenter/run.controller';
import { RunOrchestratorService } from './infrastructure/orchestration/run-orchestrator.service';
import { CreateRunUsecase } from './usecases/create-run.usecase';
import { ApprovePlanReviewUsecase } from './usecases/approve-plan-review.usecase';
import { RequestPlanChangesUsecase } from './usecases/request-plan-changes.usecase';
import { ApproveCodeReviewUsecase } from './usecases/approve-code-review.usecase';
import { RequestCodeChangesUsecase } from './usecases/request-code-changes.usecase';
import { GetRunUsecase } from './usecases/get-run.usecase';
import { ListRunsUsecase } from './usecases/list-runs.usecase';
import { ListRunStepsUsecase } from './usecases/list-run-steps.usecase';
import { GetStepEventsUsecase } from './usecases/get-step-events.usecase';
import { GetRunDiffUsecase } from './usecases/get-run-diff.usecase';
import { CancelRunUsecase } from './usecases/cancel-run.usecase';
import { ListArtifactsUsecase } from './usecases/list-artifacts.usecase';
import { ListReviewCheckpointsUsecase } from './usecases/list-review-checkpoints.usecase';
import { IRunRepository } from './ports/output/run-repository.port';
import { RunRepository } from './infrastructure/persistence/run.repository';
import { IRunStepRepository } from './ports/output/run-step-repository.port';
import { RunStepRepository } from './infrastructure/persistence/run-step.repository';
import { IStepEventRepository } from './ports/output/step-event-repository.port';
import { StepEventRepository } from './infrastructure/persistence/step-event.repository';
import { IArtifactRepository } from './ports/output/artifact-repository.port';
import { ArtifactRepository } from './infrastructure/persistence/artifact.repository';
import { IReviewCheckpointRepository } from './ports/output/review-checkpoint-repository.port';
import { ReviewCheckpointRepository } from './infrastructure/persistence/review-checkpoint.repository';

@Module({
  imports: [ProjectsModule, RoleConfigsModule, GitModule, AgentRunnerModule, NotificationsModule],
  controllers: [RunController],
  providers: [
    { provide: IRunRepository, useClass: RunRepository },
    { provide: IRunStepRepository, useClass: RunStepRepository },
    { provide: IStepEventRepository, useClass: StepEventRepository },
    { provide: IArtifactRepository, useClass: ArtifactRepository },
    { provide: IReviewCheckpointRepository, useClass: ReviewCheckpointRepository },
    RunOrchestratorService,
    CreateRunUsecase,
    ApprovePlanReviewUsecase,
    RequestPlanChangesUsecase,
    ApproveCodeReviewUsecase,
    RequestCodeChangesUsecase,
    GetRunUsecase,
    ListRunsUsecase,
    ListRunStepsUsecase,
    GetStepEventsUsecase,
    GetRunDiffUsecase,
    CancelRunUsecase,
    ListArtifactsUsecase,
    ListReviewCheckpointsUsecase,
  ],
})
export class RunsModule {}
