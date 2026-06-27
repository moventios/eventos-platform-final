import { randomUUID } from 'crypto';
import { domainEvents, memberships, profiles, tenants } from '@movent/database/schema';
import type { DomainEventBase } from '@movent/contracts';
import type { Tenant } from '@movent/core/iam';
import type { ITenantProvisioner, TenantOwnerBootstrap } from '@movent/core/iam';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from '@movent/database/schema';

type ProvisionDatabase = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;

export class DrizzleTenantProvisioner implements ITenantProvisioner {
  constructor(private readonly db: ProvisionDatabase) {}

  async provisionWithOwner(
    tenant: Tenant,
    owner: TenantOwnerBootstrap,
    event: DomainEventBase,
  ): Promise<void> {
    const record = tenant.toRecord();

    await this.db.transaction(async (tx) => {
      await tx.insert(tenants).values({
        id: record.id,
        name: record.name,
        slug: record.slug,
        isActive: record.isActive,
        metadata: record.metadata,
      });

      await tx.insert(profiles).values({
        id: owner.actorId,
        tenantId: record.id,
        email: owner.ownerEmail,
        ...(owner.ownerDisplayName !== undefined ? { displayName: owner.ownerDisplayName } : {}),
      });

      await tx.insert(memberships).values({
        id: randomUUID(),
        tenantId: record.id,
        profileId: owner.actorId,
        role: 'owner',
        isActive: true,
      });

      await tx.insert(domainEvents).values({
        id: randomUUID(),
        tenantId: event.tenantId,
        eventType: event.eventType,
        eventVersion: event.eventVersion,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        payload: (event.payload ?? {}) as Record<string, unknown>,
        traceId: event.traceId,
        actorId: event.actorId,
        status: 'pending',
      });
    });
  }
}
