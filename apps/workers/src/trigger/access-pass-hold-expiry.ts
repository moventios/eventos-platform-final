import { schedules } from '@trigger.dev/sdk/v3';
import { createServiceDb, OutboxEventBus } from '@eventos/infrastructure';
import { DrizzleAccessPassRepository } from '@eventos/infrastructure/postgres/commerce';
import { ExpireAccessPassHoldHandler } from '@eventos/core/commerce';

export const accessPassHoldExpiry = schedules.task({
  id: 'access-pass-hold-expiry',
  cron: '*/5 * * * *',
  run: async () => {
    const db = createServiceDb();
    const repo = new DrizzleAccessPassRepository(db);
    const bus = new OutboxEventBus(db);
    const handler = new ExpireAccessPassHoldHandler(repo, bus);

    const result = await handler.handle(500);
    console.log(`[access-pass-hold-expiry] Expired ${result.expired} passes`);
    return result;
  },
});
