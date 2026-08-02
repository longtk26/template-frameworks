import type { MessageEvent } from '@nestjs/common';
import type { Observable } from 'rxjs';

/**
 * One-way server->client push, decoupling `runs`/`notifications` from the fact that the
 * transport is Server-Sent Events (chosen over WebSocket since updates only ever flow
 * server->client — no client->server messages are needed on this channel).
 */
export abstract class IRealtimeBroadcaster {
  abstract emitRunUpdated(runId: string, payload: unknown): void;
  abstract emitStepUpdated(runId: string, payload: unknown): void;
  abstract emitStepLog(runId: string, payload: unknown): void;
  abstract emitNotificationCreated(payload: unknown): void;

  abstract streamRunEvents(runId: string): Observable<MessageEvent>;
  abstract streamNotifications(): Observable<MessageEvent>;

  /** Frees the per-run stream once a run reaches a terminal state — call from run-orchestrator. */
  abstract completeRunStream(runId: string): void;
}
