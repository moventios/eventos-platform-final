import type { PassTierCreatedEvent } from '@movent/contracts';
import { randomUUID } from 'crypto';

export interface PassTierProps {
  id: string;
  tenantId: string;
  eventId: string;
  name: string;
  price: string;
  currency: string;
  capacity: number;
  quantityIssued?: number;
  metadata?: Record<string, unknown>;
}

export class PassTier {
  private constructor(private readonly props: PassTierProps) {}

  static create(params: {
    tenantId: string;
    eventId: string;
    name: string;
    price: string;
    currency?: string;
    capacity: number;
    metadata?: Record<string, unknown>;
    actorId: string;
  }): { passTier: PassTier; event: PassTierCreatedEvent } {
    const id = randomUUID();
    const tier = new PassTier({
      id,
      tenantId: params.tenantId,
      eventId: params.eventId,
      name: params.name,
      price: params.price,
      currency: params.currency ?? 'IDR',
      capacity: params.capacity,
      quantityIssued: 0,
      metadata: params.metadata ?? {},
    });

    const createdEvent: PassTierCreatedEvent = {
      eventId: randomUUID(),
      eventType: 'PassTierCreated',
      eventVersion: 'v1',
      aggregateId: id,
      aggregateType: 'PassTier',
      tenantId: params.tenantId,
      actorId: params.actorId,
      occurredAt: new Date().toISOString(),
      payload: { passTierId: id, eventId: params.eventId, name: params.name, capacity: params.capacity },
    };

    return { passTier: tier, event: createdEvent };
  }

  get id() { return this.props.id; }
  get capacity() { return this.props.capacity; }

  toRecord(): PassTierProps { return { ...this.props }; }

  static reconstitute(props: PassTierProps): PassTier {
    return new PassTier(props);
  }
}
