import { randomUUID } from "crypto";
import { unstable_cache, revalidateTag } from "next/cache";
import type { Category, CategoryInput } from "@/lib/types";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

const CATEGORY_COLUMNS = "id,slug,name_km,cover_image_url,display_order,is_active";

/** Cached fetch for active categories — revalidates every 60 seconds. */
const getCachedCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const client = getSupabaseServerClient();
    if (!client) return [];

    const { data } = await client
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    return (data ?? []) as Category[];
  },
  ["categories-all"],
  { revalidate: 60, tags: ["categories-all"] }
);

/**
 * Repository class for managing Category data.
 * Uses Supabase as the primary data store with in-memory mock fallback.
 */
export class CategoryRepository {
  private static mockCategories: Category[] = [...MOCK_CATEGORIES];

  /** Fetch all active categories, ordered by display_order (cached for 60s). */
  static async getAll(): Promise<Category[]> {
    const cached = await getCachedCategories();
    return cached.length > 0
      ? cached
      : this.mockCategories
          .filter((item) => item.is_active)
          .sort((a, b) => a.display_order - b.display_order);
  }

  /** Fetch all categories (including inactive) for admin management. */
  static async getAllForAdmin(): Promise<Category[]> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return [...this.mockCategories].sort((a, b) => a.display_order - b.display_order);
    }

    const { data, error } = await admin
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .order("display_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as Category[];
  }

  /** Fetch a single category by ID for admin use. */
  static async getByIdForAdmin(id: string): Promise<Category | null> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return this.mockCategories.find((item) => item.id === id) ?? null;
    }

    const { data, error } = await admin
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Category;
  }

  /** Create a new category. */
  static async create(input: CategoryInput): Promise<Category> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      const duplicate = this.mockCategories.some((item) => item.slug === input.slug);
      if (duplicate) {
        throw new Error("Category slug already exists");
      }
      const created: Category = {
        id: randomUUID(),
        ...input
      };
      this.mockCategories = [...this.mockCategories, created];
      revalidateTag("categories-all");
      return created;
    }

    const { data, error } = await admin
      .from("categories")
      .insert(input)
      .select(CATEGORY_COLUMNS)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to create category");
    }

    revalidateTag("categories-all");
    return data as Category;
  }

  /** Update an existing category by ID. */
  static async updateById(id: string, input: CategoryInput): Promise<Category | null> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      const duplicate = this.mockCategories.some((item) => item.slug === input.slug && item.id !== id);
      if (duplicate) {
        throw new Error("Category slug already exists");
      }

      const index = this.mockCategories.findIndex((item) => item.id === id);
      if (index < 0) {
        return null;
      }
      const updated: Category = {
        ...this.mockCategories[index],
        ...input
      };
      this.mockCategories[index] = updated;
      revalidateTag("categories-all");
      return updated;
    }

    const { data, error } = await admin
      .from("categories")
      .update(input)
      .eq("id", id)
      .select(CATEGORY_COLUMNS)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidateTag("categories-all");
    return data ? (data as Category) : null;
  }

  /**
   * Delete a category if it has no recipes, otherwise deactivate it.
   * @returns "deleted", "deactivated", or null if category not found.
   */
  static async deleteOrDeactivateById(id: string): Promise<"deleted" | "deactivated" | null> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return this.deleteOrDeactivateMock(id);
    }

    const { count, error: countError } = await admin
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      throw new Error(countError.message);
    }

    if ((count ?? 0) > 0) {
      const { data, error } = await admin
        .from("categories")
        .update({ is_active: false })
        .eq("id", id)
        .select("id")
        .single();
      if (error || !data) {
        return null;
      }
      revalidateTag("categories-all");
      return "deactivated";
    }

    const { error } = await admin.from("categories").delete().eq("id", id);
    if (error) {
      throw new Error(error.message);
    }

    revalidateTag("categories-all");
    return "deleted";
  }

  /** Mock fallback for delete/deactivate when Supabase is unavailable. */
  private static deleteOrDeactivateMock(id: string): "deleted" | "deactivated" | null {
    const index = this.mockCategories.findIndex((item) => item.id === id);
    if (index < 0) {
      return null;
    }

    // Note: We can't check recipe references without importing RecipeRepository,
    // so mock mode always deletes for simplicity.
    this.mockCategories = this.mockCategories.filter((item) => item.id !== id);
    revalidateTag("categories-all");
    return "deleted";
  }
}
