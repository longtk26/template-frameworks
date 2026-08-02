import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListRoleConfigsUsecase } from '../usecases/list-role-configs.usecase';
import { UpdateRoleConfigUsecase } from '../usecases/update-role-config.usecase';
import { UpdateRoleConfigRequestDto } from './dtos/update-role-config.dto';
import { RoleConfigEntity } from '../../shared/domain/entities/role-config.entity';

@ApiTags('role-configs')
@Controller('role-configs')
export class RoleConfigController {
  constructor(
    private readonly listRoleConfigsUsecase: ListRoleConfigsUsecase,
    private readonly updateRoleConfigUsecase: UpdateRoleConfigUsecase,
  ) {}

  @Get()
  list(@Query('projectId') projectId?: string): Promise<RoleConfigEntity[]> {
    return this.listRoleConfigsUsecase.execute(projectId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleConfigRequestDto,
  ): Promise<RoleConfigEntity> {
    return this.updateRoleConfigUsecase.execute(id, dto);
  }
}
