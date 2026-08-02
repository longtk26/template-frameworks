import { Global, Module } from '@nestjs/common';
import { RunEventsController } from './presenter/run-events.controller';
import { IRealtimeBroadcaster } from './ports/output/realtime-broadcaster.port';
import { RxjsBroadcasterService } from './infrastructure/rxjs-broadcaster.service';

@Global()
@Module({
  controllers: [RunEventsController],
  providers: [{ provide: IRealtimeBroadcaster, useClass: RxjsBroadcasterService }],
  exports: [IRealtimeBroadcaster],
})
export class RealtimeModule {}
