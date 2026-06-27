import type { DomainEventBase } from './_base.js';

export interface TenantProvisionedEvent extends DomainEventBase {
  readonly eventType: 'TenantProvisioned';
  readonly aggregateType: 'Tenant';
  readonly payload: {
    tenantId: string;
    name: string;
    slug: string;
    ownerEmail: string;
    ownerDisplayName?: string;
  };
}

export interface MembershipGrantedEvent extends DomainEventBase {
  readonly eventType: 'MembershipGranted';
  readonly aggregateType: 'Membership';
  readonly payload: {
    membershipId: string;
    profileId: string;
    tenantId: string;
    role: string;
  };
}

export interface TenantFrozenEvent extends DomainEventBase {
  readonly eventType: 'TenantFrozen';
  readonly aggregateType: 'Tenant';
  readonly payload: {
    tenantId: string;
    reason: string;
  };
}
