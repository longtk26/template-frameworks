import { UserEntity } from '../../../shared/domain/entities/user.entity';

export abstract class IUserRepository {
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract findById(id: string): Promise<UserEntity | null>;
}
