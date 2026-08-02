import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../libs/database/database.module';
import type { DrizzleClient, DrizzleDb } from '../../../../libs/database/drizzle-client';
import { getDb } from '../../../../libs/database/transaction.context';
import { projectsTable } from '../../../../libs/database/schema';
import { ProjectEntity } from '../../../shared/domain/entities/project.entity';
import { IProjectRepository } from '../../ports/output/project-repository.port';

type ProjectRow = typeof projectsTable.$inferSelect;

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private get client(): DrizzleClient {
    return getDb(this.db);
  }

  async create(project: ProjectEntity): Promise<ProjectEntity> {
    const [row] = await this.client
      .insert(projectsTable)
      .values({
        name: project.name,
        description: project.description,
        repoUrl: project.repoUrl,
        defaultBranch: project.defaultBranch,
        mirrorPath: project.mirrorPath,
        backendFramework: project.backendFramework,
        frontendFramework: project.frontendFramework,
        bootstrapFromTemplate: project.bootstrapFromTemplate,
      })
      .returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    const [row] = await this.client
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findAll(): Promise<ProjectEntity[]> {
    const rows = await this.client
      .select()
      .from(projectsTable)
      .orderBy(projectsTable.createdAt);
    return rows.map((row) => this.toEntity(row));
  }

  async update(
    id: string,
    changes: Partial<
      Pick<
        ProjectEntity,
        | 'name'
        | 'description'
        | 'defaultBranch'
        | 'mirrorPath'
        | 'backendFramework'
        | 'frontendFramework'
      >
    >,
  ): Promise<ProjectEntity> {
    const [row] = await this.client
      .update(projectsTable)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(projectsTable.id, id))
      .returning();
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(projectsTable).where(eq(projectsTable.id, id));
  }

  private toEntity(row: ProjectRow): ProjectEntity {
    return new ProjectEntity({
      id: row.id,
      name: row.name,
      description: row.description,
      repoUrl: row.repoUrl,
      defaultBranch: row.defaultBranch,
      mirrorPath: row.mirrorPath,
      backendFramework: row.backendFramework,
      frontendFramework: row.frontendFramework,
      bootstrapFromTemplate: row.bootstrapFromTemplate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
