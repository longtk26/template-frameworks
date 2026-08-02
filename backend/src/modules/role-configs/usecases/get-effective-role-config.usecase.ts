import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRoleConfigRepository } from '../ports/output/role-config-repository.port';
import { RoleConfigEntity } from '../../shared/domain/entities/role-config.entity';
import { AgentRole } from '../../shared/domain/types';

/**
 * Resolves the role config the agent-runner should actually use for a given project:
 * a project-specific override if one exists, else the global default for that role.
 */
@Injectable()
export class GetEffectiveRoleConfigUsecase {
  constructor(
    @Inject(IRoleConfigRepository)
    private readonly roleConfigRepo: IRoleConfigRepository,
  ) {}

  async execute(projectId: string, role: AgentRole): Promise<RoleConfigEntity> {
    const override = await this.roleConfigRepo.findProjectOverride(projectId, role);
    if (override) {
      return override;
    }
    const globalDefault = await this.roleConfigRepo.findGlobalDefault(role);
    if (!globalDefault) {
      throw new NotFoundException(
        `No role config found for role '${role}' — run 'pnpm seed' to seed the global defaults`,
      );
    }
    return globalDefault;
  }
}
