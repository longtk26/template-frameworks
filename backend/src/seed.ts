import { db, pool } from './libs/database/drizzle-client';
import { roleConfigsTable } from './libs/database/schema';
import { isNull, and, eq } from 'drizzle-orm';
import { DEFAULT_ROLE_CONFIGS } from './modules/role-configs/default-role-configs';

// Idempotent: run manually once per environment (`pnpm seed`) to insert the 6 global
// default role_configs rows if they don't already exist. Safe to re-run.
async function main() {
  try {
    for (const config of DEFAULT_ROLE_CONFIGS) {
      const [existing] = await db
        .select({ id: roleConfigsTable.id })
        .from(roleConfigsTable)
        .where(
          and(
            eq(roleConfigsTable.role, config.role),
            isNull(roleConfigsTable.projectId),
          ),
        )
        .limit(1);
      if (existing) {
        console.log(`role_configs: '${config.role}' global default already exists, skipping`);
        continue;
      }
      await db.insert(roleConfigsTable).values({
        role: config.role,
        model: config.model,
        systemPromptTemplate: config.systemPromptTemplate,
        allowedTools: config.allowedTools,
        mcpServers: config.mcpServers,
        skills: config.skills,
        enabled: config.enabled,
      });
      console.log(`role_configs: seeded '${config.role}' global default`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exitCode = 1;
});
