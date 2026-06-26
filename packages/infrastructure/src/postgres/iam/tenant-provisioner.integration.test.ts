import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { memberships, profiles, tenants, domainEvents } from '@eventos/database/schema';
import { Tenant } from '@eventos/core/iam';
import { DrizzleTenantProvisioner } from './tenant-provisioner.js';
import { createIamTestDb } from '../test/create-test-db.js';

describe('DrizzleTenantProvisioner (integration)', () => {
  it('inserts tenant, profile, membership, and domain event in one transaction', async () => {
    const { db } = await createIamTestDb();
    const provisioner = new DrizzleTenantProvisioner(db);

    const actorId = '11111111-1111-1111-1111-111111111111';
    const { tenant, event } = Tenant.provision({
      name: 'Integration Org',
      slug: 'integration-org',
      ownerEmail: 'owner@integration.test',
      ownerDisplayName: 'Integration Owner',
      metadata: { source: 'vitest' },
      actorId,
    });

    await provisioner.provisionWithOwner(
      tenant,
      { actorId, ownerEmail: 'owner@integration.test', ownerDisplayName: 'Integration Owner' },
      event,
    );

    const tenantRow = await db.query.tenants.findFirst({ where: eq(tenants.id, tenant.id) });
    const profileRow = await db.query.profiles.findFirst({ where: eq(profiles.id, actorId) });
    const membershipRows = await db.select().from(memberships).where(eq(memberships.tenantId, tenant.id));
    const eventRows = await db.select().from(domainEvents).where(eq(domainEvents.tenantId, tenant.id));

    expect(tenantRow?.slug).toBe('integration-org');
    expect(tenantRow?.metadata).toEqual({ source: 'vitest' });
    expect(profileRow?.email).toBe('owner@integration.test');
    expect(profileRow?.displayName).toBe('Integration Owner');
    expect(membershipRows).toHaveLength(1);
    expect(membershipRows[0]?.role).toBe('owner');
    expect(eventRows).toHaveLength(1);
    expect(eventRows[0]?.eventType).toBe('TenantProvisioned');
  });

  it('rolls back all writes when domain event insert fails', async () => {
    const { db } = await createIamTestDb();
    const provisioner = new DrizzleTenantProvisioner(db);

    const actorId = '22222222-2222-2222-2222-222222222222';
    const { tenant, event } = Tenant.provision({
      name: 'Rollback Org',
      slug: 'rollback-org',
      ownerEmail: 'rollback@test',
      actorId,
    });

    const brokenEvent = { ...event, tenantId: '00000000-0000-0000-0000-000000000099' };

    await expect(
      provisioner.provisionWithOwner(tenant, { actorId, ownerEmail: 'rollback@test' }, brokenEvent),
    ).rejects.toThrow();

    const tenantRow = await db.query.tenants.findFirst({ where: eq(tenants.slug, 'rollback-org') });
    expect(tenantRow).toBeUndefined();
  });
});