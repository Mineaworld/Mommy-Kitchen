import { randomUUID } from "crypto";
import { unstable_cache, revalidateTag } from "next/cache";
import type { MealSlot, Recipe, RecipeInput } from "@/lib/types";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { MOCK_RECIPES } from "@/lib/mock-data";
import { parseYoutubeVideoId } from "@/lib/youtube/parse";
import { CategoryRepository } from "@/lib/repositories/CategoryRepository";

const RECIPE_COLUMNS =
  "id,title_km,thumbnail_url,category_id,meal_slot,youtube_url,youtube_video_id,duration_minutes,is_published";

/**
 * Normalize a raw recipe row, defaulting meal_slot to "any" when missing.
 */
const normalizeRecipe = (row: Partial<Recipe>): Recipe => ({
  ...row,
  meal_slot: row.meal_slot ?? "any"
} as Recipe);

/** Cached fetch for published recipes — revalidates every 60 seconds. */
const getCachedRecipes = unstable_cache(
  async (): Promise<Recipe[]> => {
    const client = getSupabaseServerClient();
    if (!client) return [];

    const { data } = await client
      .from("recipes")
      .select(RECIPE_COLUMNS)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    return ((data ?? []) as Partial<Recipe>[]).map(normalizeRecipe);
  },
  ["recipes-all"],
  { revalidate: 60, tags: ["recipes-all"] }
);

/**
 * Repository class for managing Recipe data.
 * Uses Supabase as the primary data store with in-memory mock fallback.
 */
export class RecipeRepository {
  private static mockRecipes: Recipe[] = [...MOCK_RECIPES];

  /** Fetch all published recipes (cached for 60s). */
  static async getAll(): Promise<Recipe[]> {
    const cached = await getCachedRecipes();
    return cached.length > 0
      ? cached
      : this.mockRecipes.filter((item) => item.is_published);
  }

  /** Fetch all recipes (including unpublished) for admin management. */
  static async getAllForAdmin(): Promise<Recipe[]> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return this.mockRecipes;
    }

    const { data, error } = await admin
      .from("recipes")
      .select(RECIPE_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as Partial<Recipe>[]).map(normalizeRecipe);
  }

  /** Fetch published recipes filtered by category ID. */
  static async getByCategory(categoryId: string): Promise<Recipe[]> {
    const items = await this.getAll();
    return items.filter((item) => item.category_id === categoryId);
  }

  /** Fetch published recipes filtered by meal slot. */
  static async getByMealSlot(mealSlot: MealSlot): Promise<Recipe[]> {
    const items = await this.getAll();
    if (mealSlot === "any") {
      return items;
    }

    return items.filter((item) => item.meal_slot === mealSlot || item.meal_slot === "any");
  }

  /** Fetch published recipes by the parent category's slug. */
  static async getByCategorySlug(slug: string): Promise<Recipe[]> {
    const categories = await CategoryRepository.getAll();
    const category = categories.find((item) => item.slug === slug);
    if (!category) {
      return [];
    }

    return this.getByCategory(category.id);
  }

  /** Fetch a single published recipe by ID. */
  static async getById(id: string): Promise<Recipe | null> {
    const client = getSupabaseServerClient();
    if (!client) {
      return this.mockRecipes.find((item) => item.id === id && item.is_published) ?? null;
    }

    const { data } = await client
      .from("recipes")
      .select(RECIPE_COLUMNS)
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (data) {
      return normalizeRecipe(data as Partial<Recipe>);
    }

    return this.mockRecipes.find((item) => item.id === id && item.is_published) ?? null;
  }

  /** Create a new recipe. */
  static async create(input: RecipeInput): Promise<Recipe> {
    const admin = getSupabaseAdminClient();
    const payload = {
      ...input,
      youtube_video_id: parseYoutubeVideoId(input.youtube_url)
    };

    if (!admin) {
      const created: Recipe = {
        id: randomUUID(),
        ...payload,
        duration_minutes: input.duration_minutes ?? null
      };
      this.mockRecipes = [created, ...this.mockRecipes];
      revalidateTag("recipes-all");
      return created;
    }

    const { data, error } = await admin
      .from("recipes")
      .insert(payload)
      .select(RECIPE_COLUMNS)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to create recipe");
    }

    revalidateTag("recipes-all");
    return data as Recipe;
  }

  /** Update an existing recipe by ID. */
  static async updateById(id: string, input: RecipeInput): Promise<Recipe | null> {
    const admin = getSupabaseAdminClient();
    const payload = {
      ...input,
      youtube_video_id: parseYoutubeVideoId(input.youtube_url)
    };

    if (!admin) {
      const index = this.mockRecipes.findIndex((item) => item.id === id);
      if (index < 0) {
        return null;
      }
      const updated: Recipe = {
        ...this.mockRecipes[index],
        ...payload,
        duration_minutes: input.duration_minutes ?? null
      };
      this.mockRecipes[index] = updated;
      revalidateTag("recipes-all");
      return updated;
    }

    const { data } = await admin
      .from("recipes")
      .update(payload)
      .eq("id", id)
      .select(RECIPE_COLUMNS)
      .single();

    revalidateTag("recipes-all");
    return data ? normalizeRecipe(data as Partial<Recipe>) : null;
  }

  /** Delete a recipe by ID. */
  static async deleteById(id: string): Promise<boolean> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      const before = this.mockRecipes.length;
      this.mockRecipes = this.mockRecipes.filter((item) => item.id !== id);
      revalidateTag("recipes-all");
      return this.mockRecipes.length < before;
    }

    const { error } = await admin.from("recipes").delete().eq("id", id);
    revalidateTag("recipes-all");
    return !error;
  }
}
