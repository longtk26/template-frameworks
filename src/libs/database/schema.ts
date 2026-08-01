// Every Drizzle table lives in this single file — drizzle-kit points at it for migration
// generation, and repositories import their tables from here directly.
import { boolean, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
});
