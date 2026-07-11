import { z } from "zod";

export const generateItinerarySchema = z.object({
  destination: z.string().trim().min(1, "destination is required"),
  duration: z.coerce.number().int().min(1).max(30).optional(),
  budget: z.union([z.string(), z.coerce.number()]).optional(),
  requirements: z.string().trim().optional(),
});
