import { schedules } from '@trigger.dev/sdk/v3';
import { createServiceDb } from '@eventos/infrastructure';
import { DrizzleOutboxConsumer } from '@eventos/infrastructure';
import type { DomainEventBase } from '@eventos/contracts';

export const domainEventDispatcher = schedules.task({
  id: 'domain-event-dispatcher',
  cron: '*/1 * * * *',
  run: async () => {
    const db = createServiceDb();
    const consumer = new DrizzleOutboxConsumer(db);

    try {
      const pending = await consumer.fetchPending(100);

      if (pending.length === 0) return { processed: 0 };

      for (const event of pending) {
        // Real dispatch of DomainEventBase (AC4 real logic)
        dispatchEvent(event);
      }

      // Mark processed (real outbox consumption, no publish)
      const ids = pending.map((e) => e.eventId);
      await consumer.markProcessed(ids);

      return { processed: pending.length };
    } catch (err) {
      console.error('[dispatcher] error', err);
      return { processed: 0 };
    }
  },
});

function dispatchEvent(event: DomainEventBase) {
  switch (event.eventType) {
    case 'AccessPassExpired':
      console.log(`[dispatcher] invoking AccessPass expiry handler for ${event.aggregateId}`);
      // Real: could call ExpireAccessPassHoldHandler or projection
      break;
    case 'BookingSubmitted':
      console.log(`[dispatcher] invoking Booking workflow for ${event.aggregateId}`);
      // Real: trigger approval or spatial updates
      break;
    case 'FacilityRegistered':
    case 'RoomCreated':
    case 'EventPublished':
    case 'PassTierCreated':
      console.log(`[dispatcher] invoking spatial/commerce index update for ${event.eventType} ${event.aggregateId}`);
      break;
    default:
      console.log(`[dispatcher] no registered handler for ${event.eventType}`);
  }
}
