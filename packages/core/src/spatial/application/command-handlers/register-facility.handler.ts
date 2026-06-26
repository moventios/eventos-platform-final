import type { RegisterFacilityCommand } from '@eventos/contracts';
import { Facility } from '../../domain/aggregates/facility.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';

export interface IFacilityRepository {
  save(facility: Facility): Promise<void>;
  findById(id: string, tenantId: string): Promise<Facility | null>;
}

export interface RegisterFacilityResult {
  facilityId: string;
}

export class RegisterFacilityHandler {
  constructor(
    private readonly facilities: IFacilityRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(
    cmd: RegisterFacilityCommand,
    tenantId: string,
    actorId: string,
  ): Promise<RegisterFacilityResult> {
    const { facility, event } = Facility.register({
      tenantId,
      name: cmd.name,
      ...(cmd.description !== undefined ? { description: cmd.description } : {}),
      ...(cmd.address !== undefined ? { address: cmd.address } : {}),
      ...(cmd.geoLat !== undefined ? { geoLat: cmd.geoLat } : {}),
      ...(cmd.geoLng !== undefined ? { geoLng: cmd.geoLng } : {}),
      ...(cmd.metadata !== undefined ? { metadata: cmd.metadata } : {}),
      actorId,
    });

    await this.facilities.save(facility);
    await this.eventBus.publish(event);
    return { facilityId: facility.id };
  }
}
