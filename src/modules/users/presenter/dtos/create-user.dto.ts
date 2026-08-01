import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { UserEntity } from '../../../shared/domain/entities/user.entity';

export class CreateUserRequestDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  toEntity(): UserEntity {
    return new UserEntity({
      username: this.username,
      email: this.email,
      isActive: this.isActive,
    });
  }
}

export class CreateUserResponseDto {
  id: string;
}
