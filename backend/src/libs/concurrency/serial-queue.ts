import { Injectable } from '@nestjs/common';

/**
 * Hand-rolled FIFO promise chain — every real agent-runner invocation across every run goes
 * through one process-wide instance of this (bound as a singleton in ConcurrencyModule), so
 * only one Claude Agent SDK call is ever in flight at a time. That's what actually protects
 * the user's shared subscription rate limit when multiple runs exist concurrently.
 */
@Injectable()
export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task, task);
    this.tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}
