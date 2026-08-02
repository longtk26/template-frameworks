import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListNotificationsUsecase } from '../usecases/list-notifications.usecase';
import { MarkNotificationReadUsecase } from '../usecases/mark-notification-read.usecase';
import { MarkAllNotificationsReadUsecase } from '../usecases/mark-all-notifications-read.usecase';
import { NotificationEntity } from '../../shared/domain/entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly listNotificationsUsecase: ListNotificationsUsecase,
    private readonly markNotificationReadUsecase: MarkNotificationReadUsecase,
    private readonly markAllNotificationsReadUsecase: MarkAllNotificationsReadUsecase,
  ) {}

  @Get()
  list(): Promise<{ notifications: NotificationEntity[]; unreadCount: number }> {
    return this.listNotificationsUsecase.execute();
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string): Promise<NotificationEntity> {
    return this.markNotificationReadUsecase.execute(id);
  }

  @Patch('read-all')
  markAllRead(): Promise<void> {
    return this.markAllNotificationsReadUsecase.execute();
  }
}
