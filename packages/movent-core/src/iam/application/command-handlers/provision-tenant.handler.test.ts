import { describe, expect, it, vi } from 'vitest';
import type { ProvisionTenantCommand } from '@movent/contracts';
import { Tenant } from '../../domain/aggregates/tenant.js';
import type { ITenantRepository } from '../../domain/repositories/i-tenant-repository.js';
import type { ITenantProvisioner } from '../../domain/repositories/i-tenant-provisioner.js';
import { ProvisionTenantHandler } from './provision-tenant.handler.js';

describe('ProvisionTenantHandler', () => {
  it('passes ownerDisplayName, metadata, and event atomically to provisioner', async () => {
    const cmd: ProvisionTenantCommand = {
      name: 'Acme Corp',
      slug: 'acme-corp',
      ownerEmail: 'owner@acme.test',
      ownerDisplayName: 'Jane Owner',
      metadata: { plan: 'starter' },
    };

    const tenants: ITenantRepository = {
      findBySlug: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      save: vi.fn(),
    };

    let provisionedTenant: Tenant | null = null;
    let provisionedOwner: Parameters<ITenantProvisioner['provisionWithOwner']>[1] | null = null;
    let provisionedEvent: { eventType: string } | null = null;

    const provisioner: ITenantProvisioner = {
      provisionWithOwner: vi.fn(async (tenant, owner, event) => {
        provisionedTenant = tenant;
        provisionedOwner = owner;
        provisionedEvent = event;
      }),
    };

    const handler = new ProvisionTenantHandler(tenants, provisioner);
    const result = await handler.handle(cmd, 'actor-uuid-1');

    expect(result.slug).toBe('acme-corp');
    expect(provisionedTenant).not.toBeNull();
    expect(provisionedTenant!.toRecord().metadata).toEqual({ plan: 'starter' });
    expect(provisionedOwner).toEqual({
      actorId: 'actor-uuid-1',
      ownerEmail: 'owner@acme.test',
      ownerDisplayName: 'Jane Owner',
    });
    expect(provisionedEvent?.eventType).toBe('TenantProvisioned');
    expect(provisioner.provisionWithOwner).toHaveBeenCalledOnce();
  });
});