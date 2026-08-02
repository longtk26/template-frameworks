import { Injectable, type MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { IRealtimeBroadcaster } from '../ports/output/realtime-broadcaster.port';

@Injectable()
export class RxjsBroadcasterService implements IRealtimeBroadcaster {
  private readonly runSubjects = new Map<string, Subject<MessageEvent>>();
  private readonly notificationSubject = new Subject<MessageEvent>();

  emitRunUpdated(runId: string, payload: unknown): void {
    this.getRunSubject(runId).next({ type: 'run.updated', data: payload as object });
  }

  emitStepUpdated(runId: string, payload: unknown): void {
    this.getRunSubject(runId).next({ type: 'step.updated', data: payload as object });
  }

  emitStepLog(runId: string, payload: unknown): void {
    this.getRunSubject(runId).next({ type: 'step.log', data: payload as object });
  }

  emitNotificationCreated(payload: unknown): void {
    this.notificationSubject.next({
      type: 'notification.created',
      data: payload as object,
    });
  }

  streamRunEvents(runId: string): Observable<MessageEvent> {
    return this.getRunSubject(runId).asObservable();
  }

  streamNotifications(): Observable<MessageEvent> {
    return this.notificationSubject.asObservable();
  }

  completeRunStream(runId: string): void {
    this.runSubjects.get(runId)?.complete();
    this.runSubjects.delete(runId);
  }

  private getRunSubject(runId: string): Subject<MessageEvent> {
    let subject = this.runSubjects.get(runId);
    if (!subject) {
      subject = new Subject<MessageEvent>();
      this.runSubjects.set(runId, subject);
    }
    return subject;
  }
}
