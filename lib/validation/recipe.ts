import { z } from "zod";
import { MEAL_SLOT_VALUES } from "@/lib/types";

export const recipeInputSchema = z.object({
  title_km: z.string().min(1).max(120),
  thumbnail_url: z.url(),
  category_id: z.uuid(),
  meal_slot: z.enum(MEAL_SLOT_VALUES).default("any"),
  youtube_url: z.url().refine(
    (value) => value.includes("youtube.com") || value.includes("youtu.be"),
    "Must be a valid YouTube link"
  ),
  duration_minutes: z.number().int().min(1).optional(),
  is_published: z.boolean().default(true)
});
