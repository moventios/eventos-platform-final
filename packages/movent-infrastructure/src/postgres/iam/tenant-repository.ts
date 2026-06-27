import { eq } from 'drizzle-orm';
import { tenants } from '@movent/database/schema';
import { Tenant } from '@movent/core/iam';
import type { ITenantRepository } from '@movent/core/iam';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from '@movent/database/schema';

type TenantDatabase = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;

export class DrizzleTenantRepository implements ITenantRepository {
  constructor(private readonly db: TenantDatabase) {}

  async findById(id: string): Promise<Tenant | null> {
    const row = await this.db.query.tenants.findFirst({ where: eq(tenants.id, id) });
    if (!row) return null;
    return Tenant.reconstitute({
      id: row.id,
      name: row.name,
      slug: row.slug,
      isActive: row.isActive,
      tenantId: row.id,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const row = await this.db.query.tenants.findFirst({ where: eq(tenants.slug, slug) });
    if (!row) return null;
    return Tenant.reconstitute({
      id: row.id,
      name: row.name,
      slug: row.slug,
      isActive: row.isActive,
      tenantId: row.id,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    });
  }

  async save(tenant: Tenant): Promise<void> {
    const r = tenant.toRecord();
    await this.db
      .insert(tenants)
      .values({
        id: r.id,
        name: r.name,
        slug: r.slug,
        isActive: r.isActive,
        metadata: r.metadata,
      })
      .onConflictDoUpdate({
        target: tenants.id,
        set: { isActive: r.isActive },
      });
  }
}
