import type { IssueAccessPassCommand } from '@movent/contracts';
import { AccessPass } from '../../domain/aggregates/access-pass.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';
import { DomainError } from '../../../shared/errors.js';

export interface IAccessPassRepository {
  save(pass: AccessPass): Promise<void>;
  findById(id: string, tenantId: string): Promise<AccessPass | null>;
  countIssued(passTierId: string, tenantId: string): Promise<number>;
  findPendingPastHold(limit: number): Promise<AccessPass[]>;
}

export interface IPassTierRepository {
  save(passTier: unknown): Promise<void>;
  findById(
    id: string,
    tenantId: string,
  ): Promise<{ id: string; capacity: number; eventId: string } | null>;
  incrementIssued(id: string, tenantId: string): Promise<void>;
}

export class IssueAccessPassHandler {
  constructor(
    private readonly passes: IAccessPassRepository,
    private readonly tiers: IPassTierRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(cmd: IssueAccessPassCommand, tenantId: string, actorId: string) {
    const tier = await this.tiers.findById(cmd.passTierId, tenantId);
    if (!tier) throw new DomainError('TicketType not found', 'TICKET_TYPE_NOT_FOUND');

    const issued = await this.passes.countIssued(cmd.passTierId, tenantId);

    const { pass, event } = AccessPass.issue({
      tenantId,
      passTierId: cmd.passTierId,
      eventId: cmd.eventId,
      customerId: cmd.customerId,
      idempotencyKey: cmd.idempotencyKey,
      quantityIssued: issued,
      capacity: tier.capacity,
      actorId,
    });

    await this.passes.save(pass);
    await this.tiers.incrementIssued(cmd.passTierId, tenantId);
    await this.eventBus.publish(event);

    return { accessPassId: pass.id };
  }
}
