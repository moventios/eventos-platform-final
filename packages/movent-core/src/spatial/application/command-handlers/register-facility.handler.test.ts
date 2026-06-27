import { describe, expect, it, vi } from 'vitest';
import type { RegisterFacilityCommand } from '@movent/contracts';
import { Facility } from '../../domain/aggregates/facility.js';
import type { IFacilityRepository } from './register-facility.handler.js';
import { RegisterFacilityHandler } from './register-facility.handler.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';

describe('RegisterFacilityHandler', () => {
  it('creates facility via aggregate and publishes event through injected bus', async () => {
    const cmd: RegisterFacilityCommand = {
      name: 'Main Hall',
      description: 'Primary venue',
      address: '123 Main St',
    };

    const saved: Facility[] = [];
    const repo: IFacilityRepository = {
      save: vi.fn(async (f) => { saved.push(f); }),
      findById: vi.fn(),
    };

    const published: any[] = [];
    const bus: IEventBus = { publish: vi.fn(async (e) => { published.push(e); }) };

    const handler = new RegisterFacilityHandler(repo, bus);
    const result = await handler.handle(cmd, 'tenant-1', 'actor-1');

    expect(result.facilityId).toBeDefined();
    expect(saved.length).toBe(1);
    expect(saved[0].id).toBe(result.facilityId);
    expect(published.length).toBe(1);
    expect(published[0].eventType).toBe('FacilityRegistered');
    expect(published[0].payload.name).toBe('Main Hall');
  });
});
