import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type { DrizzleClient, DrizzleDb } from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { runStepsTable } from '../../../../libs/database/schema';
import { RunStepEntity } from '../../../shared/domain/entities/run-step.entity';
import { IRunStepRepository } from '../../ports/output/run-step-repository.port';

type RunStepRow = typeof runStepsTable.$inferSelect;

@Injectable()
export class RunStepRepository implements IRunStepRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async create(step: RunStepEntity): Promise<RunStepEntity> {
    const [row] = await this.client
      .insert(runStepsTable)
      .values({
        runId: step.runId,
        role: step.role,
        attemptNumber: step.attemptNumber,
        sequenceIndex: step.sequenceIndex,
        status: step.status,
        startedAt: step.startedAt,
      })
      .returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<RunStepEntity | null> {
    const [row] = await this.client
      .select()
      .from(runStepsTable)
      .where(eq(runStepsTable.id, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findAllByRun(runId: string): Promise<RunStepEntity[]> {
    const rows = await this.client
      .select()
      .from(runStepsTable)
      .where(eq(runStepsTable.runId, runId))
      .orderBy(asc(runStepsTable.sequenceIndex));
    return rows.map((row) => this.toEntity(row));
  }

  async countByRun(runId: string): Promise<number> {
    const [result] = await this.client
      .select({ count: sql<number>`count(*)::int` })
      .from(runStepsTable)
      .where(eq(runStepsTable.runId, runId));
    return result?.count ?? 0;
  }

  async update(
    id: string,
    changes: Partial<{
      status: RunStepEntity['status'];
      claudeSessionId: string | null;
      summary: string | null;
      errorMessage: string | null;
      startedAt: Date | null;
      completedAt: Date | null;
    }>,
  ): Promise<RunStepEntity> {
    const [row] = await this.client
      .update(runStepsTable)
      .set(changes)
      .where(eq(runStepsTable.id, id))
      .returning();
    return this.toEntity(row);
  }

  private toEntity(row: RunStepRow): RunStepEntity {
    return new RunStepEntity({
      id: row.id,
      runId: row.runId,
      role: row.role,
      attemptNumber: row.attemptNumber,
      sequenceIndex: row.sequenceIndex,
      status: row.status,
      claudeSessionId: row.claudeSessionId,
      summary: row.summary,
      errorMessage: row.errorMessage,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
    });
  }
}
