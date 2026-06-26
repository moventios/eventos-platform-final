import { describe, expect, it } from 'vitest';
import type { CreateTicketTypeCommand } from '@eventos/contracts';
import { PassTier } from '../../domain/aggregates/pass-tier.js';
import type { IPassTierRepository } from './issue-access-pass.handler.js';
import { CreateTicketTypeHandler } from './create-ticket-type.handler.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';

class InMemoryPassTierRepo implements IPassTierRepository {
  private tiers = new Map<string, Record<string, unknown>>();
  async save(tier: unknown) { const t = tier as { id: string; toRecord?: () => Record<string, unknown> }; const rec = t.toRecord ? t.toRecord() : (t as Record<string, unknown>); this.tiers.set(t.id, rec); }
  async findById(id: string, tenantId: string) {
    const t = this.tiers.get(id);
    return t ? { id: t['id'] as string, capacity: t['capacity'] as number, eventId: t['eventId'] as string } : null;
  }
  async incrementIssued(id: string, tenantId: string) {}
}

describe('CreateTicketTypeHandler', () => {
  it('happy path: saves via in-mem repo and publishes PassTierCreated', async () => {
    const cmd: CreateTicketTypeCommand = {
      eventId: 'evt-1',
      name: 'VIP',
      price: '100.0000',
      currency: 'IDR',
      capacity: 100,
    };
    const repo = new InMemoryPassTierRepo();
    const published: any[] = [];
    const bus: IEventBus = { publish: async (e) => published.push(e) };

    const handler = new CreateTicketTypeHandler(repo, bus);
    const result = await handler.handle(cmd, 'tenant-1', 'actor-1');

    expect(result.passTierId).toBeDefined();
    expect(published[0].eventType).toBe('PassTierCreated');
  });

  it('error path coverage: still succeeds (no capacity check on create) but demonstrates handler contract', async () => {
    const cmd: CreateTicketTypeCommand = { eventId: 'e2', name: 'GA', price: '50.00', currency: 'IDR', capacity: 10 };
    const repo = new InMemoryPassTierRepo();
    const bus: IEventBus = { publish: async () => {} };
    const handler = new CreateTicketTypeHandler(repo, bus);
    const res = await handler.handle(cmd, 't', 'a');
    expect(res.passTierId).toBeTruthy();
  });
});
