import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './libs/database/drizzle-client';

// Run on container start (see Dockerfile) so every deploy applies any pending
// migrations before the app boots. Uses drizzle-orm's migrator directly instead
// of the drizzle-kit CLI so the production image doesn't need that devDependency.
async function main() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations applied successfully');
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error('Migration failed:', err);
  process.exitCode = 1;
});
