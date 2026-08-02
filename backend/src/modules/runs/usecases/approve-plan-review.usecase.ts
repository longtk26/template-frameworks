import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRunRepository } from '../ports/output/run-repository.port';
import { IReviewCheckpointRepository } from '../ports/output/review-checkpoint-repository.port';
import { RunOrchestratorService } from '../infrastructure/orchestration/run-orchestrator.service';
import { PipelineRunEntity } from '../../shared/domain/entities/pipeline-run.entity';

@Injectable()
export class ApprovePlanReviewUsecase {
  constructor(
    @Inject(IRunRepository) private readonly runRepo: IRunRepository,
    @Inject(IReviewCheckpointRepository)
    private readonly reviewCheckpointRepo: IReviewCheckpointRepository,
    private readonly runOrchestrator: RunOrchestratorService,
  ) {}

  // Not @Transactional(): advance() below must only run once these writes are committed.
  async execute(runId: string): Promise<PipelineRunEntity> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new NotFoundException('Run not found');
    if (run.status !== 'awaiting_plan_review') {
      throw new BadRequestException(
        `Run is '${run.status}', not 'awaiting_plan_review' — nothing to approve`,
      );
    }

    const checkpoint = await this.reviewCheckpointRepo.findLatestPending(runId, 'plan_review');
    if (!checkpoint) throw new NotFoundException('No pending plan review checkpoint found');

    await this.reviewCheckpointRepo.update(checkpoint.id!, {
      status: 'approved',
      decidedAt: new Date(),
    });
    const updated = await this.runRepo.update(runId, { status: 'designing' });

    void this.runOrchestrator.advance(runId);

    return updated;
  }
}
