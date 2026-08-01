import { eq } from 'drizzle-orm';
import { Transactional } from '../src/libs/decorators/transactional.decorator';
import { db, pool } from '../src/libs/database/drizzle-client';
import { usersTable } from '../src/libs/database/schema';
import { UserEntity } from '../src/modules/shared/domain/entities/user.entity';
import { UserRepository } from '../src/modules/users/infrastructure/persistence/user.repository';

/**
 * Exercises `@Transactional()` against a real Postgres instance (see docker-compose.yml).
 * Requires `pnpm db:migrate` to have created the `users` table first.
 */
class TransactionHarness {
  constructor(private readonly userRepo: UserRepository) {}

  @Transactional()
  async createAndCommit(email: string): Promise<UserEntity> {
    return this.userRepo.create(
      new UserEntity({ username: 'commit-user', email }),
    );
  }

  @Transactional()
  async createThenRollback(email: string): Promise<never> {
    await this.userRepo.create(
      new UserEntity({ username: 'rollback-user', email }),
    );
    throw new Error('forced rollback');
  }
}

describe('Transactional decorator (real Postgres)', () => {
  const userRepo = new UserRepository(db);
  const harness = new TransactionHarness(userRepo);

  afterAll(async () => {
    await pool.end();
  });

  it('commits the transaction when the method succeeds', async () => {
    const email = `commit-${Date.now()}@example.com`;

    const created = await harness.createAndCommit(email);

    const found = await userRepo.findById(created.id!);
    expect(found).not.toBeNull();
    expect(found?.email).toBe(email);
  });

  it('rolls back the transaction when the method throws', async () => {
    const email = `rollback-${Date.now()}@example.com`;

    await expect(harness.createThenRollback(email)).rejects.toThrow(
      'forced rollback',
    );

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    expect(rows).toHaveLength(0);
  });
});
