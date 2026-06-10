import { z } from "zod";
import { MEAL_SLOT_VALUES } from "@/lib/types";

export const bulkImportRowSchema = z.object({
  title_km: z.string().min(1, "Title is required").max(120),
  image_filename: z.string().min(1, "Image filename is required"),
  youtube_url: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) =>
        val === "" || val.includes("youtube.com") || val.includes("youtu.be"),
      { message: "Must be a valid YouTube URL" }
    ),
  category_slug: z.string().min(1, "Category slug is required"),
  meal_slot: z.enum(MEAL_SLOT_VALUES).default("any"),
  duration_minutes: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      if (typeof val === "number" && isNaN(val)) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().int().min(1).optional()
  ),
});

export type BulkImportRow = z.infer<typeof bulkImportRowSchema>;
