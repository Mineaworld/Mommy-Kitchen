"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MEAL_SLOT_VALUES, type Category, type MealSlot, type Recipe, type RecipeInput } from "@/lib/types";
import { adminMealSlotLabels } from "@/lib/khmer-labels";
import { parseYoutubeVideoId } from "@/lib/youtube/parse";
import { getAdminToken } from "@/lib/admin-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = getAdminToken();
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
    loadCategories().catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      if (mode !== "edit" || !recipeId) {
        return;
      }
      const token = getAdminToken();
      if (!token) {
        router.push("/admin/login");
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

    load().catch(() => {});
  }, [mode, recipeId, router]);

  const videoId = useMemo(() => parseYoutubeVideoId(payload.youtube_url), [payload.youtube_url]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Saving...");

    const token = getAdminToken();
    if (!token) {
      setStatus("Please log in first.");
      setIsSubmitting(false);
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
      setIsSubmitting(false);
      return;
    }

    setStatus("Saved.");
    router.push("/admin/recipes");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!recipeId) return;

    setIsDeleting(true);
    const token = getAdminToken();
    if (!token) {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      router.push("/admin/login");
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
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen bg-surface pb-[100px]">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-6 h-16 bg-white/90 backdrop-blur-md">
        <Link className="inline-flex items-center justify-center w-10 h-10 rounded-full text-onSurfaceVariant hover:text-onSurface hover:bg-surfaceContainerHigh transition-colors" href="/admin/recipes" aria-label="Back">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-onSurface m-0">{mode === "create" ? "New Recipe" : "Edit Recipe"}</h1>
      </header>
      
      <form className="px-6 py-6" onSubmit={onSubmit}>
        <div className="bg-surfaceContainerLowest p-6 lg:p-8 rounded-2xl shadow-sm border border-outlineVariant flex flex-col gap-8">
          {/* Title — full width */}
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

          {/* Thumbnail — full width with larger preview on desktop */}
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
                className="w-full lg:max-w-md h-[200px] lg:h-[240px] object-cover rounded-xl mt-2 border border-outlineVariant"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
          </div>

          {/* 2-column grid for metadata fields on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="recipe-category-id" className="admin-label">Category</label>
              {categories.length > 0 ? (
                <Select
                  value={payload.category_id}
                  onValueChange={(val) => setPayload({ ...payload, category_id: val })}
                  required
                >
                  <SelectTrigger className="w-full h-[56px] rounded-xl px-4 text-base border-outlineVariant bg-surfaceContainerHighest hover:brightness-95 focus-visible:ring-primary">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-base py-3">
                        {cat.name_km}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Select
                value={payload.meal_slot}
                onValueChange={(val) => setPayload({ ...payload, meal_slot: val as MealSlot })}
                required
              >
                <SelectTrigger className="w-full h-[56px] rounded-xl px-4 text-base border-outlineVariant bg-surfaceContainerHighest hover:brightness-95 focus-visible:ring-primary">
                  <SelectValue placeholder="Select a meal slot..." />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_SLOT_VALUES.map((mealSlot) => (
                    <SelectItem key={mealSlot} value={mealSlot} className="text-base py-3">
                      {adminMealSlotLabels[mealSlot]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
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
          
          {/* Action buttons — side by side on desktop */}
          <div className="flex flex-col lg:flex-row gap-3 mt-2">
            <button type="submit" disabled={isSubmitting} className="w-full lg:w-auto lg:min-w-[200px] bg-primary text-onPrimary font-bold rounded-full min-h-[48px] lg:min-h-[44px] text-base px-6 flex items-center justify-center transition-transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Recipe" : "Save Changes"}
            </button>
            {mode === "edit" ? (
              <button type="button" className="w-full lg:w-auto lg:min-w-[200px] bg-errorContainer text-error font-bold rounded-full min-h-[48px] lg:min-h-[44px] text-base px-6 flex items-center justify-center transition-transform active:scale-95 shadow-sm" onClick={() => setShowDeleteDialog(true)}>
                Delete Recipe
              </button>
            ) : null}
          </div>
          
          {status && (
            <p className="text-onSurfaceVariant text-sm font-semibold text-center lg:text-left mt-2" aria-live="polite" role="alert">
              {status}
            </p>
          )}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && !isDeleting && setShowDeleteDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You are about to permanently delete this recipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete().catch(() => {});
              }}
              disabled={isDeleting}
              className="bg-error text-onError hover:bg-error/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
