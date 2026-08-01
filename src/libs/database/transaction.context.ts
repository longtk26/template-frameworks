import { AsyncLocalStorage } from 'node:async_hooks';
import type { DrizzleClient, DrizzleDb } from './drizzle-client';

export const transactionStorage = new AsyncLocalStorage<DrizzleClient>();

/**
 * Returns the active transaction bound by `@Transactional()`, falling back to `fallback`
 * when no transaction is in progress for the current async context.
 */
export function getDb(fallback: DrizzleDb): DrizzleClient {
  return transactionStorage.getStore() ?? fallback;
}
