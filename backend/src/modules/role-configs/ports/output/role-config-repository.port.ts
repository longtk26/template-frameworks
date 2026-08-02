import { RoleConfigEntity } from '../../../shared/domain/entities/role-config.entity';
import { AgentRole } from '../../../shared/domain/types';

export abstract class IRoleConfigRepository {
  abstract findGlobalDefault(role: AgentRole): Promise<RoleConfigEntity | null>;
  abstract findProjectOverride(
    projectId: string,
    role: AgentRole,
  ): Promise<RoleConfigEntity | null>;
  abstract findAll(projectId?: string): Promise<RoleConfigEntity[]>;
  abstract findById(id: string): Promise<RoleConfigEntity | null>;
  abstract update(
    id: string,
    changes: Partial<
      Pick<
        RoleConfigEntity,
        'model' | 'systemPromptTemplate' | 'allowedTools' | 'mcpServers' | 'skills' | 'enabled'
      >
    >,
  ): Promise<RoleConfigEntity>;
  abstract insert(config: RoleConfigEntity): Promise<RoleConfigEntity>;
}
