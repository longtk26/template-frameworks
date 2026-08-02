import { Inject, Injectable, Logger } from '@nestjs/common';
import { join, resolve } from 'node:path';
import { SerialQueue } from '../../../../libs/concurrency/serial-queue';
import { EnvService } from '../../../../configs/env.service';
import { IRunRepository } from '../../ports/output/run-repository.port';
import { IRunStepRepository } from '../../ports/output/run-step-repository.port';
import { IStepEventRepository } from '../../ports/output/step-event-repository.port';
import { IArtifactRepository } from '../../ports/output/artifact-repository.port';
import { IReviewCheckpointRepository } from '../../ports/output/review-checkpoint-repository.port';
import { IProjectRepository } from '../../../projects/ports/output/project-repository.port';
import { IGitService } from '../../../git/ports/output/git-service.port';
import {
  resolveBackendTemplateBranch,
  resolveFrontendTemplateBranch,
} from '../../../git/template-frameworks';
import { IAgentRunner, AgentRunInput } from '../../../agent-runner/ports/output/agent-runner.port';
import { GetEffectiveRoleConfigUsecase } from '../../../role-configs/usecases/get-effective-role-config.usecase';
import { IRealtimeBroadcaster } from '../../../realtime/ports/output/realtime-broadcaster.port';
import { CreateNotificationUsecase } from '../../../notifications/usecases/create-notification.usecase';
import { PipelineRunEntity } from '../../../shared/domain/entities/pipeline-run.entity';
import { RunStepEntity } from '../../../shared/domain/entities/run-step.entity';
import { StepEventEntity } from '../../../shared/domain/entities/step-event.entity';
import { ArtifactEntity } from '../../../shared/domain/entities/artifact.entity';
import { ReviewCheckpointEntity } from '../../../shared/domain/entities/review-checkpoint.entity';
import { AgentRole, ArtifactType } from '../../../shared/domain/types';
import {
  ACTIVE_STATUSES as _ACTIVE_STATUSES,
  FIX_LOOP_ROLES,
  ROLE_FOR_STATUS,
  computeNextStatus,
  isActiveStatus,
} from '../../domain/run-state-machine';
import { buildSystemPrompt } from './role-prompt-context';
import {
  readArtifactFileOrFallback,
  readPdmMarkdownFiles,
  reviewReportHasBlockingIssues,
} from './read-artifact-file';

type StepOutcome = { hasBlockingIssues?: boolean };

const ARTIFACT_TYPE_FOR_ROLE: Partial<Record<AgentRole, ArtifactType>> = {
  researcher: 'plan_md',
  designer: 'design_md',
  reviewer: 'review_report',
};

/**
 * The pipeline's state machine engine. Given a runId, drives `pipeline_runs.status` forward
 * (see run-state-machine.ts for the pure transition table), invoking git/agent-runner through
 * the global SerialQueue, persisting every step/event/artifact, broadcasting over SSE, and
 * stopping at the two human checkpoints (or a terminal state) to wait.
 */
@Injectable()
export class RunOrchestratorService {
  private readonly logger = new Logger(RunOrchestratorService.name);

  constructor(
    @Inject(IRunRepository) private readonly runRepo: IRunRepository,
    @Inject(IRunStepRepository) private readonly runStepRepo: IRunStepRepository,
    @Inject(IStepEventRepository) private readonly stepEventRepo: IStepEventRepository,
    @Inject(IArtifactRepository) private readonly artifactRepo: IArtifactRepository,
    @Inject(IReviewCheckpointRepository)
    private readonly reviewCheckpointRepo: IReviewCheckpointRepository,
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
    @Inject(IGitService) private readonly gitService: IGitService,
    @Inject(IAgentRunner) private readonly agentRunner: IAgentRunner,
    @Inject(IRealtimeBroadcaster) private readonly broadcaster: IRealtimeBroadcaster,
    private readonly getEffectiveRoleConfigUsecase: GetEffectiveRoleConfigUsecase,
    private readonly createNotificationUsecase: CreateNotificationUsecase,
    private readonly serialQueue: SerialQueue,
    private readonly envService: EnvService,
  ) {}

  /** Fire-and-forget entry point — callers (create-run, approve/request-changes usecases)
   * do not await this; it drives the run forward in the background. */
  async advance(runId: string): Promise<void> {
    try {
      await this.advanceInternal(runId);
    } catch (err) {
      this.logger.error(
        `advance(${runId}) crashed outside its per-step error handling`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  private async advanceInternal(runId: string): Promise<void> {
    for (;;) {
      let run = await this.runRepo.findById(runId);
      if (!run) return;

      if (run.status === 'pending') {
        run = await this.setupGitWorktree(run);
        await this.applyNextStatus(run, {});
        continue;
      }

      if (!isActiveStatus(run.status)) {
        return; // waiting on a human checkpoint, or a terminal state
      }

      let outcome: StepOutcome = {};
      try {
        if (run.status === 'fixing') {
          await this.runFixLoop(run);
        } else {
          outcome = await this.runRoleStep(run, ROLE_FOR_STATUS[run.status]!);
        }
      } catch (err) {
        await this.failRun(run, err);
        return;
      }

      await this.applyNextStatus(run, outcome);
    }
  }

  private async setupGitWorktree(run: PipelineRunEntity): Promise<PipelineRunEntity> {
    const project = await this.projectRepo.findById(run.projectId);
    if (!project) throw new Error(`Project ${run.projectId} not found`);

    const mirrorPath = await this.gitService.ensureRepoMirror({
      repoUrl: project.repoUrl,
      existingMirrorPath: project.mirrorPath,
      defaultBranch: project.defaultBranch,
    });
    if (mirrorPath !== project.mirrorPath) {
      await this.projectRepo.update(project.id!, { mirrorPath });
    }

    const branchName = `run/${run.id!.slice(0, 8)}-${slugify(run.title)}`;
    const worktreePath = join(resolve(this.envService.gitWorkspacesDir), 'runs', run.id!);

    await this.gitService.createWorktree({
      mirrorPath,
      defaultBranch: project.defaultBranch,
      branchName,
      worktreePath,
    });

    if (project.bootstrapFromTemplate) {
      await this.bootstrapSubdirectoryIfNeeded(
        worktreePath,
        'backend',
        resolveBackendTemplateBranch(project.backendFramework),
        project.backendFramework,
      );
      await this.bootstrapSubdirectoryIfNeeded(
        worktreePath,
        'frontend',
        resolveFrontendTemplateBranch(project.frontendFramework),
        project.frontendFramework,
      );
    }

    const updated = await this.runRepo.update(run.id!, {
      branchName,
      worktreePath,
      startedAt: new Date(),
    });
    this.broadcaster.emitRunUpdated(run.id!, updated);
    return updated;
  }

  private async bootstrapSubdirectoryIfNeeded(
    worktreePath: string,
    subdirectory: 'backend' | 'frontend',
    templateBranch: string | null,
    frameworkValue: string,
  ): Promise<void> {
    if (!templateBranch) {
      this.logger.warn(
        `bootstrapFromTemplate is set but '${frameworkValue}' has no known ` +
          `template-frameworks branch for ${subdirectory} — skipping`,
      );
      return;
    }

    const bootstrapped = await this.gitService.bootstrapFromTemplate({
      worktreePath,
      subdirectory,
      templateRepoUrl: this.envService.templateFrameworksRepoUrl,
      templateBranch,
    });
    if (bootstrapped) {
      await this.gitService.commitAll(
        worktreePath,
        `chore: bootstrap ${subdirectory}/ from template-frameworks (${templateBranch})`,
      );
    }
  }

  private async runFixLoop(run: PipelineRunEntity): Promise<void> {
    for (const role of FIX_LOOP_ROLES) {
      await this.runRoleStep(run, role);
    }
  }

  private async runRoleStep(run: PipelineRunEntity, role: AgentRole): Promise<StepOutcome> {
    const existingSteps = await this.runStepRepo.findAllByRun(run.id!);
    const attemptNumber = existingSteps.filter((s) => s.role === role).length + 1;
    const sequenceIndex = existingSteps.length;

    const roleConfig = await this.getEffectiveRoleConfigUsecase.execute(run.projectId, role);

    if (!roleConfig.enabled) {
      const skipped = await this.runStepRepo.create(
        new RunStepEntity({
          runId: run.id!,
          role,
          attemptNumber,
          sequenceIndex,
          status: 'skipped',
        }),
      );
      this.broadcaster.emitStepUpdated(run.id!, skipped);
      return {};
    }

    const project = await this.projectRepo.findById(run.projectId);
    if (!project) throw new Error(`Project ${run.projectId} not found`);

    let step = await this.runStepRepo.create(
      new RunStepEntity({
        runId: run.id!,
        role,
        attemptNumber,
        sequenceIndex,
        status: 'running',
        startedAt: new Date(),
      }),
    );
    this.broadcaster.emitStepUpdated(run.id!, step);

    // The plan can be multiple files (pdm/epic-*/story-*.md) — concatenate all of them with
    // headers so downstream roles see the full plan, not just whichever row is "latest".
    const allArtifacts = await this.artifactRepo.findAllByRun(run.id!);
    const planArtifacts = allArtifacts
      .filter((a) => a.type === 'plan_md')
      .sort((a, b) => (a.filePath ?? '').localeCompare(b.filePath ?? ''));
    const planMd = planArtifacts.length
      ? planArtifacts.map((a) => `## ${a.filePath ?? a.title}\n\n${a.content}`).join('\n\n---\n\n')
      : undefined;
    const designArtifact = await this.artifactRepo.findLatestByRunAndType(run.id!, 'design_md');

    const systemPrompt = buildSystemPrompt({
      roleConfig,
      run,
      project,
      planMd,
      designMd: designArtifact?.content,
    });

    const agentInput: AgentRunInput = {
      role,
      runId: run.id!,
      stepId: step.id!,
      cwd: run.worktreePath!,
      systemPrompt,
      model: roleConfig.model,
      allowedTools: roleConfig.allowedTools,
      mcpServers: roleConfig.mcpServers,
      skills: roleConfig.skills,
    };

    // The whole turn is queued as one unit so agent calls from *other* runs can't interleave
    // with it — that's what actually protects the shared subscription rate limit.
    const result = await this.serialQueue.enqueue(() => this.consumeAgentRun(step, agentInput));

    if (result.failed) {
      await this.runStepRepo.update(step.id!, {
        status: 'failed',
        errorMessage: result.errorMessage,
        completedAt: new Date(),
      });
      throw new Error(result.errorMessage ?? `${role} step failed`);
    }

    step = await this.runStepRepo.update(step.id!, {
      status: 'succeeded',
      summary: result.summary,
      claudeSessionId: result.sessionId,
      completedAt: new Date(),
    });
    this.broadcaster.emitStepUpdated(run.id!, step);

    await this.gitService.commitAll(
      run.worktreePath!,
      `${role} (attempt ${attemptNumber}): ${run.title}`,
    );

    return this.persistArtifactIfApplicable(run, step, role, result.summary);
  }

  private async consumeAgentRun(
    step: RunStepEntity,
    input: AgentRunInput,
  ): Promise<{ sessionId: string | null; summary: string; failed: boolean; errorMessage?: string }> {
    let seq = 0;
    let sessionId: string | null = null;
    let summary = '';
    let failed = false;
    let errorMessage: string | undefined;

    for await (const event of this.agentRunner.run(input)) {
      const stepEvent = await this.stepEventRepo.create(
        new StepEventEntity({
          stepId: step.id!,
          seq: seq++,
          type: event.type,
          payload: event as unknown as Record<string, unknown>,
        }),
      );
      this.broadcaster.emitStepLog(step.runId, stepEvent);

      if (event.type === 'system_init') sessionId = event.sessionId;
      if (event.type === 'result') {
        summary = event.summary;
        sessionId = event.sessionId;
      }
      if (event.type === 'error') {
        failed = true;
        errorMessage = event.message;
      }
    }

    return { sessionId, summary, failed, errorMessage };
  }

  private async persistArtifactIfApplicable(
    run: PipelineRunEntity,
    step: RunStepEntity,
    role: AgentRole,
    summary: string,
  ): Promise<StepOutcome> {
    const artifactType = ARTIFACT_TYPE_FOR_ROLE[role];
    if (!artifactType) return {};

    if (role === 'researcher') {
      // The Researcher writes its plan as pdm/epic-*/story-*.md — one artifact row per file
      // so the plan-review page can show epics/stories individually rather than one blob.
      const pdmFiles = readPdmMarkdownFiles(run.worktreePath!);
      if (pdmFiles.length > 0) {
        for (const file of pdmFiles) {
          await this.artifactRepo.create(
            new ArtifactEntity({
              runId: run.id!,
              stepId: step.id!,
              type: artifactType,
              title: file.relativePath,
              content: file.content,
              filePath: file.relativePath,
            }),
          );
        }
        return {};
      }
      // No pdm/ folder (always true for FakeAgentRunner) — fall back to one summary artifact.
    }

    const content = readArtifactFileOrFallback(run.worktreePath!, artifactType, summary);
    await this.artifactRepo.create(
      new ArtifactEntity({
        runId: run.id!,
        stepId: step.id!,
        type: artifactType,
        title: artifactTitle(artifactType),
        content,
      }),
    );

    if (artifactType === 'review_report') {
      return { hasBlockingIssues: reviewReportHasBlockingIssues(content) };
    }
    return {};
  }

  private async applyNextStatus(
    run: PipelineRunEntity,
    outcome: StepOutcome,
  ): Promise<PipelineRunEntity> {
    const next = computeNextStatus({
      status: run.status,
      isNewFeature: run.isNewFeature,
      fixIterationCount: run.fixIterationCount,
      maxFixIterations: run.maxFixIterations,
      reviewerFoundBlockingIssues: outcome.hasBlockingIssues,
    });

    const updated = await this.runRepo.update(run.id!, {
      status: next,
      ...(next === 'fixing' ? { fixIterationCount: run.fixIterationCount + 1 } : {}),
    });
    this.broadcaster.emitRunUpdated(run.id!, updated);

    if (next === 'awaiting_plan_review') {
      await this.reviewCheckpointRepo.create(
        new ReviewCheckpointEntity({ runId: run.id!, kind: 'plan_review' }),
      );
      await this.createNotificationUsecase.execute({
        runId: run.id!,
        type: 'plan_ready_for_review',
        title: `Plan ready for review: ${run.title}`,
        body: 'The Researcher has produced a plan — review it to continue.',
      });
    } else if (next === 'awaiting_code_review') {
      const priorCheckpoints = await this.reviewCheckpointRepo.findAllByRun(run.id!);
      const iterationNumber =
        priorCheckpoints.filter((c) => c.kind === 'code_review').length + 1;
      await this.reviewCheckpointRepo.create(
        new ReviewCheckpointEntity({ runId: run.id!, kind: 'code_review', iterationNumber }),
      );
      await this.createNotificationUsecase.execute({
        runId: run.id!,
        type: 'code_ready_for_review',
        title: `Code ready for review: ${run.title}`,
        body: 'The Reviewer found no blocking issues — review the diff to finish this run.',
      });
    }

    return updated;
  }

  private async failRun(run: PipelineRunEntity, err: unknown): Promise<void> {
    const message = err instanceof Error ? err.message : String(err);
    const updated = await this.runRepo.update(run.id!, { status: 'failed', errorMessage: message });
    this.broadcaster.emitRunUpdated(run.id!, updated);
    this.broadcaster.completeRunStream(run.id!);
    await this.createNotificationUsecase.execute({
      runId: run.id!,
      type: 'run_failed',
      title: `Run failed: ${run.title}`,
      body: message,
    });
  }
}

function artifactTitle(type: ArtifactType): string {
  switch (type) {
    case 'plan_md':
      return 'Plan';
    case 'design_md':
      return 'Design';
    case 'review_report':
      return 'Review report';
    default:
      return type;
  }
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'run'
  );
}
