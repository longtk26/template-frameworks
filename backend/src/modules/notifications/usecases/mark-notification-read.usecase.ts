import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '../../../libs/decorators/transactional.decorator';
import { INotificationRepository } from '../ports/output/notification-repository.port';
import { NotificationEntity } from '../../shared/domain/entities/notification.entity';

@Injectable()
export class MarkNotificationReadUsecase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  @Transactional()
  execute(id: string): Promise<NotificationEntity> {
    return this.notificationRepo.markRead(id);
  }
}
