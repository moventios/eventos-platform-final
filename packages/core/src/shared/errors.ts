export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class CapacityExceededError extends DomainError {
  constructor(passTierId: string, capacity: number) {
    super(`TicketType ${passTierId} capacity of ${capacity} has been reached`, 'CAPACITY_EXCEEDED');
  }
}

export class InvalidStateTransitionError extends DomainError {
  constructor(entity: string, from: string, to: string) {
    super(`${entity}: invalid transition ${from} → ${to}`, 'INVALID_STATE_TRANSITION');
  }
}

export class BookingConflictError extends DomainError {
  constructor(roomId: string) {
    super(`Booking conflict on room ${roomId} for the requested time range`, 'BOOKING_CONFLICT');
  }
}

export class TenantNotFoundError extends DomainError {
  constructor(tenantId: string) {
    super(`Tenant ${tenantId} not found`, 'TENANT_NOT_FOUND');
  }
}
