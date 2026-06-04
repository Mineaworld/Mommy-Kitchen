import { z } from "zod";

export const categoryInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  name_km: z.string().min(1).max(120),
  cover_image_url: z.url(),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true)
});
