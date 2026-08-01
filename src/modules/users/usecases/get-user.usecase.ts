import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../ports/output/user-repository.port';
import { GetUserResponseDto } from '../presenter/dtos/get-user.dto';

@Injectable()
export class GetUserUsecase {
  constructor(
    @Inject(IUserRepository) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<GetUserResponseDto> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id!,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
    };
  }
}
