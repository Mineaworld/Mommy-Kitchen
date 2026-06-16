import type { Category, Recipe } from "@/lib/types";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "soup",
    name_km: "Soup",
    cover_image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    display_order: 1,
    is_active: true,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "stir-fry",
    name_km: "Stir Fry",
    cover_image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800",
    display_order: 2,
    is_active: true,
  },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    title_km: "Sample Beef Noodle",
    thumbnail_url: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800",
    category_id: "11111111-1111-1111-1111-111111111111",
    meal_slot: "lunch",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtube_video_id: "dQw4w9WgXcQ",
    duration_minutes: 20,
    is_published: true,
  },
];
