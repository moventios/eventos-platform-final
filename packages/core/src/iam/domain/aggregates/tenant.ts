import type { TenantProvisionedEvent, TenantFrozenEvent } from '@eventos/contracts';
import { InvalidStateTransitionError } from '../../../shared/errors.js';
import { randomUUID } from 'crypto';

export interface TenantProps {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  tenantId: string; // self-referencing for L-05 audit columns
  metadata: Record<string, unknown>;
}

export class Tenant {
  private constructor(private readonly props: TenantProps) {}

  static provision(params: {
    name: string;
    slug: string;
    ownerEmail: string;
    ownerDisplayName?: string;
    metadata?: Record<string, unknown>;
    actorId: string;
  }): { tenant: Tenant; event: TenantProvisionedEvent } {
    const id = randomUUID();
    const tenant = new Tenant({
      id,
      name: params.name,
      slug: params.slug,
      isActive: true,
      tenantId: id,
      metadata: params.metadata ?? {},
    });

    const event: TenantProvisionedEvent = {
      eventId: randomUUID(),
      eventType: 'TenantProvisioned',
      eventVersion: 'v1',
      aggregateId: id,
      aggregateType: 'Tenant',
      tenantId: id,
      actorId: params.actorId,
      occurredAt: new Date().toISOString(),
      payload: {
        tenantId: id,
        name: params.name,
        slug: params.slug,
        ownerEmail: params.ownerEmail,
        ...(params.ownerDisplayName !== undefined ? { ownerDisplayName: params.ownerDisplayName } : {}),
      },
    };

    return { tenant, event };
  }

  freeze(actorId: string): TenantFrozenEvent {
    if (!this.props.isActive) {
      throw new InvalidStateTransitionError('Tenant', 'frozen', 'frozen');
    }
    this.props.isActive = false;

    return {
      eventId: randomUUID(),
      eventType: 'TenantFrozen',
      eventVersion: 'v1',
      aggregateId: this.props.id,
      aggregateType: 'Tenant',
      tenantId: this.props.id,
      actorId,
      occurredAt: new Date().toISOString(),
      payload: { tenantId: this.props.id, reason: 'Frozen by admin' },
    };
  }

  get id() { return this.props.id; }
  get slug() { return this.props.slug; }
  get isActive() { return this.props.isActive; }

  toRecord(): TenantProps {
    return { ...this.props };
  }

  static reconstitute(props: TenantProps): Tenant {
    return new Tenant(props);
  }
}
