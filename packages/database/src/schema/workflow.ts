import { pgTable, uuid, varchar, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { auditColumns } from './_audit.js';
import { workflowStateEnum, approvalStateEnum, actorTypeEnum } from './_enums.js';
import { tenants, profiles } from './iam.js';

/**
 * Workflow & Approval Bounded Context — Layer 2 Database SSOT v5.0.2
 * L-06: AI WRITE→PENDING enforced via approvals table + enforce_ai_write_interception() stored proc
 */

export const workflowInstances = pgTable(
  'workflow_instances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    workflowType: varchar('workflow_type', { length: 100 }).notNull(),
    status: workflowStateEnum('status').default('running').notNull(),
    correlationId: uuid('correlation_id'), // links to aggregate being acted on
    correlationEntity: varchar('correlation_entity', { length: 100 }),
    context: jsonb('context').default({}).notNull(),
    ...auditColumns,
  },
  (t) => [index('workflow_instances_tenant_idx').on(t.tenantId)],
);

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    workflowInstanceId: uuid('workflow_instance_id').references(() => workflowInstances.id),
    // human approver — assigned_to = tenant admin (L-06)
    assignedTo: uuid('assigned_to')
      .notNull()
      .references(() => profiles.id),
    // {command_type, actor_id, aggregate_id, aggregate_type}
    requestContext: jsonb('request_context').notNull(),
    status: approvalStateEnum('status').default('pending').notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolvedBy: uuid('resolved_by'),
    resolution: varchar('resolution', { length: 50 }), // 'approved' | 'rejected'
    resolutionNote: text('resolution_note'),
    actorType: actorTypeEnum('actor_type').default('AI_AGENT').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    ...auditColumns,
  },
  (t) => [
    index('approvals_tenant_idx').on(t.tenantId),
    index('approvals_status_idx').on(t.status),
    index('approvals_assigned_to_idx').on(t.assignedTo),
  ],
);

export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type NewWorkflowInstance = typeof workflowInstances.$inferInsert;
export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;
