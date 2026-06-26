import { z } from 'zod';

export const RegisterFacilitySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  address: z.string().optional(),
  geoLat: z.number().min(-90).max(90).optional(),
  geoLng: z.number().min(-180).max(180).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type RegisterFacilityCommand = z.infer<typeof RegisterFacilitySchema>;

export const CreateRoomSchema = z.object({
  facilityId: z.string().uuid(),
  name: z.string().min(1).max(255),
  capacity: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional(),
});
export type CreateRoomCommand = z.infer<typeof CreateRoomSchema>;

export const SubmitBookingSchema = z.object({
  roomId: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  title: z.string().max(255).optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().min(1).max(255),
  metadata: z.record(z.unknown()).optional(),
});
export type SubmitBookingCommand = z.infer<typeof SubmitBookingSchema>;

export const ApproveBookingSchema = z.object({
  bookingId: z.string().uuid(),
  notes: z.string().optional(),
});
export type ApproveBookingCommand = z.infer<typeof ApproveBookingSchema>;

export const CancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().optional(),
});
export type CancelBookingCommand = z.infer<typeof CancelBookingSchema>;
