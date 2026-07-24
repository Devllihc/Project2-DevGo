import { z } from "zod";

export const updateBookingConfigSchema = z.object({
  depositPerPerson: z.coerce.number().min(0).optional(),
  policyContent: z.string().max(10000).optional(),
  bankInfo: z.object({
    bankName:      z.string().max(100).optional(),
    accountNumber: z.string().max(30).optional(),
    accountHolder: z.string().max(100).optional(),
    branch:        z.string().max(100).optional(),
  }).optional(),
  transferNoteTemplate: z.string().max(200).optional(),
});
