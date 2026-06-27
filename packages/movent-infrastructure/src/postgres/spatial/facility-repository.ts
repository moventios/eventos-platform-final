import { eq, and } from 'drizzle-orm';
import { facilities } from '@movent/database/schema';
import { Facility, type FacilityProps } from '@movent/core/spatial';
import type { IFacilityRepository } from '@movent/core/spatial';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@movent/database/schema';

export class DrizzleFacilityRepository implements IFacilityRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(facility: Facility): Promise<void> {
    const r = facility.toRecord();
    await this.db.insert(facilities).values({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      description: r.description ?? null,
      address: r.address ?? null,
      geoLat: r.geoLat ?? null,
      geoLng: r.geoLng ?? null,
      status: r.status as schema.Facility['status'],
      metadata: r.metadata ?? {},
    });
  }

  async findById(id: string, tenantId: string): Promise<Facility | null> {
    const row = await this.db.query.facilities.findFirst({
      where: and(eq(facilities.id, id), eq(facilities.tenantId, tenantId)),
    });
    if (!row) return null;
    return Facility.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      status: row.status,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      ...(row.description != null ? { description: row.description } : {}),
      ...(row.address != null ? { address: row.address } : {}),
      ...(row.geoLat != null ? { geoLat: row.geoLat } : {}),
      ...(row.geoLng != null ? { geoLng: row.geoLng } : {}),
    } as FacilityProps);
  }
}
