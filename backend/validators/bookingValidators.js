import { z } from "zod";

const MAX_TRAVELERS_PER_BOOKING = 20;

export const createBookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  phone: z.string().trim().min(1, "Phone is required"),
  travelers: z.coerce.number().int().min(1).max(MAX_TRAVELERS_PER_BOOKING, `Travelers must be between 1 and ${MAX_TRAVELERS_PER_BOOKING}`),
  specialRequests: z.string().trim().optional(),
  tourId: z.string().trim().min(1, "tourId is required"),
  startDate: z.string().trim().min(1, "startDate is required"),
});

export const editBookingSchema = z.object({
  travelers: z.coerce.number().int().min(1).max(MAX_TRAVELERS_PER_BOOKING, `Travelers must be between 1 and ${MAX_TRAVELERS_PER_BOOKING}`).optional(),
  startDate: z.string().trim().min(1).optional(),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().trim().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["unpaid", "paid", "refunded"]).optional(),
});
