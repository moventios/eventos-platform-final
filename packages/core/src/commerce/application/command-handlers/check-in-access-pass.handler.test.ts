import { describe, expect, it } from 'vitest';
import type { CheckInAccessPassCommand } from '@eventos/contracts';
import { AccessPass, type AccessPassProps } from '../../domain/aggregates/access-pass.js';
import type { IAccessPassRepository } from './issue-access-pass.handler.js';
import { CheckInAccessPassHandler } from './check-in-access-pass.handler.js';
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
  async countIssued(passTierId: string, tenantId: string): Promise<number> { return 0; }
}

describe('CheckInAccessPassHandler', () => {
  it('happy path: reconstitutes, calls checkIn on aggregate, saves + publishes', async () => {
    const tenantId = 't1';
    const pass = AccessPass.reconstitute({
      id: 'p1', tenantId, passTierId: 'tier1', eventId: 'e1', customerId: 'c1',
      status: 'issued', idempotencyKey: 'k1', issuedAt: new Date(),
    });

    const repo = new InMemoryAccessPassRepo();
    await repo.save(pass);

    const published: any[] = [];
    const bus: IEventBus = { publish: async (e) => { published.push(e); } };

    const handler = new CheckInAccessPassHandler(repo, bus);
    const result = await handler.handle({ accessPassId: 'p1' }, tenantId, 'actor1');

    expect(result.accessPassId).toBe('p1');
    expect(published[0].eventType).toBe('AccessPassScanned');
    const saved = await repo.findById('p1', tenantId);
    expect(saved?.status).toBe('checked_in');
    expect(saved?.checkedInAt).toBeInstanceOf(Date);  // roundtrip after checkIn
    // issuedAt should still be present from original issue
    expect(saved?.issuedAt).toBeInstanceOf(Date);
  });

  it('error path: throws when not found', async () => {
    const repo = new InMemoryAccessPassRepo();
    const bus: IEventBus = { publish: async () => {} };
    const handler = new CheckInAccessPassHandler(repo, bus);

    await expect(handler.handle({ accessPassId: 'missing' }, 't1', 'a')).rejects.toThrow('AccessPass not found');
  });

  it('persistence fidelity: InsertOnlyRepo second save throws (would fail before upsert fix)', async () => {
    class InsertOnlyRepo implements IAccessPassRepository {
      private saved = new Set<string>();
      async save(pass: AccessPass): Promise<void> {
        if (this.saved.has(pass.id)) throw new Error('PK conflict: insert only');
        this.saved.add(pass.id);
      }
      async findById(id: string, tenantId: string): Promise<AccessPass | null> {
        const r = this.saved.has(id) ? { id, tenantId, status: 'issued', passTierId: 'tier', eventId: 'e', customerId: 'c', idempotencyKey: 'k', issuedAt: new Date() } : null;
        return r ? AccessPass.reconstitute(r) : null;
      }
      async countIssued(): Promise<number> { return 0; }
      async findPendingPastHold(): Promise<AccessPass[]> { return []; }
    }

    const repo = new InsertOnlyRepo();
    const bus: IEventBus = { publish: async () => {} };
    const handler = new CheckInAccessPassHandler(repo, bus);

    const p = AccessPass.reconstitute({ id: 'p-fid', tenantId: 't', passTierId: 'tier', eventId: 'e', customerId: 'c', status: 'issued', idempotencyKey: 'k', issuedAt: new Date() });
    await repo.save(p);

    await expect(handler.handle({ accessPassId: 'p-fid' }, 't', 'actor'))
      .rejects.toThrow(/PK conflict|insert only/);
  });

  it('persistence fidelity: UpsertCapableRepo allows second save to succeed with updated status', async () => {
    class UpsertCapableRepo implements IAccessPassRepository {
      private records = new Map<string, AccessPass>();
      async save(pass: AccessPass): Promise<void> {
        this.records.set(pass.id, pass); // overwrite = upsert semantics
      }
      async findById(id: string, tenantId: string): Promise<AccessPass | null> {
        const p = this.records.get(id);
        return p && p.toRecord().tenantId === tenantId ? p : null;
      }
      async countIssued(): Promise<number> { return 0; }
      async findPendingPastHold(): Promise<AccessPass[]> { return []; }
    }

    const repo = new UpsertCapableRepo();
    const bus: IEventBus = { publish: async () => {} };
    const handler = new CheckInAccessPassHandler(repo, bus);

    const initial = AccessPass.reconstitute({
      id: 'p-upsert', tenantId: 't', passTierId: 'tier', eventId: 'e', customerId: 'c',
      status: 'issued', idempotencyKey: 'k', issuedAt: new Date(),
    });
    await repo.save(initial);

    const result = await handler.handle({ accessPassId: 'p-upsert' }, 't', 'actor');
    expect(result.accessPassId).toBe('p-upsert');

    const saved = await repo.findById('p-upsert', 't');
    expect(saved?.status).toBe('checked_in');
    expect(saved?.checkedInAt).toBeInstanceOf(Date);
  });
});
