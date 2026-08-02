import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRunRepository } from '../ports/output/run-repository.port';
import { IReviewCheckpointRepository } from '../ports/output/review-checkpoint-repository.port';
import { RunOrchestratorService } from '../infrastructure/orchestration/run-orchestrator.service';
import { PipelineRunEntity } from '../../shared/domain/entities/pipeline-run.entity';
import { DecideReviewRequestDto } from '../presenter/dtos/decide-review.dto';

@Injectable()
export class RequestPlanChangesUsecase {
  constructor(
    @Inject(IRunRepository) private readonly runRepo: IRunRepository,
    @Inject(IReviewCheckpointRepository)
    private readonly reviewCheckpointRepo: IReviewCheckpointRepository,
    private readonly runOrchestrator: RunOrchestratorService,
  ) {}

  async execute(runId: string, dto: DecideReviewRequestDto): Promise<PipelineRunEntity> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new NotFoundException('Run not found');
    if (run.status !== 'awaiting_plan_review') {
      throw new BadRequestException(
        `Run is '${run.status}', not 'awaiting_plan_review' — nothing to request changes on`,
      );
    }

    const checkpoint = await this.reviewCheckpointRepo.findLatestPending(runId, 'plan_review');
    if (!checkpoint) throw new NotFoundException('No pending plan review checkpoint found');

    await this.reviewCheckpointRepo.update(checkpoint.id!, {
      status: 'changes_requested',
      reviewerNote: dto.note ?? null,
      decidedAt: new Date(),
    });
    const updated = await this.runRepo.update(runId, { status: 'researching' });

    void this.runOrchestrator.advance(runId);

    return updated;
  }
}
