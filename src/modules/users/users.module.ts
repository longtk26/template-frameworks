import { Module } from '@nestjs/common';
import { UserController } from './presenter/user.controller';
import { CreateUserUsecase } from './usecases/create-user.usecase';
import { GetUserUsecase } from './usecases/get-user.usecase';
import { IUserRepository } from './ports/output/user-repository.port';
import { UserRepository } from './infrastructure/persistence/user.repository';

@Module({
  controllers: [UserController],
  providers: [
    { provide: IUserRepository, useClass: UserRepository },
    CreateUserUsecase,
    GetUserUsecase,
  ],
})
export class UsersModule {}
