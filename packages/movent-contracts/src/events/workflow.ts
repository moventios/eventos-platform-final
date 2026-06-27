import type { DomainEventBase } from './_base.js';

export interface ApprovalCreatedEvent extends DomainEventBase {
  readonly eventType: 'ApprovalCreated';
  readonly aggregateType: 'Approval';
  readonly payload: { approvalId: string; commandType: string; aggregateId: string };
}

export interface ApprovalResolvedEvent extends DomainEventBase {
  readonly eventType: 'ApprovalResolved';
  readonly aggregateType: 'Approval';
  readonly payload: { approvalId: string; resolution: 'approved' | 'rejected'; note?: string };
}

export interface AIWriteInterceptionTriggeredEvent extends DomainEventBase {
  readonly eventType: 'AIWriteInterceptionTriggered';
  readonly aggregateType: 'Approval';
  readonly payload: {
    approvalId: string;
    commandType: string;
    actorId: string;
    aggregateId: string;
    aggregateType: string;
  };
}
