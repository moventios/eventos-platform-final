import type { RoomCreatedEvent } from '@eventos/contracts';
import { randomUUID } from 'crypto';

export interface RoomProps {
  id: string;
  tenantId: string;
  facilityId: string;
  name: string;
  capacity: number;
  status: string;
  metadata?: Record<string, unknown>;
}

export class Room {
  private constructor(private readonly props: RoomProps) {}

  static create(params: {
    tenantId: string;
    facilityId: string;
    name: string;
    capacity: number;
    metadata?: Record<string, unknown>;
    actorId: string;
  }): { room: Room; event: RoomCreatedEvent } {
    const id = randomUUID();
    const room = new Room({
      id,
      tenantId: params.tenantId,
      facilityId: params.facilityId,
      name: params.name,
      capacity: params.capacity,
      status: 'available',
      metadata: params.metadata ?? {},
    });

    const event: RoomCreatedEvent = {
      eventId: randomUUID(),
      eventType: 'RoomCreated',
      eventVersion: 'v1',
      aggregateId: id,
      aggregateType: 'Room',
      tenantId: params.tenantId,
      actorId: params.actorId,
      occurredAt: new Date().toISOString(),
      payload: {
        roomId: id,
        facilityId: params.facilityId,
        name: params.name,
        capacity: params.capacity,
      },
    };

    return { room, event };
  }

  get id() { return this.props.id; }
  get facilityId() { return this.props.facilityId; }
  get capacity() { return this.props.capacity; }

  toRecord(): RoomProps { return { ...this.props }; }

  static reconstitute(props: RoomProps): Room {
    return new Room(props);
  }
}
