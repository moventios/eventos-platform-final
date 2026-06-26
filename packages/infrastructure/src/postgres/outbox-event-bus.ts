import type { IEventBus } from '@eventos/core';
import type { DomainEventBase } from '@eventos/contracts';
import { domainEvents } from '@eventos/database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@eventos/database/schema';

/**
 * Outbox EventBus — writes domain events to domain_events table.
 * pg-boss picks them up and dispatches to handlers asynchronously.
 * This ensures L-01: cross-BC communication via events only, never direct calls.
 */
export class OutboxEventBus implements IEventBus {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async publish(event: DomainEventBase): Promise<void> {
    await this.db.insert(domainEvents).values({
      tenantId: event.tenantId,
      eventType: event.eventType,
      eventVersion: event.eventVersion,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      payload: (event.payload ?? {}) as Record<string, unknown>,
      traceId: event.traceId,
      actorId: event.actorId,
      status: 'pending',
    });
  }
}
