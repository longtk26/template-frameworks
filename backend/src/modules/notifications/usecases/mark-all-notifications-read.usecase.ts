import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '../../../libs/decorators/transactional.decorator';
import { INotificationRepository } from '../ports/output/notification-repository.port';

@Injectable()
export class MarkAllNotificationsReadUsecase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  @Transactional()
  execute(): Promise<void> {
    return this.notificationRepo.markAllRead();
  }
}
