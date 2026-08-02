import { Inject, Injectable } from '@nestjs/common';
import { INotificationRepository } from '../ports/output/notification-repository.port';
import { NotificationEntity } from '../../shared/domain/entities/notification.entity';

@Injectable()
export class ListNotificationsUsecase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(): Promise<{ notifications: NotificationEntity[]; unreadCount: number }> {
    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepo.findAll(),
      this.notificationRepo.countUnread(),
    ]);
    return { notifications, unreadCount };
  }
}
