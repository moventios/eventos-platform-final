import { pgTable, uuid, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './iam.js';

/**
 * Domain Events Outbox — Layer 2 Database SSOT v5.0.2
 * Cross-BC communication ONLY via this table (L-01).
 * pg-boss picks up pending events and dispatches to handlers.
 * Never call cross-context services directly.
 */

export const domainEvents = pgTable(
  'domain_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    // Canonical event type: past tense (AccessPassIssued, TenantProvisioned, etc.)
    eventType: varchar('event_type', { length: 100 }).notNull(),
    eventVersion: varchar('event_version', { length: 10 }).default('v1').notNull(),
    aggregateId: uuid('aggregate_id').notNull(),
    aggregateType: varchar('aggregate_type', { length: 100 }).notNull(),
    // Full typed event payload
    payload: jsonb('payload').notNull(),
    // Outbox pattern: pending → processed
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    // OpenTelemetry trace propagation (L-09)
    traceId: varchar('trace_id', { length: 64 }),
    actorId: uuid('actor_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('domain_events_status_idx').on(t.status),
    index('domain_events_tenant_idx').on(t.tenantId),
    index('domain_events_aggregate_idx').on(t.aggregateId),
  ],
);

export type DomainEvent = typeof domainEvents.$inferSelect;
export type NewDomainEvent = typeof domainEvents.$inferInsert;
