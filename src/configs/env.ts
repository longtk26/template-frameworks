import 'dotenv/config';
import { envSchema, type Env } from './env.schema';

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment variables — ${issues}`);
  }
  return result.data;
}

// Validated once at process start — fails fast on a missing/malformed env var
// instead of surfacing as a confusing error deep inside the app.
export const env: Env = loadEnv();
