import { describe, it, expect, beforeEach } from 'vitest';
import { SubmitBookingHandler } from './submit-booking.handler';
import { Booking } from '../../domain/aggregates/booking';
import type { IEventBus } from '../../../shared/i-event-bus';
import { BookingConflictError } from '../../../shared/errors';

class FakeBookingRepo {
  records = new Map<string, any>();
  async save(booking: any) {
    // Simulate exclusion constraint conflict if overlapping for same room
    const rec = booking.toRecord ? booking.toRecord() : booking;
    for (const [, existing] of this.records) {
      if (existing.roomId === rec.roomId && existing.id !== rec.id) {
        // naive overlap check for test
        const overlap = !(
          new Date(rec.endsAt) <= new Date(existing.startsAt) ||
          new Date(rec.startsAt) >= new Date(existing.endsAt)
        );
        if (overlap) {
          const err: any = new Error(
            'new row for relation "bookings" violates exclusion constraint "bookings_no_overlap"',
          );
          err.code = '23P01';
          throw err;
        }
      }
    }
    this.records.set(rec.id, rec);
  }
  async findById(id: string, tenantId: string) {
    const r = this.records.get(id);
    return r && r.tenantId === tenantId ? Booking.reconstitute(r) : null;
  }
}

class FakeEventBus implements IEventBus {
  published: any[] = [];
  async publish(event: any) {
    this.published.push(event);
  }
}

describe('SubmitBookingHandler (handler-driven)', () => {
  let repo: FakeBookingRepo;
  let bus: FakeEventBus;
  let handler: SubmitBookingHandler;
  const tenantId = '00000000-0000-0000-0000-000000000010';
  const actorId = '00000000-0000-0000-0000-000000000011';
  const roomId = '00000000-0000-0000-0000-000000000012';

  beforeEach(() => {
    repo = new FakeBookingRepo();
    bus = new FakeEventBus();
    handler = new SubmitBookingHandler(repo as any, bus);
  });

  it('submits booking successfully via handler (first no conflict)', async () => {
    const result = await handler.handle(
      {
        roomId,
        startsAt: '2026-07-01T10:00:00.000Z',
        endsAt: '2026-07-01T11:00:00.000Z',
        title: 'Test Meeting',
        idempotencyKey: 'bk-1',
      },
      tenantId,
      actorId,
    );

    expect(result.bookingId).toBeTruthy();
    expect(bus.published.length).toBe(1);
    expect(bus.published[0].eventType).toBe('BookingSubmitted');
  });

  it('throws BookingConflictError (409 evidence) on overlapping booking via handler', async () => {
    // seed first booking
    await handler.handle(
      {
        roomId,
        startsAt: '2026-07-01T10:00:00.000Z',
        endsAt: '2026-07-01T12:00:00.000Z',
        idempotencyKey: 'bk-seed',
      },
      tenantId,
      actorId,
    );

    // overlapping
    await expect(
      handler.handle(
        {
          roomId,
          startsAt: '2026-07-01T11:00:00.000Z',
          endsAt: '2026-07-01T13:00:00.000Z',
          idempotencyKey: 'bk-conflict',
        },
        tenantId,
        actorId,
      ),
    ).rejects.toBeInstanceOf(BookingConflictError);
  });
});
