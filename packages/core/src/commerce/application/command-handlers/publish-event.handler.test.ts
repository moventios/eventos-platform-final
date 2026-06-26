import { describe, expect, it, vi } from 'vitest';
import type { PublishEventCommand } from '@eventos/contracts';
import type { IEventRepository } from './publish-event.handler.js';
import { PublishEventHandler } from './publish-event.handler.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';

describe('PublishEventHandler', () => {
  it('publishes event via handler and saves aggregate', async () => {
    const cmd: PublishEventCommand = {
      name: 'Launch Party',
      timezone: 'Asia/Jakarta',
    };

    const saved: any[] = [];
    const repo: IEventRepository = {
      save: vi.fn(async (e) => { saved.push(e); }),
      findById: vi.fn(),
    };
    const published: any[] = [];
    const bus: IEventBus = { publish: vi.fn(async (e) => published.push(e)) };

    const handler = new PublishEventHandler(repo, bus);
    const result = await handler.handle(cmd, 't-1', 'a-1');

    expect(result.eventId).toBeDefined();
    expect(saved.length).toBe(1);
    expect(published[0].eventType).toBe('EventPublished');
  });
});
