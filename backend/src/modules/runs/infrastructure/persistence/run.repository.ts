import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type { DrizzleClient, DrizzleDb } from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { pipelineRunsTable } from '../../../../libs/database/schema';
import { PipelineRunEntity } from '../../../shared/domain/entities/pipeline-run.entity';
import { IRunRepository } from '../../ports/output/run-repository.port';

type RunRow = typeof pipelineRunsTable.$inferSelect;

@Injectable()
export class RunRepository implements IRunRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async create(run: PipelineRunEntity): Promise<PipelineRunEntity> {
    const [row] = await this.client
      .insert(pipelineRunsTable)
      .values({
        projectId: run.projectId,
        title: run.title,
        requestDescription: run.requestDescription,
        isNewFeature: run.isNewFeature,
        status: run.status,
        maxFixIterations: run.maxFixIterations,
      })
      .returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<PipelineRunEntity | null> {
    const [row] = await this.client
      .select()
      .from(pipelineRunsTable)
      .where(eq(pipelineRunsTable.id, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findAllByProject(projectId: string): Promise<PipelineRunEntity[]> {
    const rows = await this.client
      .select()
      .from(pipelineRunsTable)
      .where(eq(pipelineRunsTable.projectId, projectId))
      .orderBy(desc(pipelineRunsTable.createdAt));
    return rows.map((row) => this.toEntity(row));
  }

  async update(
    id: string,
    changes: Partial<{
      status: PipelineRunEntity['status'];
      branchName: string | null;
      worktreePath: string | null;
      fixIterationCount: number;
      errorMessage: string | null;
      startedAt: Date | null;
      completedAt: Date | null;
    }>,
  ): Promise<PipelineRunEntity> {
    const [row] = await this.client
      .update(pipelineRunsTable)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(pipelineRunsTable.id, id))
      .returning();
    return this.toEntity(row);
  }

  private toEntity(row: RunRow): PipelineRunEntity {
    return new PipelineRunEntity({
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      requestDescription: row.requestDescription,
      isNewFeature: row.isNewFeature,
      status: row.status,
      branchName: row.branchName,
      worktreePath: row.worktreePath,
      fixIterationCount: row.fixIterationCount,
      maxFixIterations: row.maxFixIterations,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      updatedAt: row.updatedAt,
    });
  }
}
