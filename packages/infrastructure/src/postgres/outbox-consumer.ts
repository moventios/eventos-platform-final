import type { DomainEventBase } from '@eventos/contracts';
import { domainEvents } from '@eventos/database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '@eventos/database/schema';

type OutboxDb = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;

/**
 * DrizzleOutboxConsumer — consumes pending domain events from the outbox (domain_events table).
 * This provides the consumer side of the outbox pattern (complements OutboxEventBus producer).
 * Used by workers like domain-event-dispatcher for AC4 / L-01 compliance.
 */
export class DrizzleOutboxConsumer {
  constructor(private readonly db: OutboxDb) {}

  async fetchPending(limit: number): Promise<DomainEventBase[]> {
    const rows = await this.db
      .select()
      .from(domainEvents)
      .where(eq(domainEvents.status, 'pending'))
      .orderBy(domainEvents.createdAt)
      .limit(limit);

    return rows.map((row) => {
      const base: DomainEventBase = {
        eventId: row.id,
        eventType: row.eventType,
        eventVersion: row.eventVersion,
        aggregateId: row.aggregateId,
        aggregateType: row.aggregateType,
        tenantId: row.tenantId,
        actorId: row.actorId || 'SYSTEM',
        occurredAt: row.createdAt.toISOString(),
        payload: (row.payload ?? {}) as Record<string, unknown>,
        ...(row.traceId ? { traceId: row.traceId } : {}),
      };
      return base;
    });
  }

  async markProcessed(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(domainEvents)
      .set({ status: 'processed', processedAt: new Date() })
      .where(inArray(domainEvents.id, ids));
  }
}
