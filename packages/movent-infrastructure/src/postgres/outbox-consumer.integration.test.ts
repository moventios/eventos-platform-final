import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '@movent/database/schema';
import type { DomainEventBase } from '@movent/contracts';
import { DrizzleOutboxConsumer } from './outbox-consumer.js';

describe('DrizzleOutboxConsumer (real impl)', () => {
  let client: PGlite;
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let consumer: DrizzleOutboxConsumer;

  beforeEach(async () => {
    client = new PGlite();
    // Minimal schema for domain_events (from outbox.ts)
    await client.exec(`
      CREATE TABLE IF NOT EXISTS domain_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        event_type varchar(100) NOT NULL,
        event_version varchar(10) DEFAULT 'v1' NOT NULL,
        aggregate_id uuid NOT NULL,
        aggregate_type varchar(100) NOT NULL,
        payload jsonb NOT NULL,
        status varchar(20) DEFAULT 'pending' NOT NULL,
        processed_at timestamptz,
        trace_id varchar(64),
        actor_id uuid,
        created_at timestamptz DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS domain_events_status_idx ON domain_events(status);
    `);
    db = drizzle(client, { schema });
    consumer = new DrizzleOutboxConsumer(db);
  });

  afterEach(async () => {
    await client.close();
  });

  it('fetchPending returns pending events and markProcessed removes them', async () => {
    const event: DomainEventBase = {
      eventId: '00000000-0000-0000-0000-000000000001',
      eventType: 'TestEvent',
      eventVersion: 'v1',
      aggregateId: '00000000-0000-0000-0000-0000000000a1',
      aggregateType: 'Test',
      tenantId: '00000000-0000-0000-0000-0000000000b1',
      actorId: '00000000-0000-0000-0000-0000000000c1',
      occurredAt: new Date().toISOString(),
      payload: { foo: 'bar' },
    };

    // Insert directly via db (simulates outbox write)
    await db.insert(schema.domainEvents).values({
      id: event.eventId,
      tenantId: event.tenantId,
      eventType: event.eventType,
      eventVersion: event.eventVersion,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      payload: event.payload,
      status: 'pending',
      actorId: event.actorId,
      traceId: event.traceId,
      createdAt: new Date(),
    });

    const pending = await consumer.fetchPending(10);
    expect(pending.length).toBe(1);
    expect(pending[0].eventId).toBe('00000000-0000-0000-0000-000000000001');
    expect(pending[0].eventType).toBe('TestEvent');

    await consumer.markProcessed(['00000000-0000-0000-0000-000000000001']);
    const after = await consumer.fetchPending(10);
    expect(after.length).toBe(0);
  });

  it('markProcessed on empty does nothing', async () => {
    await consumer.markProcessed([]);
    const pending = await consumer.fetchPending(10);
    expect(pending.length).toBe(0);
  });
});

