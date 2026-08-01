import { z } from 'zod';

export const envSchema = z.object({
  APP_NAME: z.string().default('My NestJS Application'),
  PORT: z.coerce.number().int().positive().default(8080),
  DB_URL: z.string().min(1, 'DB_URL is required'),
});

export type Env = z.infer<typeof envSchema>;
