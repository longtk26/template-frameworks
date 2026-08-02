import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRunRepository } from '../ports/output/run-repository.port';
import { IRealtimeBroadcaster } from '../../realtime/ports/output/realtime-broadcaster.port';
import { PipelineRunEntity } from '../../shared/domain/entities/pipeline-run.entity';

const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled'];

@Injectable()
export class CancelRunUsecase {
  constructor(
    @Inject(IRunRepository) private readonly runRepo: IRunRepository,
    @Inject(IRealtimeBroadcaster) private readonly broadcaster: IRealtimeBroadcaster,
  ) {}

  async execute(runId: string): Promise<PipelineRunEntity> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new NotFoundException('Run not found');
    if (TERMINAL_STATUSES.includes(run.status)) {
      throw new BadRequestException(`Run is already '${run.status}'`);
    }

    const updated = await this.runRepo.update(runId, { status: 'cancelled' });
    this.broadcaster.emitRunUpdated(runId, updated);
    this.broadcaster.completeRunStream(runId);
    return updated;
  }
}
