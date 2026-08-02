import { Inject, Injectable } from '@nestjs/common';
import { IReviewCheckpointRepository } from '../ports/output/review-checkpoint-repository.port';
import { ReviewCheckpointEntity } from '../../shared/domain/entities/review-checkpoint.entity';

@Injectable()
export class ListReviewCheckpointsUsecase {
  constructor(
    @Inject(IReviewCheckpointRepository)
    private readonly reviewCheckpointRepo: IReviewCheckpointRepository,
  ) {}

  execute(runId: string): Promise<ReviewCheckpointEntity[]> {
    return this.reviewCheckpointRepo.findAllByRun(runId);
  }
}
