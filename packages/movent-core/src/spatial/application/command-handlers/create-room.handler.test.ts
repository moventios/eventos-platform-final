import { describe, expect, it, vi } from 'vitest';
import type { CreateRoomCommand } from '@movent/contracts';
import { Room } from '../../domain/aggregates/room.js';
import type { IRoomRepository } from './create-room.handler.js';
import { CreateRoomHandler } from './create-room.handler.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';

describe('CreateRoomHandler', () => {
  it('creates room and emits RoomCreated via handler', async () => {
    const cmd: CreateRoomCommand = {
      facilityId: 'fac-123',
      name: 'Room A',
      capacity: 50,
    };

    const saved: any[] = [];
    const repo: IRoomRepository = {
      save: vi.fn(async (r) => {
        saved.push(r);
      }),
      findById: vi.fn(),
      findByFacility: vi.fn(),
    };
    const published: any[] = [];
    const bus: IEventBus = { publish: vi.fn(async (e) => published.push(e)) };

    const handler = new CreateRoomHandler(repo, bus);
    const result = await handler.handle(cmd, 'tenant-x', 'actor-x');

    expect(result.roomId).toBeTruthy();
    expect(saved[0].toRecord().facilityId).toBe('fac-123');
    expect(published[0].eventType).toBe('RoomCreated');
    expect(published[0].payload.capacity).toBe(50);
  });
});
