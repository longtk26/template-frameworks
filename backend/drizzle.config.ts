import { defineConfig } from 'drizzle-kit';
import { env } from './src/configs/env';

export default defineConfig({
  schema: './src/libs/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DB_URL,
  },
});
