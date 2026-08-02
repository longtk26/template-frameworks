import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type { DrizzleClient, DrizzleDb } from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { roleConfigsTable } from '../../../../libs/database/schema';
import { RoleConfigEntity } from '../../../shared/domain/entities/role-config.entity';
import { AgentRole } from '../../../shared/domain/types';
import { IRoleConfigRepository } from '../../ports/output/role-config-repository.port';

type RoleConfigRow = typeof roleConfigsTable.$inferSelect;

@Injectable()
export class RoleConfigRepository implements IRoleConfigRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async findGlobalDefault(role: AgentRole): Promise<RoleConfigEntity | null> {
    const [row] = await this.client
      .select()
      .from(roleConfigsTable)
      .where(
        and(eq(roleConfigsTable.role, role), isNull(roleConfigsTable.projectId)),
      )
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findProjectOverride(
    projectId: string,
    role: AgentRole,
  ): Promise<RoleConfigEntity | null> {
    const [row] = await this.client
      .select()
      .from(roleConfigsTable)
      .where(
        and(
          eq(roleConfigsTable.role, role),
          eq(roleConfigsTable.projectId, projectId),
        ),
      )
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findAll(projectId?: string): Promise<RoleConfigEntity[]> {
    const rows = await this.client
      .select()
      .from(roleConfigsTable)
      .where(
        projectId
          ? eq(roleConfigsTable.projectId, projectId)
          : isNull(roleConfigsTable.projectId),
      );
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<RoleConfigEntity | null> {
    const [row] = await this.client
      .select()
      .from(roleConfigsTable)
      .where(eq(roleConfigsTable.id, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async update(
    id: string,
    changes: Partial<
      Pick<
        RoleConfigEntity,
        'model' | 'systemPromptTemplate' | 'allowedTools' | 'mcpServers' | 'skills' | 'enabled'
      >
    >,
  ): Promise<RoleConfigEntity> {
    const [row] = await this.client
      .update(roleConfigsTable)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(roleConfigsTable.id, id))
      .returning();
    return this.toEntity(row);
  }

  async insert(config: RoleConfigEntity): Promise<RoleConfigEntity> {
    const [row] = await this.client
      .insert(roleConfigsTable)
      .values({
        projectId: config.projectId,
        role: config.role,
        model: config.model,
        systemPromptTemplate: config.systemPromptTemplate,
        allowedTools: config.allowedTools,
        mcpServers: config.mcpServers,
        skills: config.skills,
        enabled: config.enabled,
      })
      .returning();
    return this.toEntity(row);
  }

  private toEntity(row: RoleConfigRow): RoleConfigEntity {
    return new RoleConfigEntity({
      id: row.id,
      projectId: row.projectId,
      role: row.role,
      model: row.model,
      systemPromptTemplate: row.systemPromptTemplate,
      allowedTools: row.allowedTools,
      mcpServers: row.mcpServers,
      skills: row.skills,
      enabled: row.enabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
