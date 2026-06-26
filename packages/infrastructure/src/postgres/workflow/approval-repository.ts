import { eq, and } from 'drizzle-orm';
import { approvals } from '@eventos/database/schema';
import { Approval } from '@eventos/core/workflow';
import type { IApprovalRepository } from '@eventos/core/workflow';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@eventos/database/schema';

export class DrizzleApprovalRepository implements IApprovalRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async findById(id: string, tenantId: string): Promise<Approval | null> {
    const row = await this.db.query.approvals.findFirst({
      where: and(eq(approvals.id, id), eq(approvals.tenantId, tenantId)),
    });
    if (!row) return null;
    return Approval.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      assignedTo: row.assignedTo,
      requestContext: (row.requestContext ?? {}) as Record<string, unknown>,
      status: row.status as 'pending' | 'approved' | 'rejected' | 'expired',
      ...(row.workflowInstanceId != null ? { workflowInstanceId: row.workflowInstanceId } : {}),
    });
  }

  async save(approval: Approval): Promise<void> {
    await this.db
      .update(approvals)
      .set({
        status: approval.status,
        resolvedAt: approval.status !== 'pending' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(approvals.id, approval.id));
  }
}
