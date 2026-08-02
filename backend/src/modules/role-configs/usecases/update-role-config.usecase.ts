import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '../../../libs/decorators/transactional.decorator';
import { IRoleConfigRepository } from '../ports/output/role-config-repository.port';
import { RoleConfigEntity } from '../../shared/domain/entities/role-config.entity';
import { UpdateRoleConfigRequestDto } from '../presenter/dtos/update-role-config.dto';

@Injectable()
export class UpdateRoleConfigUsecase {
  constructor(
    @Inject(IRoleConfigRepository)
    private readonly roleConfigRepo: IRoleConfigRepository,
  ) {}

  @Transactional()
  async execute(
    id: string,
    dto: UpdateRoleConfigRequestDto,
  ): Promise<RoleConfigEntity> {
    const existing = await this.roleConfigRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Role config not found');
    }
    return this.roleConfigRepo.update(id, dto);
  }
}
