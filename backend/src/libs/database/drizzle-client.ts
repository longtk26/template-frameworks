import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../../configs/env';

export const pool = new Pool({ connectionString: env.DB_URL });

export const db = drizzle(pool);

export type DrizzleDb = typeof db;
export type DrizzleTransaction = Parameters<
  Parameters<DrizzleDb['transaction']>[0]
>[0];
export type DrizzleClient = DrizzleDb | DrizzleTransaction;
