import { Module } from '@nestjs/common';
import { NotificationController } from './presenter/notification.controller';
import { CreateNotificationUsecase } from './usecases/create-notification.usecase';
import { ListNotificationsUsecase } from './usecases/list-notifications.usecase';
import { MarkNotificationReadUsecase } from './usecases/mark-notification-read.usecase';
import { MarkAllNotificationsReadUsecase } from './usecases/mark-all-notifications-read.usecase';
import { INotificationRepository } from './ports/output/notification-repository.port';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';

@Module({
  controllers: [NotificationController],
  providers: [
    { provide: INotificationRepository, useClass: NotificationRepository },
    CreateNotificationUsecase,
    ListNotificationsUsecase,
    MarkNotificationReadUsecase,
    MarkAllNotificationsReadUsecase,
  ],
  exports: [CreateNotificationUsecase],
})
export class NotificationsModule {}
