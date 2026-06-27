import { pgEnum } from 'drizzle-orm/pg-core';

// Constitution Part 12.1
export const bookingStateEnum = pgEnum('booking_state', [
  'pending',
  'under_review',
  'approved',
  'active',
  'completed',
  'rejected',
  'canceled',
]);

// Constitution Part 12.3
export const accessPassStateEnum = pgEnum('access_pass_state', [
  'pending',
  'issued',
  'checked_in',
  'consumed',
  'revoked',
  'expired',
]);

// Constitution Part 12.5
export const workflowStateEnum = pgEnum('workflow_state', [
  'running',
  'pending_approval',
  'completed',
  'suspended',
  'aborted',
]);

export const approvalStateEnum = pgEnum('approval_state', [
  'pending',
  'approved',
  'rejected',
  'expired',
]);

export const eventStateEnum = pgEnum('event_state', [
  'draft',
  'published',
  'live',
  'concluded',
  'canceled',
]);

export const facilityStateEnum = pgEnum('facility_state', [
  'draft',
  'active',
  'maintenance',
  'decommissioned',
]);

export const roomStateEnum = pgEnum('room_state', ['available', 'occupied', 'maintenance']);

// Constitution Part 15.5
export const actorTypeEnum = pgEnum('actor_type', ['USER', 'AI_AGENT', 'SYSTEM']);

// Constitution Part 12.6
export const journalStateEnum = pgEnum('journal_state', ['draft', 'posted', 'voided']);

export const membershipRoleEnum = pgEnum('membership_role', [
  'owner',
  'admin',
  'manager',
  'member',
  'viewer',
]);
