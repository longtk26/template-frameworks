import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type { DrizzleClient, DrizzleDb } from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { artifactsTable } from '../../../../libs/database/schema';
import { ArtifactEntity } from '../../../shared/domain/entities/artifact.entity';
import { ArtifactType } from '../../../shared/domain/types';
import { IArtifactRepository } from '../../ports/output/artifact-repository.port';

type ArtifactRow = typeof artifactsTable.$inferSelect;

@Injectable()
export class ArtifactRepository implements IArtifactRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async create(artifact: ArtifactEntity): Promise<ArtifactEntity> {
    const [row] = await this.client
      .insert(artifactsTable)
      .values({
        runId: artifact.runId,
        stepId: artifact.stepId,
        type: artifact.type,
        title: artifact.title,
        content: artifact.content,
        filePath: artifact.filePath,
      })
      .returning();
    return this.toEntity(row);
  }

  async findAllByRun(runId: string): Promise<ArtifactEntity[]> {
    const rows = await this.client
      .select()
      .from(artifactsTable)
      .where(eq(artifactsTable.runId, runId))
      .orderBy(desc(artifactsTable.createdAt));
    return rows.map((row) => this.toEntity(row));
  }

  async findLatestByRunAndType(
    runId: string,
    type: ArtifactType,
  ): Promise<ArtifactEntity | null> {
    const [row] = await this.client
      .select()
      .from(artifactsTable)
      .where(and(eq(artifactsTable.runId, runId), eq(artifactsTable.type, type)))
      .orderBy(desc(artifactsTable.createdAt))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: ArtifactRow): ArtifactEntity {
    return new ArtifactEntity({
      id: row.id,
      runId: row.runId,
      stepId: row.stepId,
      type: row.type,
      title: row.title,
      content: row.content,
      filePath: row.filePath,
      createdAt: row.createdAt,
    });
  }
}
