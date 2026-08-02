import { Inject, Injectable } from '@nestjs/common';
import { IRoleConfigRepository } from '../ports/output/role-config-repository.port';
import { RoleConfigEntity } from '../../shared/domain/entities/role-config.entity';

@Injectable()
export class ListRoleConfigsUsecase {
  constructor(
    @Inject(IRoleConfigRepository)
    private readonly roleConfigRepo: IRoleConfigRepository,
  ) {}

  execute(projectId?: string): Promise<RoleConfigEntity[]> {
    return this.roleConfigRepo.findAll(projectId);
  }
}
