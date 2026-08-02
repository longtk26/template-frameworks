import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRunRepository } from '../ports/output/run-repository.port';
import { IReviewCheckpointRepository } from '../ports/output/review-checkpoint-repository.port';
import { IRealtimeBroadcaster } from '../../realtime/ports/output/realtime-broadcaster.port';
import { CreateNotificationUsecase } from '../../notifications/usecases/create-notification.usecase';
import { PipelineRunEntity } from '../../shared/domain/entities/pipeline-run.entity';

@Injectable()
export class ApproveCodeReviewUsecase {
  constructor(
    @Inject(IRunRepository) private readonly runRepo: IRunRepository,
    @Inject(IReviewCheckpointRepository)
    private readonly reviewCheckpointRepo: IReviewCheckpointRepository,
    @Inject(IRealtimeBroadcaster) private readonly broadcaster: IRealtimeBroadcaster,
    private readonly createNotificationUsecase: CreateNotificationUsecase,
  ) {}

  async execute(runId: string): Promise<PipelineRunEntity> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new NotFoundException('Run not found');
    if (run.status !== 'awaiting_code_review') {
      throw new BadRequestException(
        `Run is '${run.status}', not 'awaiting_code_review' — nothing to approve`,
      );
    }

    const checkpoint = await this.reviewCheckpointRepo.findLatestPending(runId, 'code_review');
    if (!checkpoint) throw new NotFoundException('No pending code review checkpoint found');

    await this.reviewCheckpointRepo.update(checkpoint.id!, {
      status: 'approved',
      decidedAt: new Date(),
    });
    // Terminal state — no more agent work follows, so this finalizes directly rather than
    // going through the orchestrator's advance() loop.
    const updated = await this.runRepo.update(runId, {
      status: 'completed',
      completedAt: new Date(),
    });
    this.broadcaster.emitRunUpdated(runId, updated);
    this.broadcaster.completeRunStream(runId);
    await this.createNotificationUsecase.execute({
      runId,
      type: 'run_completed',
      title: `Run completed: ${run.title}`,
      body: 'You approved the code review — this run is done.',
    });

    return updated;
  }
}
