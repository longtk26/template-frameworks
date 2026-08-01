import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type {
  DrizzleClient,
  DrizzleDb,
} from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { usersTable } from '../../../../libs/database/schema';
import { UserEntity } from '../../../shared/domain/entities/user.entity';
import { IUserRepository } from '../../ports/output/user-repository.port';

type UserRow = typeof usersTable.$inferSelect;

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const [row] = await this.client
      .insert(usersTable)
      .values({
        username: user.username,
        email: user.email,
        isActive: user.isActive,
      })
      .returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const [row] = await this.client
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: UserRow): UserEntity {
    return new UserEntity({
      id: row.id,
      username: row.username,
      email: row.email,
      isActive: row.isActive,
    });
  }
}
