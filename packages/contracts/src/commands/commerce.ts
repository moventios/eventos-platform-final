import { z } from 'zod';

export const PublishEventSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  timezone: z.string().default('UTC'),
  metadata: z.record(z.unknown()).optional(),
});
export type PublishEventCommand = z.infer<typeof PublishEventSchema>;

export const CreateTicketTypeSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(1).max(255),
  price: z.string().regex(/^\d+(\.\d{1,4})?$/, 'Must be a valid decimal amount'),
  currency: z.string().length(3).default('IDR'),
  capacity: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional(),
});
export type CreateTicketTypeCommand = z.infer<typeof CreateTicketTypeSchema>;

export const IssueAccessPassSchema = z.object({
  passTierId: z.string().uuid(),
  eventId: z.string().uuid(),
  customerId: z.string().uuid(),
  idempotencyKey: z.string().min(1).max(255),
  metadata: z.record(z.unknown()).optional(),
});
export type IssueAccessPassCommand = z.infer<typeof IssueAccessPassSchema>;

export const CheckInAccessPassSchema = z.object({
  accessPassId: z.string().uuid(),
});
export type CheckInAccessPassCommand = z.infer<typeof CheckInAccessPassSchema>;

export const RevokeAccessPassSchema = z.object({
  accessPassId: z.string().uuid(),
  reason: z.string().optional(),
});
export type RevokeAccessPassCommand = z.infer<typeof RevokeAccessPassSchema>;
