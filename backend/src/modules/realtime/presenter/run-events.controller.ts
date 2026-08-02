import { Controller, Inject, Param, Sse, type MessageEvent } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Observable } from 'rxjs';
import { IRealtimeBroadcaster } from '../ports/output/realtime-broadcaster.port';

@ApiTags('realtime')
@Controller()
export class RunEventsController {
  constructor(
    @Inject(IRealtimeBroadcaster) private readonly broadcaster: IRealtimeBroadcaster,
  ) {}

  @Sse('runs/:id/events')
  streamRunEvents(@Param('id') id: string): Observable<MessageEvent> {
    return this.broadcaster.streamRunEvents(id);
  }

  @Sse('notifications/stream')
  streamNotifications(): Observable<MessageEvent> {
    return this.broadcaster.streamNotifications();
  }
}
