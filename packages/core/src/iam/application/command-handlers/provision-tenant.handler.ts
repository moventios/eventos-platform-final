import type { ProvisionTenantCommand } from '@eventos/contracts';
import { Tenant } from '../../domain/aggregates/tenant.js';
import type { ITenantRepository } from '../../domain/repositories/i-tenant-repository.js';
import type { ITenantProvisioner } from '../../domain/repositories/i-tenant-provisioner.js';
import { DomainError } from '../../../shared/errors.js';

export interface ProvisionTenantResult {
  tenantId: string;
  slug: string;
}

/**
 * L-07: All mutations via Command Handlers — never raw DB writes in API routes.
 * L-09: Tracing attributes injected via traceId parameter.
 */
export class ProvisionTenantHandler {
  constructor(
    private readonly tenants: ITenantRepository,
    private readonly provisioner: ITenantProvisioner,
  ) {}

  async handle(
    cmd: ProvisionTenantCommand,
    actorId: string,
    _traceId?: string,
  ): Promise<ProvisionTenantResult> {
    const existing = await this.tenants.findBySlug(cmd.slug);
    if (existing) {
      throw new DomainError(`Slug "${cmd.slug}" is already taken`, 'SLUG_TAKEN');
    }

    const { tenant, event } = Tenant.provision({
      name: cmd.name,
      slug: cmd.slug,
      ownerEmail: cmd.ownerEmail,
      ...(cmd.ownerDisplayName !== undefined ? { ownerDisplayName: cmd.ownerDisplayName } : {}),
      ...(cmd.metadata !== undefined ? { metadata: cmd.metadata } : {}),
      actorId,
    });

    await this.provisioner.provisionWithOwner(
      tenant,
      {
        actorId,
        ownerEmail: cmd.ownerEmail,
        ...(cmd.ownerDisplayName !== undefined ? { ownerDisplayName: cmd.ownerDisplayName } : {}),
      },
      event,
    );

    return { tenantId: tenant.id, slug: tenant.slug };
  }
}