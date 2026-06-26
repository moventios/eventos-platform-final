import type { CreateTicketTypeCommand } from '@eventos/contracts';
import { PassTier } from '../../domain/aggregates/pass-tier.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';
import type { IPassTierRepository } from './issue-access-pass.handler.js';

export interface CreateTicketTypeResult {
  passTierId: string;
}

export class CreateTicketTypeHandler {
  constructor(
    private readonly passTiers: IPassTierRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(
    cmd: CreateTicketTypeCommand,
    tenantId: string,
    actorId: string,
  ): Promise<CreateTicketTypeResult> {
    const { passTier, event } = PassTier.create({
      tenantId,
      eventId: cmd.eventId,
      name: cmd.name,
      price: cmd.price,
      currency: cmd.currency,
      capacity: cmd.capacity,
      ...(cmd.metadata !== undefined ? { metadata: cmd.metadata } : {}),
      actorId,
    });

    await this.passTiers.save(passTier);
    await this.eventBus.publish(event);
    return { passTierId: passTier.id };
  }
}
