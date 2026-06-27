import type { CreateRoomCommand } from '@movent/contracts';
import { Room } from '../../domain/aggregates/room.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';

export interface IRoomRepository {
  save(room: Room): Promise<void>;
  findById(id: string, tenantId: string): Promise<Room | null>;
  findByFacility(facilityId: string, tenantId: string): Promise<any[]>;
}

export interface CreateRoomResult {
  roomId: string;
}

export class CreateRoomHandler {
  constructor(
    private readonly rooms: IRoomRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(
    cmd: CreateRoomCommand,
    tenantId: string,
    actorId: string,
  ): Promise<CreateRoomResult> {
    const { room, event } = Room.create({
      tenantId,
      facilityId: cmd.facilityId,
      name: cmd.name,
      capacity: cmd.capacity,
      ...(cmd.metadata !== undefined ? { metadata: cmd.metadata } : {}),
      actorId,
    });

    await this.rooms.save(room);
    await this.eventBus.publish(event);
    return { roomId: room.id };
  }
}
