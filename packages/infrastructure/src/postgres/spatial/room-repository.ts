import { eq, and } from 'drizzle-orm';
import { rooms } from '@eventos/database/schema';
import { Room } from '@eventos/core/spatial';
import type { IRoomRepository } from '@eventos/core/spatial';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@eventos/database/schema';

export class DrizzleRoomRepository implements IRoomRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(room: Room): Promise<void> {
    const r = room.toRecord();
    await this.db.insert(rooms).values({
      id: r.id,
      tenantId: r.tenantId,
      facilityId: r.facilityId,
      name: r.name,
      capacity: r.capacity,
      status: r.status as schema.Room['status'],
      metadata: r.metadata ?? {},
    });
  }

  async findById(id: string, tenantId: string): Promise<Room | null> {
    const row = await this.db.query.rooms.findFirst({
      where: and(eq(rooms.id, id), eq(rooms.tenantId, tenantId)),
    });
    if (!row) return null;
    return Room.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      facilityId: row.facilityId,
      name: row.name,
      capacity: row.capacity,
      status: row.status,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
    });
  }

  async findByFacility(facilityId: string, tenantId: string) {
    return this.db.select().from(rooms)
      .where(and(eq(rooms.facilityId, facilityId), eq(rooms.tenantId, tenantId)));
  }
}
