import { ReviewKind, ReviewStatus } from '../types';

export class ReviewCheckpointEntity {
  id?: string;
  runId: string;
  kind: ReviewKind;
  iterationNumber: number;
  status: ReviewStatus;
  reviewerNote: string | null;
  decidedAt: Date | null;
  createdAt?: Date;

  constructor(props: {
    id?: string;
    runId: string;
    kind: ReviewKind;
    iterationNumber?: number;
    status?: ReviewStatus;
    reviewerNote?: string | null;
    decidedAt?: Date | null;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.runId = props.runId;
    this.kind = props.kind;
    this.iterationNumber = props.iterationNumber ?? 1;
    this.status = props.status ?? 'pending';
    this.reviewerNote = props.reviewerNote ?? null;
    this.decidedAt = props.decidedAt ?? null;
    this.createdAt = props.createdAt;
  }
}
