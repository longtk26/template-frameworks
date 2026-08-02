import { ReviewCheckpointEntity } from '../../../shared/domain/entities/review-checkpoint.entity';
import { ReviewKind, ReviewStatus } from '../../../shared/domain/types';

export abstract class IReviewCheckpointRepository {
  abstract create(checkpoint: ReviewCheckpointEntity): Promise<ReviewCheckpointEntity>;
  abstract findLatestPending(
    runId: string,
    kind: ReviewKind,
  ): Promise<ReviewCheckpointEntity | null>;
  abstract findAllByRun(runId: string): Promise<ReviewCheckpointEntity[]>;
  abstract update(
    id: string,
    changes: Partial<{ status: ReviewStatus; reviewerNote: string | null; decidedAt: Date }>,
  ): Promise<ReviewCheckpointEntity>;
}
