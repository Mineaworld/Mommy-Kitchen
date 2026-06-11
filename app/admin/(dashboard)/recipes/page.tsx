"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminMealSlotLabels } from "@/lib/khmer-labels";
import type { Recipe } from "@/lib/types";

const AdminRecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("admin_access_token");
        if (!token) {
          setError("Please log in first.");
          setLoading(false);
          return;
        }
        const response = await fetch("/api/admin/recipes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          setError("Failed to load recipes.");
          return;
        }
        const json = (await response.json()) as { data: Recipe[] };
        setRecipes(json.data);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleDelete = async (recipe: Recipe) => {
    const confirmed = confirm(`Delete "${recipe.title_km}"? This cannot be undone.`);
    if (!confirmed) return;

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setError("Please log in first.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/recipes/${recipe.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        setError("Failed to delete recipe.");
        return;
      }
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    } catch {
      setError("Network error during delete.");
    }
  };

  return (
    <main className="max-w-[800px] w-full mx-auto min-h-screen pb-[100px]">
      <div className="px-4 py-4 grid gap-4">
        <section className="bg-surfaceContainer px-4 py-3 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-onSurface m-0">Recipes</h2>
            <span className="bg-secondaryContainer text-onSecondaryContainer font-bold text-sm px-3 py-1 rounded-full">{recipes.length} Total</span>
          </div>
          <Link className="inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-bold text-onPrimary bg-primary hover:bg-primary/90 transition-colors shadow-sm" href="/admin/recipes/new">
            + New Recipe
          </Link>
        </section>

        {error ? (
          <section className="bg-errorContainer p-4 rounded-2xl shadow-sm">
            <p className="text-error font-bold m-0">{error}</p>
          </section>
        ) : null}

        {loading ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="bg-surfaceContainerLow rounded-2xl p-4 shadow-sm" key={i}>
                <div className="w-full h-[160px] bg-surfaceContainerHighest rounded-xl mb-3 animate-pulse" />
                <div className="h-6 w-3/4 bg-surfaceContainerHighest rounded-md animate-pulse" />
              </div>
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <div className="bg-surfaceContainerLowest rounded-2xl overflow-hidden shadow-sm flex flex-col border border-outlineVariant/30" key={recipe.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={recipe.thumbnail_url}
                  alt={recipe.title_km}
                  className="h-[160px] w-full object-cover"
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
                      onClick={() => void handleDelete(recipe)}
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
    </main>
  );
};

export default AdminRecipesPage;
