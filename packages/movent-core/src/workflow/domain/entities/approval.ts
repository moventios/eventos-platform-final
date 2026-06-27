import type { ApprovalResolvedEvent } from '@movent/contracts';
import { InvalidStateTransitionError } from '../../../shared/errors.js';
import { randomUUID } from 'crypto';

/**
 * Movent Infrastructure - Governance Engine
 * 
 * Approval = Governance / Trust mechanism.
 * Controls Participation and maintains reputation in the Network.
 * User-facing: Governance.
 */

export type ApprovalState = 'pending' | 'approved' | 'rejected' | 'expired';

export interface ApprovalProps {
  id: string;
  tenantId: string;
  assignedTo: string;
  requestContext: Record<string, unknown>;
  status: ApprovalState;
  workflowInstanceId?: string;
}

export class Approval {
  private constructor(private readonly props: ApprovalProps) {}

  resolve(
    resolution: 'approved' | 'rejected',
    actorId: string,
    note?: string,
  ): ApprovalResolvedEvent {
    if (this.props.status !== 'pending') {
      throw new InvalidStateTransitionError('Approval', this.props.status, resolution);
    }
    this.props.status = resolution;

    return {
      eventId: randomUUID(),
      eventType: 'ApprovalResolved',
      eventVersion: 'v1',
      aggregateId: this.props.id,
      aggregateType: 'Approval',
      tenantId: this.props.tenantId,
      actorId,
      occurredAt: new Date().toISOString(),
      payload: note !== undefined
        ? { approvalId: this.props.id, resolution, note }
        : { approvalId: this.props.id, resolution },
    };
  }

  get id() { return this.props.id; }
  get status() { return this.props.status; }
  get requestContext() { return this.props.requestContext; }

  static reconstitute(props: ApprovalProps): Approval { return new Approval(props); }
}
