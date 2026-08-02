import { NotificationEntity } from '../../../shared/domain/entities/notification.entity';

export abstract class INotificationRepository {
  abstract create(notification: NotificationEntity): Promise<NotificationEntity>;
  abstract findAll(): Promise<NotificationEntity[]>;
  abstract countUnread(): Promise<number>;
  abstract markRead(id: string): Promise<NotificationEntity>;
  abstract markAllRead(): Promise<void>;
}
