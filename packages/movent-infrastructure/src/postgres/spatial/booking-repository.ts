import { eq, and } from 'drizzle-orm';
import { bookings } from '@movent/database/schema';
import { Booking } from '@movent/core/spatial';
import type { IBookingRepository } from '@movent/core/spatial';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@movent/database/schema';

export class DrizzleBookingRepository implements IBookingRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(booking: Booking): Promise<void> {
    const props = booking.toRecord();
    await this.db.insert(bookings).values({
      id: booking.id,
      tenantId: props.tenantId,
      roomId: props.roomId,
      requestedBy: props.requestedBy,
      status: props.status as schema.Booking['status'],
      timeRange: `[${props.startsAt.toISOString()},${props.endsAt.toISOString()})`,
      idempotencyKey: props.idempotencyKey,
      title: props.title,
      notes: props.notes,
    });
  }

  async findById(id: string, tenantId: string): Promise<Booking | null> {
    const row = await this.db.query.bookings.findFirst({
      where: and(eq(bookings.id, id), eq(bookings.tenantId, tenantId)),
    });
    if (!row) return null;
    const [start, end] = row.timeRange.replace(/[\[\]()]/g, '').split(',') as [string, string];
    return Booking.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      roomId: row.roomId,
      requestedBy: row.requestedBy,
      status: row.status as schema.Booking['status'],
      startsAt: new Date(start),
      endsAt: new Date(end),
      idempotencyKey: row.idempotencyKey,
      ...(row.title != null ? { title: row.title } : {}),
      ...(row.notes != null ? { notes: row.notes } : {}),
    });
  }

  async findByTenant(tenantId: string, roomId?: string) {
    if (roomId) {
      return this.db
        .select()
        .from(bookings)
        .where(and(eq(bookings.tenantId, tenantId), eq(bookings.roomId, roomId)));
    }
    return this.db.select().from(bookings).where(eq(bookings.tenantId, tenantId));
  }
}
