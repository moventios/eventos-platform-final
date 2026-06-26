import type { DomainEventBase } from '@eventos/contracts';

/** Port for publishing domain events to the outbox (L-01: cross-BC via events only) */
export interface IEventBus {
  publish(event: DomainEventBase): Promise<void>;
}
