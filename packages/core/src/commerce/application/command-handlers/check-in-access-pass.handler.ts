import type { CheckInAccessPassCommand } from '@eventos/contracts';
import { AccessPass } from '../../domain/aggregates/access-pass.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';
import type { IAccessPassRepository } from './issue-access-pass.handler.js';

export interface CheckInResult {
  accessPassId: string;
}

export class CheckInAccessPassHandler {
  constructor(
    private readonly passes: IAccessPassRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(
    cmd: CheckInAccessPassCommand,
    tenantId: string,
    actorId: string,
  ): Promise<CheckInResult> {
    const pass = await this.passes.findById(cmd.accessPassId, tenantId);
    if (!pass) {
      throw new Error('AccessPass not found');
    }

    // findById already returns reconstituted AccessPass instance with methods
    const event = pass.checkIn(actorId);

    // Persist the transitioned aggregate (status updated inside checkIn)
    await this.passes.save(pass);
    await this.eventBus.publish(event);

    return { accessPassId: cmd.accessPassId };
  }
}
