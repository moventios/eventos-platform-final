import { uuid, timestamp } from 'drizzle-orm/pg-core';

/**
 * Standard audit columns required on every business entity (L-03, L-05).
 * Every table MUST include these via spread: ...auditColumns
 */
export const auditColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  updatedBy: uuid('updated_by'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // soft delete L-03
  deletedBy: uuid('deleted_by'),
};
