import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq, isNull, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type { DrizzleClient, DrizzleDb } from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { notificationsTable } from '../../../../libs/database/schema';
import { NotificationEntity } from '../../../shared/domain/entities/notification.entity';
import { INotificationRepository } from '../../ports/output/notification-repository.port';

type NotificationRow = typeof notificationsTable.$inferSelect;

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async create(notification: NotificationEntity): Promise<NotificationEntity> {
    const [row] = await this.client
      .insert(notificationsTable)
      .values({
        runId: notification.runId,
        stepId: notification.stepId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
      })
      .returning();
    return this.toEntity(row);
  }

  async findAll(): Promise<NotificationEntity[]> {
    const rows = await this.client
      .select()
      .from(notificationsTable)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(100);
    return rows.map((row) => this.toEntity(row));
  }

  async countUnread(): Promise<number> {
    const [result] = await this.client
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationsTable)
      .where(isNull(notificationsTable.readAt));
    return result?.count ?? 0;
  }

  async markRead(id: string): Promise<NotificationEntity> {
    const [row] = await this.client
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(eq(notificationsTable.id, id))
      .returning();
    if (!row) {
      throw new NotFoundException('Notification not found');
    }
    return this.toEntity(row);
  }

  async markAllRead(): Promise<void> {
    await this.client
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(isNull(notificationsTable.readAt));
  }

  private toEntity(row: NotificationRow): NotificationEntity {
    return new NotificationEntity({
      id: row.id,
      runId: row.runId,
      stepId: row.stepId,
      type: row.type,
      title: row.title,
      body: row.body,
      readAt: row.readAt,
      createdAt: row.createdAt,
    });
  }
}
