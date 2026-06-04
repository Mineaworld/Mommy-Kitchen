"use client";

import { useEffect, useMemo, useState } from "react";
import { RecipeCard } from "@/components/public-cards";
import { appCopy } from "@/lib/khmer-labels";
import type { Category, Recipe } from "@/lib/types";

const FAVORITES_KEY = "mom_recipe_favorites_v1";

const readFavoriteIds = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

type FavoritesSectionProps = {
  recipes: Recipe[];
  categories: Category[];
};

const FavoritesSection = ({ recipes, categories }: FavoritesSectionProps) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(readFavoriteIds());

    const handleUpdate = () => setFavoriteIds(readFavoriteIds());
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("recipe-favorites-updated", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("recipe-favorites-updated", handleUpdate);
    };
  }, []);

  const categoryNames = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name_km]));
  }, [categories]);

  const favoriteRecipes = favoriteIds
    .map((id) => recipes.find((recipe) => recipe.id === id))
    .filter((recipe): recipe is Recipe => Boolean(recipe));

  if (favoriteRecipes.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-4" aria-labelledby="favorites-heading">
      <h2 id="favorites-heading" className="m-0 text-2xl font-bold text-onSurface">
        {appCopy.favorites}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {favoriteRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            categoryName={categoryNames.get(recipe.category_id)}
          />
        ))}
      </div>
    </section>
  );
};

export default FavoritesSection;
