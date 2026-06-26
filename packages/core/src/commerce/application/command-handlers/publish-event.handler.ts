import type { PublishEventCommand } from '@eventos/contracts';
import { Event } from '../../domain/aggregates/event.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';

export interface IEventRepository {
  save(event: Event): Promise<void>;
  findById(id: string, tenantId: string): Promise<Event | null>;
}

export interface PublishEventResult {
  eventId: string;
}

export class PublishEventHandler {
  constructor(
    private readonly events: IEventRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(
    cmd: PublishEventCommand,
    tenantId: string,
    actorId: string,
  ): Promise<PublishEventResult> {
    const { event, publishedEvent } = Event.publish({
      tenantId,
      name: cmd.name,
      ...(cmd.description !== undefined ? { description: cmd.description } : {}),
      ...(cmd.startsAt !== undefined ? { startsAt: cmd.startsAt } : {}),
      ...(cmd.endsAt !== undefined ? { endsAt: cmd.endsAt } : {}),
      timezone: cmd.timezone,
      ...(cmd.metadata !== undefined ? { metadata: cmd.metadata } : {}),
      actorId,
    });

    await this.events.save(event);
    await this.eventBus.publish(publishedEvent);
    return { eventId: event.id };
  }
}
