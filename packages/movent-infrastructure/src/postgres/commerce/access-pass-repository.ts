import { eq, and, count, sql } from 'drizzle-orm';
import { accessPasses, passTiers, events } from '@movent/database/schema';
import { AccessPass } from '@movent/core/commerce';
import type { IAccessPassRepository, IPassTierRepository, IEventRepository } from '@movent/core/commerce';
import { Event, type EventProps } from '@movent/core/commerce';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@movent/database/schema';

export class DrizzleAccessPassRepository implements IAccessPassRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(pass: AccessPass): Promise<void> {
    const r = pass.toRecord();
    await this.db.insert(accessPasses).values({
      id: r.id,
      tenantId: r.tenantId,
      passTierId: r.passTierId,
      eventId: r.eventId,
      customerId: r.customerId,
      status: r.status as schema.AccessPass['status'],
      idempotencyKey: r.idempotencyKey,
      holdsUntil: r.holdsUntil ?? null,
      checkedInAt: r.checkedInAt ?? null,
      issuedAt: r.issuedAt ?? null,
    }).onConflictDoUpdate({
      target: accessPasses.id,
      set: {
        status: r.status as schema.AccessPass['status'],
        holdsUntil: r.holdsUntil ?? null,
        checkedInAt: r.checkedInAt ?? null,
        issuedAt: r.issuedAt ?? null,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<AccessPass | null> {
    const row = await this.db.query.accessPasses.findFirst({
      where: and(eq(accessPasses.id, id), eq(accessPasses.tenantId, tenantId)),
    });
    if (!row) return null;
    return AccessPass.reconstitute({
      id: row.id, tenantId: row.tenantId, passTierId: row.passTierId,
      eventId: row.eventId, customerId: row.customerId,
      status: row.status, idempotencyKey: row.idempotencyKey,
      ...(row.holdsUntil != null ? { holdsUntil: row.holdsUntil } : {}),
      ...(row.issuedAt != null ? { issuedAt: row.issuedAt } : {}),
      ...(row.checkedInAt != null ? { checkedInAt: row.checkedInAt } : {}),
    });
  }

  async countIssued(passTierId: string, tenantId: string): Promise<number> {
    const [row] = await this.db.select({ count: count() }).from(accessPasses)
      .where(and(eq(accessPasses.passTierId, passTierId), eq(accessPasses.tenantId, tenantId)));
    return row?.count ?? 0;
  }

  async findPendingPastHold(limit: number): Promise<AccessPass[]> {
    const now = new Date();
    const rows = await this.db.query.accessPasses.findMany({
      where: and(
        eq(accessPasses.status, 'pending'),
        // holdsUntil < now ; use sql for lt if needed
        sql`${accessPasses.holdsUntil} < ${now}`
      ),
      limit,
    });
    return rows.map(row => AccessPass.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      passTierId: row.passTierId,
      eventId: row.eventId,
      customerId: row.customerId,
      status: row.status,
      idempotencyKey: row.idempotencyKey,
      ...(row.holdsUntil != null ? { holdsUntil: row.holdsUntil } : {}),
      ...(row.issuedAt != null ? { issuedAt: row.issuedAt } : {}),
      ...(row.checkedInAt != null ? { checkedInAt: row.checkedInAt } : {}),
    }));
  }
}

export class DrizzlePassTierRepository implements IPassTierRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async findById(id: string, tenantId: string) {
    const row = await this.db.query.passTiers.findFirst({
      where: and(eq(passTiers.id, id), eq(passTiers.tenantId, tenantId)),
    });
    if (!row) return null;
    return { id: row.id, capacity: row.capacity, eventId: row.eventId };
  }

  async incrementIssued(id: string, tenantId: string): Promise<void> {
    await this.db.update(passTiers)
      .set({ quantityIssued: sql`quantity_issued + 1` })
      .where(and(eq(passTiers.id, id), eq(passTiers.tenantId, tenantId)));
  }

  async save(passTier: unknown): Promise<void> {
    const pt = passTier as { toRecord?: () => Record<string, unknown> } & Record<string, unknown>;
    const r = pt.toRecord ? pt.toRecord() : pt;
    await this.db.insert(passTiers).values({
      id: r['id'] as string,
      tenantId: r['tenantId'] as string,
      eventId: r['eventId'] as string,
      name: r['name'] as string,
      price: r['price'] as string,
      currency: r['currency'] as string,
      capacity: r['capacity'] as number,
      quantityIssued: (r['quantityIssued'] as number) ?? 0,
      metadata: (r['metadata'] as Record<string, unknown>) ?? {},
    }).onConflictDoUpdate({
      target: passTiers.id,
      set: {
        name: r['name'] as string,
        price: r['price'] as string,
        capacity: r['capacity'] as number,
        quantityIssued: (r['quantityIssued'] as number) ?? 0,
        metadata: (r['metadata'] as Record<string, unknown>) ?? {},
      },
    });
  }
}

export class DrizzleEventRepository implements IEventRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(event: Event): Promise<void> {
    const r = event.toRecord();
    await this.db.insert(events).values({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      description: r.description ?? null,
      startsAt: r.startsAt ?? null,
      endsAt: r.endsAt ?? null,
      timezone: r.timezone,
      status: r.status as schema.Event['status'],
      metadata: r.metadata ?? {},
    });
  }

  async findById(id: string, tenantId: string): Promise<Event | null> {
    const row = await this.db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
    });
    if (!row) return null;
    return Event.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      timezone: row.timezone,
      status: row.status,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      ...(row.description != null ? { description: row.description } : {}),
      ...(row.startsAt != null ? { startsAt: row.startsAt } : {}),
      ...(row.endsAt != null ? { endsAt: row.endsAt } : {}),
    } as EventProps);
  }
}
