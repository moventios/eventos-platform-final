/** Base domain event shape — all events include traceability fields */
export interface DomainEventBase {
  readonly eventId: string;
  readonly eventType: string;
  readonly eventVersion: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly traceId?: string;
  readonly occurredAt: string; // ISO 8601
  readonly payload?: Record<string, unknown>;
}
