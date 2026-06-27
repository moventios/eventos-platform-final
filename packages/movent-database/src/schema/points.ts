import { pgTable, uuid, integer, text, jsonb, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { auditColumns } from './_audit.js';
import { tenants, profiles } from './iam.js';

export const pointsTransactionTypeEnum = pgEnum('points_transaction_type', [
  'grant',
  'spend',
  'adjust',
  'refund',
]);

export const pointsAccounts = pgTable('points_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'restrict' }),
  profileId: uuid('profile_id')
    .notNull()
    .unique()
    .references(() => profiles.id, { onDelete: 'restrict' }),
  balance: integer('balance').default(0).notNull(),
  ...auditColumns,
});

export const pointsTransactions = pgTable('points_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'restrict' }),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'restrict' }),
  amount: integer('amount').notNull(),
  type: pointsTransactionTypeEnum('type').notNull(),
  description: text('description'),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type PointsAccount = typeof pointsAccounts.$inferSelect;
export type NewPointsAccount = typeof pointsAccounts.$inferInsert;
export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type NewPointsTransaction = typeof pointsTransactions.$inferInsert;
