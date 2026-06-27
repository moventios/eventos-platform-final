import type { ResolveApprovalCommand } from '@movent/contracts';
import type { Approval } from '../../domain/entities/approval.js';
import type { IEventBus } from '../../../shared/i-event-bus.js';
import { DomainError } from '../../../shared/errors.js';

export interface IApprovalRepository {
  findById(id: string, tenantId: string): Promise<Approval | null>;
  save(approval: Approval): Promise<void>;
}

export class ResolveApprovalHandler {
  constructor(
    private readonly approvals: IApprovalRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(cmd: ResolveApprovalCommand, tenantId: string, actorId: string) {
    const approval = await this.approvals.findById(cmd.approvalId, tenantId);
    if (!approval) throw new DomainError('Approval not found', 'NOT_FOUND');

    const event = approval.resolve(cmd.resolution, actorId, cmd.note);
    await this.approvals.save(approval);
    await this.eventBus.publish(event);

    return { approvalId: approval.id, resolution: cmd.resolution };
  }
}
