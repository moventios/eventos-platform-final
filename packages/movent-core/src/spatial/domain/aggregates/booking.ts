import type { BookingSubmittedEvent, BookingApprovedEvent, BookingCanceledEvent } from '@movent/contracts';
import { InvalidStateTransitionError } from '../../../shared/errors.js';
import { randomUUID } from 'crypto';

/**
 * Movent Infrastructure - Activation Engine
 * 
 * Booking = Participation in a Place (Venue).
 * Creates Relationships between Identity and Place.
 * Complements AccessPass (Participation Credential).
 * User-facing: Participation / Activation. Technical name preserved.
 */

export type BookingState = 'pending' | 'under_review' | 'approved' | 'active' | 'completed' | 'rejected' | 'canceled';

export interface BookingProps {
  id: string;
  tenantId: string;
  roomId: string;
  requestedBy: string;
  status: BookingState;
  startsAt: Date;
  endsAt: Date;
  idempotencyKey: string;
  title?: string;
  notes?: string;
}

const VALID_TRANSITIONS: Record<BookingState, BookingState[]> = {
  pending: ['under_review', 'approved', 'canceled', 'rejected'],
  under_review: ['approved', 'rejected', 'canceled'],
  approved: ['active', 'canceled'],
  active: ['completed', 'canceled'],
  completed: [],
  rejected: [],
  canceled: [],
};

export class Booking {
  private constructor(private readonly props: BookingProps) {}

  static submit(params: {
    tenantId: string;
    roomId: string;
    requestedBy: string;
    startsAt: Date;
    endsAt: Date;
    idempotencyKey: string;
    title?: string;
    notes?: string;
    actorId: string;
  }): { booking: Booking; event: BookingSubmittedEvent } {
    const id = randomUUID();
    const booking = new Booking({
      id,
      tenantId: params.tenantId,
      roomId: params.roomId,
      requestedBy: params.requestedBy,
      status: 'pending',
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      idempotencyKey: params.idempotencyKey,
      ...(params.title !== undefined ? { title: params.title } : {}),
      ...(params.notes !== undefined ? { notes: params.notes } : {}),
    });

    const event: BookingSubmittedEvent = {
      eventId: randomUUID(),
      eventType: 'BookingSubmitted',
      eventVersion: 'v1',
      aggregateId: id,
      aggregateType: 'Booking',
      tenantId: params.tenantId,
      actorId: params.actorId,
      occurredAt: new Date().toISOString(),
      payload: {
        bookingId: id,
        roomId: params.roomId,
        startsAt: params.startsAt.toISOString(),
        endsAt: params.endsAt.toISOString(),
      },
    };

    return { booking, event };
  }

  approve(actorId: string): BookingApprovedEvent {
    this.transition('approved');
    return {
      eventId: randomUUID(),
      eventType: 'BookingApproved',
      eventVersion: 'v1',
      aggregateId: this.props.id,
      aggregateType: 'Booking',
      tenantId: this.props.tenantId,
      actorId,
      occurredAt: new Date().toISOString(),
      payload: { bookingId: this.props.id },
    };
  }

  cancel(actorId: string, reason?: string): BookingCanceledEvent {
    this.transition('canceled');
    return {
      eventId: randomUUID(),
      eventType: 'BookingCanceled',
      eventVersion: 'v1',
      aggregateId: this.props.id,
      aggregateType: 'Booking',
      tenantId: this.props.tenantId,
      actorId,
      occurredAt: new Date().toISOString(),
      payload: reason !== undefined
        ? { bookingId: this.props.id, reason }
        : { bookingId: this.props.id },
    };
  }

  private transition(to: BookingState): void {
    const allowed = VALID_TRANSITIONS[this.props.status];
    if (!allowed?.includes(to)) {
      throw new InvalidStateTransitionError('Booking', this.props.status, to);
    }
    this.props.status = to;
  }

  get id() { return this.props.id; }
  get status() { return this.props.status; }
  get startsAt() { return this.props.startsAt; }
  get endsAt() { return this.props.endsAt; }

  toRecord(): BookingProps { return { ...this.props }; }

  static reconstitute(props: BookingProps): Booking {
    return new Booking(props);
  }
}
