"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MEAL_SLOT_VALUES, type Category, type MealSlot, type Recipe, type RecipeInput } from "@/lib/types";
import { adminMealSlotLabels } from "@/lib/khmer-labels";
import { parseYoutubeVideoId } from "@/lib/youtube/parse";
import Link from "next/link";

type RecipeFormProps = {
  mode: "create" | "edit";
  recipeId?: string;
};

const defaultPayload: RecipeInput = {
  title_km: "",
  thumbnail_url: "",
  category_id: "",
  meal_slot: "any",
  youtube_url: "",
  duration_minutes: 15,
  is_published: true
};

export const RecipeForm = ({ mode, recipeId }: RecipeFormProps) => {
  const router = useRouter();
  const [payload, setPayload] = useState<RecipeInput>(defaultPayload);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem("admin_access_token");
        const response = await fetch(token ? "/api/admin/categories" : "/api/categories", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!response.ok) return;
        const json = (await response.json()) as { data: Category[] };
        setCategories(json.data);
      } catch {
        /* categories will remain empty, fallback to text input */
      }
    };
    void loadCategories();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (mode !== "edit" || !recipeId) {
        return;
      }
      const token = localStorage.getItem("admin_access_token");
      if (!token) {
        setStatus("Please log in first.");
        return;
      }
      const response = await fetch("/api/admin/recipes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        setStatus("Recipe not found");
        return;
      }
      const json = (await response.json()) as { data: Recipe[] };
      const recipe = json.data.find((item) => item.id === recipeId);
      if (!recipe) {
        setStatus("Recipe not found");
        return;
      }
      setPayload({
        title_km: recipe.title_km,
        thumbnail_url: recipe.thumbnail_url,
        category_id: recipe.category_id,
        meal_slot: recipe.meal_slot ?? "any",
        youtube_url: recipe.youtube_url,
        duration_minutes: recipe.duration_minutes ?? 15,
        is_published: recipe.is_published
      });
    };

    void load();
  }, [mode, recipeId]);

  const videoId = useMemo(() => parseYoutubeVideoId(payload.youtube_url), [payload.youtube_url]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Saving...");

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setStatus("Please log in first.");
      return;
    }

    const endpoint = mode === "create" ? "/api/admin/recipes" : `/api/admin/recipes/${recipeId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const json = (await response.json()) as { error?: { message?: string } };
      setStatus(json.error?.message ?? "Unable to save.");
      return;
    }

    setStatus("Saved.");
    router.push("/admin/recipes");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!recipeId) return;
    const confirmed = confirm("Delete this recipe? This cannot be undone.");
    if (!confirmed) return;

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setStatus("Please log in first.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        setStatus("Failed to delete recipe.");
        return;
      }
      router.push("/admin/recipes");
      router.refresh();
    } catch {
      setStatus("Network error during delete.");
    }
  };

  return (
    <div className="max-w-[800px] mx-auto min-h-screen bg-surface pb-[100px]">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-16 bg-surface/90 backdrop-blur-md">
        <h1 className="text-xl font-bold text-onSurface m-0">{mode === "create" ? "New Recipe" : "Edit Recipe"}</h1>
        <Link className="inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-semibold text-primary bg-surfaceContainer hover:bg-surfaceContainerHigh transition-colors" href="/admin/recipes">
          Back
        </Link>
      </header>
      
      <form className="px-4 py-4" onSubmit={onSubmit}>
        <div className="bg-surfaceContainerLowest p-6 rounded-2xl shadow-sm border border-outlineVariant/30 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="recipe-title" className="admin-label">Recipe title</label>
            <input
              id="recipe-title"
              name="title_km"
              placeholder="Khmer title"
              autoComplete="off"
              value={payload.title_km}
              onChange={(event) => setPayload({ ...payload, title_km: event.target.value })}
              required
              className="admin-input"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="recipe-thumbnail" className="admin-label">Thumbnail URL</label>
            <input
              id="recipe-thumbnail"
              name="thumbnail_url"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://example.com/image.jpg"
              value={payload.thumbnail_url}
              onChange={(event) => setPayload({ ...payload, thumbnail_url: event.target.value })}
              required
              className="admin-input"
            />
            {payload.thumbnail_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={payload.thumbnail_url}
                alt="Thumbnail preview"
                className="w-full h-[200px] object-cover rounded-xl mt-2 border border-outlineVariant/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="recipe-category-id" className="admin-label">Category</label>
            {categories.length > 0 ? (
              <select
                id="recipe-category-id"
                name="category_id"
                value={payload.category_id}
                onChange={(event) => setPayload({ ...payload, category_id: event.target.value })}
                required
                className="admin-select"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_km}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="recipe-category-id"
                name="category_id"
                autoComplete="off"
                spellCheck={false}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={payload.category_id}
                onChange={(event) => setPayload({ ...payload, category_id: event.target.value })}
                required
                className="admin-input"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="recipe-meal-slot" className="admin-label">Meal</label>
            <select
              id="recipe-meal-slot"
              name="meal_slot"
              value={payload.meal_slot}
              onChange={(event) => setPayload({ ...payload, meal_slot: event.target.value as MealSlot })}
              required
              className="admin-select"
            >
              {MEAL_SLOT_VALUES.map((mealSlot) => (
                <option key={mealSlot} value={mealSlot}>
                  {adminMealSlotLabels[mealSlot]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="recipe-youtube" className="admin-label">YouTube URL</label>
            <input
              id="recipe-youtube"
              name="youtube_url"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://youtube.com/watch?v=video_id"
              value={payload.youtube_url}
              onChange={(event) => setPayload({ ...payload, youtube_url: event.target.value })}
              required
              className="admin-input"
            />
            <p className="text-onSurfaceVariant text-xs font-medium ml-1 mt-1">Preview ID: {videoId ?? "invalid URL"}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="recipe-duration" className="admin-label">Duration (minutes)</label>
            <input
              id="recipe-duration"
              name="duration_minutes"
              type="number"
              inputMode="numeric"
              min={1}
              value={payload.duration_minutes ?? 1}
              onChange={(event) => setPayload({ ...payload, duration_minutes: Number(event.target.value) })}
              className="admin-input"
            />
          </div>
          <label className="flex items-center gap-3 mt-2 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={payload.is_published}
                onChange={(event) => setPayload({ ...payload, is_published: event.target.checked })}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${payload.is_published ? 'bg-primary' : 'bg-surfaceContainerHighest border-2 border-outlineVariant'}`}></div>
              <div className={`absolute left-1.5 top-1.5 bg-white w-5 h-5 rounded-full transition-transform ${payload.is_published ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="font-bold text-onSurface">Published</span>
          </label>
          
          <div className="flex flex-col gap-3 mt-4">
            <button type="submit" className="w-full bg-primary text-onPrimary font-bold rounded-full min-h-[56px] text-lg px-4 flex items-center justify-center transition-transform active:scale-95 shadow-sm">
              {mode === "create" ? "Create Recipe" : "Save Changes"}
            </button>
            {mode === "edit" ? (
              <button type="button" className="w-full bg-errorContainer text-error font-bold rounded-full min-h-[56px] text-lg px-4 flex items-center justify-center transition-transform active:scale-95 shadow-sm" onClick={() => void handleDelete()}>
                Delete Recipe
              </button>
            ) : null}
          </div>
          
          {status && (
            <p className="text-onSurfaceVariant text-sm font-semibold text-center mt-2" aria-live="polite">
              {status}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
