import type { FacilityRegisteredEvent } from '@movent/contracts';
import { randomUUID } from 'crypto';

/**
 * Movent Infrastructure - Place Engine
 *
 * Facility = Venue / Place (internal).
 * Node in the Network where Participation and Relationships are activated.
 * User-facing: Places.
 */

export interface FacilityProps {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  address?: string;
  geoLat?: string;
  geoLng?: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export class Facility {
  private constructor(private readonly props: FacilityProps) {}

  static register(params: {
    tenantId: string;
    name: string;
    description?: string;
    address?: string;
    geoLat?: number;
    geoLng?: number;
    metadata?: Record<string, unknown>;
    actorId: string;
  }): { facility: Facility; event: FacilityRegisteredEvent } {
    const id = randomUUID();
    const facility = new Facility({
      id,
      tenantId: params.tenantId,
      name: params.name,
      ...(params.description !== undefined ? { description: params.description } : {}),
      ...(params.address !== undefined ? { address: params.address } : {}),
      ...(params.geoLat !== undefined ? { geoLat: params.geoLat.toString() } : {}),
      ...(params.geoLng !== undefined ? { geoLng: params.geoLng.toString() } : {}),
      status: 'draft',
      metadata: params.metadata ?? {},
    });

    const event: FacilityRegisteredEvent = {
      eventId: randomUUID(),
      eventType: 'FacilityRegistered',
      eventVersion: 'v1',
      aggregateId: id,
      aggregateType: 'Facility',
      tenantId: params.tenantId,
      actorId: params.actorId,
      occurredAt: new Date().toISOString(),
      payload: { facilityId: id, name: params.name },
    };

    return { facility, event };
  }

  get id() {
    return this.props.id;
  }
  get status() {
    return this.props.status;
  }

  toRecord(): FacilityProps {
    return { ...this.props };
  }

  static reconstitute(props: FacilityProps): Facility {
    return new Facility(props);
  }
}
