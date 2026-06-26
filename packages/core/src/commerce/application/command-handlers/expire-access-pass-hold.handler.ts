import type { AccessPassExpiredEvent } from '@eventos/contracts';
import { AccessPass } from '../../domain/aggregates/access-pass.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';
import type { IAccessPassRepository } from './issue-access-pass.handler.js';

export interface ExpireAccessPassHoldResult {
  expired: number;
}

export class ExpireAccessPassHoldHandler {
  constructor(
    private readonly passes: IAccessPassRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(limit = 100): Promise<ExpireAccessPassHoldResult> {
    const candidates = await this.passes.findPendingPastHold(limit);
    let expired = 0;

    for (const candidate of candidates) {
      // findPendingPastHold now returns proper AccessPass instances (extended with timestamps)
      const pass = candidate;  // already AccessPass (or reconstituted by repo)

      const event = pass.expire('SYSTEM');

      await this.passes.save(pass);

      await this.eventBus.publish(event);
      expired++;
    }

    return { expired };
  }
}
