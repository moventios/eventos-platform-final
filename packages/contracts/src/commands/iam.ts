import { z } from 'zod';

export const ProvisionTenantSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  ownerEmail: z.string().email(),
  ownerDisplayName: z.string().min(1).max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ProvisionTenantCommand = z.infer<typeof ProvisionTenantSchema>;

export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
  organizationId: z.string().uuid().optional(),
});
export type InviteUserCommand = z.infer<typeof InviteUserSchema>;

export const AssignRoleSchema = z.object({
  membershipId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'manager', 'member', 'viewer']),
});
export type AssignRoleCommand = z.infer<typeof AssignRoleSchema>;
