import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  jsonb,
  index,
  unique,
  customType,
  timestamp,
} from 'drizzle-orm/pg-core';
import { auditColumns } from './_audit.js';
import { facilityStateEnum, roomStateEnum, bookingStateEnum, actorTypeEnum } from './_enums.js';
import { tenants } from './iam.js';

/**
 * Spatial & Facility Bounded Context — Layer 2 Database SSOT v5.0.2
 * GiST EXCLUSION constraint enforces zero-conflict booking invariant at DB level.
 * Application does NOT need conflict detection logic — just handle the exception.
 */

// Custom tsrange type for PostgreSQL temporal ranges (GiST)
const tstzrange = customType<{ data: string }>({
  dataType() {
    return 'tstzrange';
  },
});

export const facilities = pgTable(
  'facilities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    address: text('address'),
    geoLat: numeric('geo_lat', { precision: 10, scale: 7 }),
    geoLng: numeric('geo_lng', { precision: 10, scale: 7 }),
    status: facilityStateEnum('status').default('draft').notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    ...auditColumns,
  },
  (t) => [index('facilities_tenant_idx').on(t.tenantId)],
);

export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    facilityId: uuid('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    capacity: integer('capacity').notNull(),
    status: roomStateEnum('status').default('available').notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    ...auditColumns,
  },
  (t) => [index('rooms_facility_idx').on(t.facilityId)],
);

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'restrict' }),
    requestedBy: uuid('requested_by').notNull(),
    status: bookingStateEnum('status').default('pending').notNull(),
    // tstzrange stored as string 'yyyy-mm-dd HH:MM:SS+TZ,yyyy-mm-dd HH:MM:SS+TZ'
    // GiST EXCLUSION constraint added via raw SQL migration (see rls/spatial.sql)
    timeRange: tstzrange('time_range').notNull(),
    // L-04: idempotency key — UNIQUE(tenant_id, idempotency_key) enforced via SQL migration
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }),
    notes: text('notes'),
    actorType: actorTypeEnum('actor_type').default('USER').notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    ...auditColumns,
  },
  (t) => [
    index('bookings_room_idx').on(t.roomId),
    index('bookings_tenant_idx').on(t.tenantId),
    unique('bookings_idempotency_key').on(t.tenantId, t.idempotencyKey),
  ],
);

export const bookingHistories = pgTable('booking_histories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'restrict' }),
  bookingId: uuid('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'restrict' }),
  fromStatus: bookingStateEnum('from_status'),
  toStatus: bookingStateEnum('to_status').notNull(),
  changedBy: uuid('changed_by').notNull(),
  actorType: actorTypeEnum('actor_type').default('USER').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Facility = typeof facilities.$inferSelect;
export type NewFacility = typeof facilities.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
