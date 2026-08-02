import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type { DrizzleClient, DrizzleDb } from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { reviewCheckpointsTable } from '../../../../libs/database/schema';
import { ReviewCheckpointEntity } from '../../../shared/domain/entities/review-checkpoint.entity';
import { ReviewKind } from '../../../shared/domain/types';
import { IReviewCheckpointRepository } from '../../ports/output/review-checkpoint-repository.port';

type ReviewCheckpointRow = typeof reviewCheckpointsTable.$inferSelect;

@Injectable()
export class ReviewCheckpointRepository implements IReviewCheckpointRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async create(checkpoint: ReviewCheckpointEntity): Promise<ReviewCheckpointEntity> {
    const [row] = await this.client
      .insert(reviewCheckpointsTable)
      .values({
        runId: checkpoint.runId,
        kind: checkpoint.kind,
        iterationNumber: checkpoint.iterationNumber,
        status: checkpoint.status,
      })
      .returning();
    return this.toEntity(row);
  }

  async findLatestPending(
    runId: string,
    kind: ReviewKind,
  ): Promise<ReviewCheckpointEntity | null> {
    const [row] = await this.client
      .select()
      .from(reviewCheckpointsTable)
      .where(
        and(
          eq(reviewCheckpointsTable.runId, runId),
          eq(reviewCheckpointsTable.kind, kind),
          eq(reviewCheckpointsTable.status, 'pending'),
        ),
      )
      .orderBy(desc(reviewCheckpointsTable.iterationNumber))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findAllByRun(runId: string): Promise<ReviewCheckpointEntity[]> {
    const rows = await this.client
      .select()
      .from(reviewCheckpointsTable)
      .where(eq(reviewCheckpointsTable.runId, runId))
      .orderBy(asc(reviewCheckpointsTable.createdAt));
    return rows.map((row) => this.toEntity(row));
  }

  async update(
    id: string,
    changes: Partial<{
      status: ReviewCheckpointEntity['status'];
      reviewerNote: string | null;
      decidedAt: Date;
    }>,
  ): Promise<ReviewCheckpointEntity> {
    const [row] = await this.client
      .update(reviewCheckpointsTable)
      .set(changes)
      .where(eq(reviewCheckpointsTable.id, id))
      .returning();
    return this.toEntity(row);
  }

  private toEntity(row: ReviewCheckpointRow): ReviewCheckpointEntity {
    return new ReviewCheckpointEntity({
      id: row.id,
      runId: row.runId,
      kind: row.kind,
      iterationNumber: row.iterationNumber,
      status: row.status,
      reviewerNote: row.reviewerNote,
      decidedAt: row.decidedAt,
      createdAt: row.createdAt,
    });
  }
}
