import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '../../../libs/decorators/transactional.decorator';
import { IUserRepository } from '../ports/output/user-repository.port';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from '../presenter/dtos/create-user.dto';

@Injectable()
export class CreateUserUsecase {
  constructor(
    @Inject(IUserRepository) private readonly userRepo: IUserRepository,
  ) {}

  @Transactional()
  async execute(dto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const user = await this.userRepo.create(dto.toEntity());
    return { id: user.id! };
  }
}
