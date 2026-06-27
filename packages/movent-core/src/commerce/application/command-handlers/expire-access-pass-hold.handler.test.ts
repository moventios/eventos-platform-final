import { describe, expect, it } from 'vitest';
import { AccessPass, type AccessPassProps } from '../../domain/aggregates/access-pass.js';
import type { IAccessPassRepository } from './issue-access-pass.handler.js';
import { ExpireAccessPassHoldHandler } from './expire-access-pass-hold.handler.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';

class InMemoryAccessPassRepo implements IAccessPassRepository {
  private records = new Map<string, AccessPassProps>();

  async save(pass: AccessPass): Promise<void> {
    this.records.set(pass.id, pass.toRecord());
  }
  async findById(id: string, tenantId: string): Promise<AccessPass | null> {
    const r = this.records.get(id);
    if (!r || r.tenantId !== tenantId) return null;
    return AccessPass.reconstitute(r);
  }
  async countIssued(): Promise<number> { return 0; }
  async findPendingPastHold(limit: number): Promise<AccessPass[]> {
    const now = new Date();
    const results: AccessPass[] = [];
    for (const r of this.records.values()) {
      if (r.status === 'pending' && r.holdsUntil && new Date(r.holdsUntil) < now) {
        results.push(AccessPass.reconstitute(r));
        if (results.length >= limit) break;
      }
    }
    return results;
  }
}

describe('ExpireAccessPassHoldHandler', () => {
  it('happy path: finds pending past hold, calls expire on aggregate, saves and publishes', async () => {
    const tenantId = 't1';
    const pastHold = new Date(Date.now() - 1000 * 60 * 20); // 20 min ago
    const pass = AccessPass.reconstitute({
      id: 'p-exp', tenantId, passTierId: 'tier1', eventId: 'e1', customerId: 'c1',
      status: 'pending', idempotencyKey: 'k-exp', holdsUntil: pastHold, issuedAt: new Date(Date.now() - 1000*60*30),
    });

    const repo = new InMemoryAccessPassRepo();
    await repo.save(pass);

    const published: any[] = [];
    const bus: IEventBus = { publish: async (e) => { published.push(e); } };

    const handler = new ExpireAccessPassHoldHandler(repo, bus);
    const result = await handler.handle(10);

    expect(result.expired).toBe(1);
    expect(published[0].eventType).toBe('AccessPassExpired');
    const saved = await repo.findById('p-exp', tenantId);
    expect(saved?.status).toBe('expired');
    // timestamps roundtripped (issuedAt from before, no new checkedInAt for expire)
    expect(saved?.issuedAt).toBeInstanceOf(Date);
    expect(saved?.holdsUntil).toBeInstanceOf(Date);
  });

  it('error path / empty: returns 0 when none pending past hold', async () => {
    const repo = new InMemoryAccessPassRepo();
    const bus: IEventBus = { publish: async () => {} };
    const handler = new ExpireAccessPassHoldHandler(repo, bus);
    const result = await handler.handle(10);
    expect(result.expired).toBe(0);
  });
});