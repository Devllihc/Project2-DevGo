import { z } from "zod";

// multer places these on req.body as strings (multipart/form-data), so every
// field is coerced from string rather than assumed to already be a number.
export const createTourSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  desc: z.string().trim().min(1, "Description is required"),
  price: z.coerce.number().nonnegative("Price must be >= 0"),
  city: z.string().trim().min(1, "City is required"),
  distance: z.coerce.number().nonnegative("Distance must be >= 0"),
  maxGroupSize: z.coerce.number().int().positive("maxGroupSize must be a positive integer"),
  availableDates: z.string().optional(),
  featured: z.union([z.string(), z.boolean()]).optional(),
});

// Admin edit form re-submits every field on update, but keep them optional so
// a partial update (e.g. photo-only) isn't rejected.
export const updateTourSchema = z.object({
  title: z.string().trim().min(1).optional(),
  desc: z.string().trim().min(1).optional(),
  price: z.coerce.number().nonnegative().optional(),
  city: z.string().trim().min(1).optional(),
  distance: z.coerce.number().nonnegative().optional(),
  maxGroupSize: z.coerce.number().int().positive().optional(),
  availableDates: z.string().optional(),
  featured: z.union([z.string(), z.boolean()]).optional(),
});
