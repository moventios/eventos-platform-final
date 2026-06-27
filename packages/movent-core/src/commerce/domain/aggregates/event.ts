import type { EventPublishedEvent } from '@movent/contracts';
import { randomUUID } from 'crypto';

/**
 * Movent Infrastructure - Activation Engine
 * 
 * Event = Catalyst (internal).
 * Creates Relationships, Participation, and Opportunities in the Network.
 * User-facing: Events (with Catalysts sparingly).
 */

export interface EventProps {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  startsAt?: Date;
  endsAt?: Date;
  timezone: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export class Event {
  private constructor(private readonly props: EventProps) {}

  static publish(params: {
    tenantId: string;
    name: string;
    description?: string;
    startsAt?: string | Date;
    endsAt?: string | Date;
    timezone?: string;
    metadata?: Record<string, unknown>;
    actorId: string;
  }): { event: Event; publishedEvent: EventPublishedEvent } {
    const id = randomUUID();
    const startsAt = params.startsAt ? new Date(params.startsAt) : undefined;
    const endsAt = params.endsAt ? new Date(params.endsAt) : undefined;

    const ev = new Event({
      id,
      tenantId: params.tenantId,
      name: params.name,
      ...(params.description !== undefined ? { description: params.description } : {}),
      ...(startsAt !== undefined ? { startsAt } : {}),
      ...(endsAt !== undefined ? { endsAt } : {}),
      timezone: params.timezone ?? 'UTC',
      status: 'draft',
      metadata: params.metadata ?? {},
    });

    const publishedEvent: EventPublishedEvent = {
      eventId: randomUUID(),
      eventType: 'EventPublished',
      eventVersion: 'v1',
      aggregateId: id,
      aggregateType: 'Event',
      tenantId: params.tenantId,
      actorId: params.actorId,
      occurredAt: new Date().toISOString(),
      payload: { eventId: id, name: params.name },
    };

    return { event: ev, publishedEvent };
  }

  get id() { return this.props.id; }
  get status() { return this.props.status; }

  toRecord(): EventProps { return { ...this.props }; }

  static reconstitute(props: EventProps): Event {
    return new Event(props);
  }
}
