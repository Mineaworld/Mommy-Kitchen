"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { adminMealSlotLabels } from "@/lib/khmer-labels";
import { MEAL_SLOT_VALUES, type Recipe, type Category, type MealSlot } from "@/lib/types";
import { getAdminToken } from "@/lib/admin-auth";
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

const AdminRecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mealSlotFilter, setMealSlotFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAdminToken();
        if (!token) {
          router.push("/admin/login");
          return;
        }
        const [recipesRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/recipes", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/admin/categories", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!recipesRes.ok) {
          setError("Failed to load recipes.");
          return;
        }

        const recipesJson = (await recipesRes.json()) as { data: Recipe[] };
        setRecipes(recipesJson.data);

        if (categoriesRes.ok) {
          const categoriesJson = (await categoriesRes.json()) as { data: Category[] };
          setCategories(categoriesJson.data);
        } else {
          setCategories([]);
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  const executeDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const token = getAdminToken();
    if (!token) {
      setIsDeleting(false);
      setDeleteTarget(null);
      router.push("/admin/login");
      return;
    }

    try {
      const response = await fetch(`/api/admin/recipes/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        setError("Failed to delete recipe.");
        return;
      }
      setRecipes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } catch {
      setError("Network error during delete.");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return recipes.filter((recipe) => {
      if (query && !recipe.title_km.toLowerCase().includes(query)) return false;
      if (categoryFilter !== "all" && recipe.category_id !== categoryFilter) return false;
      if (mealSlotFilter !== "all" && (recipe.meal_slot ?? "any") !== mealSlotFilter) return false;
      return true;
    });
  }, [recipes, searchQuery, categoryFilter, mealSlotFilter]);

  return (
    <main className="w-full mx-auto min-h-screen pb-[100px]">
      <div className="px-4 lg:px-6 py-4 lg:py-6 grid gap-4">
        <section className="bg-surfaceContainer px-4 py-3 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-onSurface m-0">Recipes</h2>
            <span className="bg-secondaryContainer text-onSecondaryContainer font-bold text-sm px-3 py-1 rounded-full">{filteredRecipes.length} Total</span>
          </div>
          <Link className="inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-bold text-onPrimary bg-primary hover:bg-primary/90 transition-colors shadow-sm" href="/admin/recipes/new">
            + New Recipe
          </Link>
        </section>

        {/* Filter Bar */}
        <section className="flex flex-wrap gap-4 items-center bg-surfaceContainerLowest p-4 rounded-2xl border border-outlineVariant/30 shadow-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-onSurfaceVariant" />
            <input
              type="text"
              placeholder="Search recipes by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-surfaceContainerLow border border-outlineVariant/50 text-onSurface text-sm font-medium placeholder:text-onSurfaceVariant/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-bold text-onSurfaceVariant min-w-[70px]">Category:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 rounded-xl bg-surfaceContainerLowest border-outlineVariant/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name_km}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-bold text-onSurfaceVariant min-w-[70px]">Meal Slot:</span>
              <Select value={mealSlotFilter} onValueChange={setMealSlotFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 rounded-xl bg-surfaceContainerLowest border-outlineVariant/50">
                  <SelectValue placeholder="All Meals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meals</SelectItem>
                  {MEAL_SLOT_VALUES.map((slot) => (
                    <SelectItem key={slot} value={slot}>{adminMealSlotLabels[slot]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {error ? (
          <section className="bg-errorContainer p-4 rounded-2xl shadow-sm" role="alert">
            <p className="text-error font-bold m-0">{error}</p>
          </section>
        ) : null}

        {loading ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="bg-surfaceContainerLow rounded-2xl p-4 shadow-sm" key={i}>
                <div className="w-full aspect-square bg-surfaceContainerHighest rounded-xl mb-3 animate-pulse" />
                <div className="h-6 w-3/4 bg-surfaceContainerHighest rounded-md animate-pulse" />
              </div>
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredRecipes.map((recipe) => (
              <div className="bg-surfaceContainerLowest rounded-2xl overflow-hidden shadow-sm flex flex-col border border-outlineVariant/30" key={recipe.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={recipe.thumbnail_url}
                  alt={recipe.title_km}
                  className="aspect-square w-full object-cover bg-surfaceContainerHighest"
                />
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="text-xl font-bold text-onSurface mb-2">{recipe.title_km}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold bg-surfaceContainer text-onSurfaceVariant px-2 py-1 rounded-md">
                        {adminMealSlotLabels[recipe.meal_slot ?? "any"]}
                      </span>
                      {!recipe.is_published && (
                        <span className="text-xs font-bold bg-errorContainer text-error px-2 py-1 rounded-md">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-auto pt-4 border-t border-outlineVariant/20">
                    <Link className="flex-1 text-center font-bold text-primary bg-surfaceContainerHighest hover:bg-surfaceContainerHigh px-4 py-2.5 rounded-xl transition-colors border-none" href={`/admin/recipes/${recipe.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="flex-1 font-bold text-error bg-errorContainer hover:bg-errorContainer/80 px-4 py-2.5 rounded-xl transition-colors"
                      onClick={() => setDeleteTarget(recipe)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You are about to permanently delete{" "}
              <strong className="text-onSurface">&ldquo;{deleteTarget?.title_km}&rdquo;</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void executeDelete();
              }}
              disabled={isDeleting}
              className="bg-error text-onError hover:bg-error/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default AdminRecipesPage;
