import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { auditColumns } from './_audit.js';
import { eventStateEnum, accessPassStateEnum, actorTypeEnum } from './_enums.js';
import { tenants } from './iam.js';

/**
 * Commerce & Event Bounded Context — Layer 2 Database SSOT v5.0.2
 * Aggregate Root: Event
 * Entities: TicketType (pass_tiers), AccessPass
 */

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: eventStateEnum('status').default('draft').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    timezone: varchar('timezone', { length: 100 }).default('UTC').notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    ...auditColumns,
  },
  (t) => [index('events_tenant_idx').on(t.tenantId)],
);

// TicketType in domain language; pass_tiers in DB (Layer 2 canonical mapping)
export const passTiers = pgTable(
  'pass_tiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    // Money: NUMERIC(19,4) — never float (architecture rule)
    price: numeric('price', { precision: 19, scale: 4 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('IDR').notNull(),
    capacity: integer('capacity').notNull(),
    quantityIssued: integer('quantity_issued').default(0).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    ...auditColumns,
  },
  (t) => [index('pass_tiers_event_idx').on(t.eventId)],
);

export const accessPasses = pgTable(
  'access_passes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    passTierId: uuid('pass_tier_id')
      .notNull()
      .references(() => passTiers.id, { onDelete: 'restrict' }),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'restrict' }),
    customerId: uuid('customer_id').notNull(),
    status: accessPassStateEnum('status').default('pending').notNull(),
    secureQrHash: varchar('secure_qr_hash', { length: 512 }),
    // L-04: idempotency key
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull(),
    // Hold timer: pending passes expire after 15 min if no PaymentCaptured
    holdsUntil: timestamp('holds_until', { withTimezone: true }),
    actorType: actorTypeEnum('actor_type').default('USER').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}).notNull(),
    ...auditColumns,
  },
  (t) => [
    index('access_passes_event_idx').on(t.eventId),
    index('access_passes_customer_idx').on(t.customerId),
    unique('access_passes_idempotency_key').on(t.tenantId, t.idempotencyKey),
  ],
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type PassTier = typeof passTiers.$inferSelect;
export type NewPassTier = typeof passTiers.$inferInsert;
export type AccessPass = typeof accessPasses.$inferSelect;
export type NewAccessPass = typeof accessPasses.$inferInsert;
