import { z } from 'zod';

export const ResolveApprovalSchema = z.object({
  approvalId: z.string().uuid(),
  resolution: z.enum(['approved', 'rejected']),
  note: z.string().optional(),
});
export type ResolveApprovalCommand = z.infer<typeof ResolveApprovalSchema>;
