export const MEAL_SLOT_VALUES = ["breakfast", "lunch", "dinner", "any"] as const;

export type MealSlot = (typeof MEAL_SLOT_VALUES)[number];

export type Category = {
  id: string;
  slug: string;
  name_km: string;
  cover_image_url: string;
  display_order: number;
  is_active: boolean;
};

export type CategoryInput = {
  slug: string;
  name_km: string;
  cover_image_url: string;
  display_order: number;
  is_active: boolean;
};

export type Recipe = {
  id: string;
  title_km: string;
  thumbnail_url: string;
  category_id: string;
  meal_slot: MealSlot;
  youtube_url: string;
  youtube_video_id: string | null;
  duration_minutes: number | null;
  is_published: boolean;
};

export type RecipeInput = {
  title_km: string;
  thumbnail_url: string;
  category_id: string;
  meal_slot: MealSlot;
  youtube_url: string;
  duration_minutes?: number;
  is_published: boolean;
};
