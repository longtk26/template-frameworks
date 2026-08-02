import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type { DrizzleClient, DrizzleDb } from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { stepEventsTable } from '../../../../libs/database/schema';
import { StepEventEntity } from '../../../shared/domain/entities/step-event.entity';
import { IStepEventRepository } from '../../ports/output/step-event-repository.port';

type StepEventRow = typeof stepEventsTable.$inferSelect;

@Injectable()
export class StepEventRepository implements IStepEventRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async create(event: StepEventEntity): Promise<StepEventEntity> {
    const [row] = await this.client
      .insert(stepEventsTable)
      .values({
        stepId: event.stepId,
        seq: event.seq,
        type: event.type,
        payload: event.payload,
      })
      .returning();
    return this.toEntity(row);
  }

  async findByStep(stepId: string): Promise<StepEventEntity[]> {
    const rows = await this.client
      .select()
      .from(stepEventsTable)
      .where(eq(stepEventsTable.stepId, stepId))
      .orderBy(asc(stepEventsTable.seq));
    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: StepEventRow): StepEventEntity {
    return new StepEventEntity({
      id: row.id,
      stepId: row.stepId,
      seq: row.seq,
      type: row.type,
      payload: row.payload,
      createdAt: row.createdAt,
    });
  }
}
