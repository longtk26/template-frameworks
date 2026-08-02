import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '../../../libs/decorators/transactional.decorator';
import { INotificationRepository } from '../ports/output/notification-repository.port';
import { IRealtimeBroadcaster } from '../../realtime/ports/output/realtime-broadcaster.port';
import { NotificationEntity } from '../../shared/domain/entities/notification.entity';
import { NotificationType } from '../../shared/domain/types';

/** Internal usecase — called by run-orchestrator at the two review checkpoints (and on
 * run completion/failure), never directly from an HTTP handler. */
@Injectable()
export class CreateNotificationUsecase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepo: INotificationRepository,
    @Inject(IRealtimeBroadcaster)
    private readonly broadcaster: IRealtimeBroadcaster,
  ) {}

  @Transactional()
  async execute(params: {
    runId?: string | null;
    stepId?: string | null;
    type: NotificationType;
    title: string;
    body: string;
  }): Promise<NotificationEntity> {
    const notification = await this.notificationRepo.create(
      new NotificationEntity(params),
    );
    this.broadcaster.emitNotificationCreated(notification);
    return notification;
  }
}
