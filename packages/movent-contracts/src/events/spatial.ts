import type { DomainEventBase } from './_base.js';

export interface FacilityRegisteredEvent extends DomainEventBase {
  readonly eventType: 'FacilityRegistered';
  readonly aggregateType: 'Facility';
  readonly payload: { facilityId: string; name: string };
}

export interface BookingSubmittedEvent extends DomainEventBase {
  readonly eventType: 'BookingSubmitted';
  readonly aggregateType: 'Booking';
  readonly payload: { bookingId: string; roomId: string; startsAt: string; endsAt: string };
}

export interface BookingApprovedEvent extends DomainEventBase {
  readonly eventType: 'BookingApproved';
  readonly aggregateType: 'Booking';
  readonly payload: { bookingId: string };
}

export interface BookingConflictDetectedEvent extends DomainEventBase {
  readonly eventType: 'BookingConflictDetected';
  readonly aggregateType: 'Booking';
  readonly payload: { roomId: string; startsAt: string; endsAt: string };
}

export interface BookingCanceledEvent extends DomainEventBase {
  readonly eventType: 'BookingCanceled';
  readonly aggregateType: 'Booking';
  readonly payload: { bookingId: string; reason?: string };
}

export interface RoomCreatedEvent extends DomainEventBase {
  readonly eventType: 'RoomCreated';
  readonly aggregateType: 'Room';
  readonly payload: { roomId: string; facilityId: string; name: string; capacity: number };
}
