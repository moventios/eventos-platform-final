import type { AccessPassIssuedEvent, AccessPassScannedEvent, AccessPassExpiredEvent, AccessPassRevokedEvent } from '@eventos/contracts';
import { InvalidStateTransitionError, CapacityExceededError } from '../../../shared/errors.js';
import { randomUUID } from 'crypto';

export type AccessPassState = 'pending' | 'issued' | 'checked_in' | 'consumed' | 'revoked' | 'expired';

export interface AccessPassProps {
  id: string;
  tenantId: string;
  passTierId: string;
  eventId: string;
  customerId: string;
  status: AccessPassState;
  idempotencyKey: string;
  holdsUntil?: Date;
  issuedAt?: Date;
  checkedInAt?: Date;
}

const VALID_TRANSITIONS: Record<AccessPassState, AccessPassState[]> = {
  pending: ['issued', 'expired'],
  issued: ['checked_in', 'revoked', 'expired'],
  checked_in: ['consumed', 'revoked'],
  consumed: [],
  revoked: [],
  expired: [],
};

export class AccessPass {
  private constructor(private readonly props: AccessPassProps) {}

  static issue(params: {
    tenantId: string;
    passTierId: string;
    eventId: string;
    customerId: string;
    idempotencyKey: string;
    quantityIssued: number;
    capacity: number;
    actorId: string;
  }): { pass: AccessPass; event: AccessPassIssuedEvent } {
    if (params.quantityIssued >= params.capacity) {
      throw new CapacityExceededError(params.passTierId, params.capacity);
    }

    const id = randomUUID();
    const holdsUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min hold

    const pass = new AccessPass({
      id,
      tenantId: params.tenantId,
      passTierId: params.passTierId,
      eventId: params.eventId,
      customerId: params.customerId,
      status: 'pending',
      idempotencyKey: params.idempotencyKey,
      holdsUntil,
      issuedAt: new Date(),
    });

    const event: AccessPassIssuedEvent = {
      eventId: randomUUID(),
      eventType: 'AccessPassIssued',
      eventVersion: 'v1',
      aggregateId: id,
      aggregateType: 'AccessPass',
      tenantId: params.tenantId,
      actorId: params.actorId,
      occurredAt: new Date().toISOString(),
      payload: { accessPassId: id, passTierId: params.passTierId, customerId: params.customerId },
    };

    return { pass, event };
  }

  checkIn(actorId: string): AccessPassScannedEvent {
    this.transition('checked_in');
    this.props.checkedInAt = new Date();
    return {
      eventId: randomUUID(), eventType: 'AccessPassScanned', eventVersion: 'v1',
      aggregateId: this.props.id, aggregateType: 'AccessPass',
      tenantId: this.props.tenantId, actorId,
      occurredAt: new Date().toISOString(),
      payload: { accessPassId: this.props.id },
    };
  }

  expire(actorId: string): AccessPassExpiredEvent {
    this.transition('expired');
    return {
      eventId: randomUUID(), eventType: 'AccessPassExpired', eventVersion: 'v1',
      aggregateId: this.props.id, aggregateType: 'AccessPass',
      tenantId: this.props.tenantId, actorId,
      occurredAt: new Date().toISOString(),
      payload: { accessPassId: this.props.id },
    };
  }

  revoke(actorId: string, reason?: string): AccessPassRevokedEvent {
    this.transition('revoked');
    return {
      eventId: randomUUID(), eventType: 'AccessPassRevoked', eventVersion: 'v1',
      aggregateId: this.props.id, aggregateType: 'AccessPass',
      tenantId: this.props.tenantId, actorId,
      occurredAt: new Date().toISOString(),
      payload: reason !== undefined
        ? { accessPassId: this.props.id, reason }
        : { accessPassId: this.props.id },
    };
  }

  private transition(to: AccessPassState): void {
    const allowed = VALID_TRANSITIONS[this.props.status];
    if (!allowed?.includes(to)) {
      throw new InvalidStateTransitionError('AccessPass', this.props.status, to);
    }
    this.props.status = to;
  }

  get id() { return this.props.id; }
  get status() { return this.props.status; }
  get holdsUntil() { return this.props.holdsUntil; }
  get issuedAt() { return this.props.issuedAt; }
  get checkedInAt() { return this.props.checkedInAt; }

  toRecord(): AccessPassProps { return { ...this.props }; }

  static reconstitute(props: AccessPassProps): AccessPass { return new AccessPass(props); }
}
