import type { SubmitBookingCommand } from '@eventos/contracts';
import { Booking } from '../../domain/aggregates/booking.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';
import { BookingConflictError } from '../../../shared/errors.js';

export interface IBookingRepository {
  save(booking: Booking): Promise<void>;
  findById(id: string, tenantId: string): Promise<Booking | null>;
}

export interface SubmitBookingResult {
  bookingId: string;
}

export class SubmitBookingHandler {
  constructor(
    private readonly bookings: IBookingRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(
    cmd: SubmitBookingCommand,
    tenantId: string,
    actorId: string,
  ): Promise<SubmitBookingResult> {
    const startsAt = new Date(cmd.startsAt);
    const endsAt = new Date(cmd.endsAt);

    const { booking, event } = Booking.submit({
      tenantId,
      roomId: cmd.roomId,
      requestedBy: actorId,
      startsAt,
      endsAt,
      idempotencyKey: cmd.idempotencyKey,
      ...(cmd.title !== undefined ? { title: cmd.title } : {}),
      ...(cmd.notes !== undefined ? { notes: cmd.notes } : {}),
      actorId,
    });

    try {
      await this.bookings.save(booking);
    } catch (err: unknown) {
      // GiST EXCLUSION constraint violation — database enforces zero-conflict (L-01 spatial)
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('bookings_no_overlap') || msg.includes('exclusion constraint')) {
        throw new BookingConflictError(cmd.roomId);
      }
      throw err;
    }

    await this.eventBus.publish(event);
    return { bookingId: booking.id };
  }
}
