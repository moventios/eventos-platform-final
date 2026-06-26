import type { DomainEventBase } from '@eventos/contracts';
import type { Tenant } from '../aggregates/tenant.js';

export interface TenantOwnerBootstrap {
  actorId: string;
  ownerEmail: string;
  ownerDisplayName?: string;
}

export interface ITenantProvisioner {
  provisionWithOwner(
    tenant: Tenant,
    owner: TenantOwnerBootstrap,
    event: DomainEventBase,
  ): Promise<void>;
}