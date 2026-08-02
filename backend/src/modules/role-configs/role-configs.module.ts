import { Module } from '@nestjs/common';
import { RoleConfigController } from './presenter/role-config.controller';
import { GetEffectiveRoleConfigUsecase } from './usecases/get-effective-role-config.usecase';
import { ListRoleConfigsUsecase } from './usecases/list-role-configs.usecase';
import { UpdateRoleConfigUsecase } from './usecases/update-role-config.usecase';
import { IRoleConfigRepository } from './ports/output/role-config-repository.port';
import { RoleConfigRepository } from './infrastructure/persistence/role-config.repository';

@Module({
  controllers: [RoleConfigController],
  providers: [
    { provide: IRoleConfigRepository, useClass: RoleConfigRepository },
    GetEffectiveRoleConfigUsecase,
    ListRoleConfigsUsecase,
    UpdateRoleConfigUsecase,
  ],
  exports: [IRoleConfigRepository, GetEffectiveRoleConfigUsecase],
})
export class RoleConfigsModule {}
