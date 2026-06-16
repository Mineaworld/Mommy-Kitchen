"use client";

import { useState } from "react";
import { HeartIcon } from "@/components/icons";

const FAVORITES_KEY = "mom_recipe_favorites_v1";

const readFavorites = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const writeFavorites = (ids: string[]) => {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("recipe-favorites-updated", { detail: ids }));
};

export const getFavoriteRecipeIds = readFavorites;

type FavoriteButtonProps = {
  recipeId: string;
};

const FavoriteButton = ({ recipeId }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(() => readFavorites().includes(recipeId));

  const toggleFavorite = () => {
    const favorites = readFavorites();
    const next = favorites.includes(recipeId)
      ? favorites.filter((id) => id !== recipeId)
      : [recipeId, ...favorites];
    writeFavorites(next);
    setIsFavorite(next.includes(recipeId));
  };

  return (
    <button
      type="button"
      className={`flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-lg font-bold transition-transform active:scale-95 ${
        isFavorite
          ? "bg-tertiary text-onTertiary shadow-sm"
          : "border-2 border-outlineVariant bg-surfaceContainerHighest text-onSurface"
      }`}
      aria-pressed={isFavorite}
      onClick={toggleFavorite}
    >
      <HeartIcon className="h-6 w-6" />
      {isFavorite ? "ចូលចិត្ត" : "រក្សាទុក"}
    </button>
  );
};

export default FavoriteButton;
