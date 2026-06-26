import type { DomainEventBase } from './_base.js';

export interface EventPublishedEvent extends DomainEventBase {
  readonly eventType: 'EventPublished';
  readonly aggregateType: 'Event';
  readonly payload: { eventId: string; name: string };
}

export interface PassTierCreatedEvent extends DomainEventBase {
  readonly eventType: 'PassTierCreated';
  readonly aggregateType: 'PassTier';
  readonly payload: { passTierId: string; eventId: string; name: string; capacity: number };
}

export interface AccessPassIssuedEvent extends DomainEventBase {
  readonly eventType: 'AccessPassIssued';
  readonly aggregateType: 'AccessPass';
  readonly payload: { accessPassId: string; passTierId: string; customerId: string };
}

export interface AccessPassScannedEvent extends DomainEventBase {
  readonly eventType: 'AccessPassScanned';
  readonly aggregateType: 'AccessPass';
  readonly payload: { accessPassId: string };
}

export interface AccessPassRevokedEvent extends DomainEventBase {
  readonly eventType: 'AccessPassRevoked';
  readonly aggregateType: 'AccessPass';
  readonly payload: { accessPassId: string; reason?: string };
}

export interface AccessPassExpiredEvent extends DomainEventBase {
  readonly eventType: 'AccessPassExpired';
  readonly aggregateType: 'AccessPass';
  readonly payload: { accessPassId: string };
}
