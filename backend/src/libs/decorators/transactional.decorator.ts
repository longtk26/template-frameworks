import { db } from '../database/drizzle-client';
import { transactionStorage } from '../database/transaction.context';

/**
 * Method-level decorator that wraps a use-case method in a database transaction.
 *
 * - Auto-commits when the method resolves successfully.
 * - Auto-rolls back when the method throws.
 *
 * The active transaction is propagated via AsyncLocalStorage, so any repository called
 * (directly or transitively) during the method's execution transparently joins the same
 * transaction — no need to thread a transaction object through constructors.
 *
 * Usage:
 *   class CreateUserUsecase {
 *     constructor(private readonly userRepo: IUserRepository) {}
 *
 *     @Transactional()
 *     async execute(dto: CreateUserRequestDto) {
 *       return this.userRepo.create(dto.toEntity());
 *     }
 *   }
 */
export function Transactional(): MethodDecorator {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      return db.transaction((tx) =>
        transactionStorage.run(
          tx,
          () => original.apply(this, args) as Promise<unknown>,
        ),
      );
    };

    return descriptor;
  };
}
