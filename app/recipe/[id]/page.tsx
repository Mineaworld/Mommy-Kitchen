"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AudioButton from "@/components/audio-button";
import FavoriteButton from "@/components/favorite-button";
import { BackIcon, PlayIcon } from "@/components/icons";
import { appCopy } from "@/lib/khmer-labels";
import type { Recipe } from "@/lib/types";
import { speakRecipe } from "@/lib/voice/speak";

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

const getDeviceType = (): "mobile" | "desktop" => {
  if (typeof window === "undefined") return "mobile";
  return window.innerWidth < 768 ? "mobile" : "desktop";
};

const RecipePage = ({ params }: RecipePageProps) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const resolved = await params;
      const response = await fetch(`/api/recipes/${resolved.id}`);
      if (!response.ok) {
        setError("រកមិនឃើញមុខម្ហូបទេ");
        return;
      }
      const json = (await response.json()) as { data: Recipe };
      setRecipe(json.data);
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: "recipe_opened",
          recipe_id: json.data.id,
          category_id: json.data.category_id,
          device_type: getDeviceType()
        })
      });
    };
    void load();
  }, [params]);

  const embedUrl = useMemo(() => {
    if (!recipe?.youtube_video_id) return "";
    return `https://www.youtube.com/embed/${recipe.youtube_video_id}`;
  }, [recipe]);

  const handleListen = useCallback(() => {
    if (!recipe) return;
    speakRecipe(recipe);
  }, [recipe]);

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-[800px] bg-surface px-4 py-8">
        <Link className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surfaceContainerHighest text-onSurface" href="/" aria-label={appCopy.backHome}>
          <BackIcon />
        </Link>
        <section className="rounded-2xl bg-surfaceContainer p-6 text-center">
          <p className="m-0 text-base font-bold text-onSurfaceVariant">{error}</p>
        </section>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="relative mx-auto min-h-screen max-w-[800px] bg-surface">
        <Link className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface/90 text-primary shadow-md backdrop-blur-md" href="/" aria-label={appCopy.backHome}>
          <BackIcon />
        </Link>
        <div className="grid gap-4 px-6 pt-24">
          <div className="h-[220px] w-full animate-pulse rounded-3xl bg-surfaceContainerHighest" />
          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-surfaceContainerHighest" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-[800px] bg-surface pb-8">
      <div className="absolute left-4 top-4 z-10">
        <Link className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/90 text-primary shadow-md backdrop-blur-md transition-transform active:scale-90" href="/" aria-label={appCopy.backHome}>
          <BackIcon />
        </Link>
      </div>
      <div className="absolute right-4 top-4 z-10">
        <AudioButton label={appCopy.listen} text={recipe.title_km} className="bg-surface/90 shadow-md backdrop-blur-md" />
      </div>

      <div className="relative z-0 w-full overflow-hidden bg-black shadow-lg sm:rounded-b-3xl">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={recipe.title_km}
            className="block aspect-video w-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-black/80 px-8 text-center text-xl font-bold text-white">
            មិនមានវីដេអូក្នុងកម្មវិធីទេ
          </div>
        )}
      </div>

      <div className="relative z-10 -mt-6 rounded-t-[24px] bg-surfaceContainer p-6">
        <div className="mb-6 grid gap-3">
          <h1 className="m-0 text-3xl font-bold leading-tight text-onSurface">{recipe.title_km}</h1>
          {recipe.duration_minutes ? (
            <p className="m-0 text-base font-semibold text-onSurfaceVariant">{recipe.duration_minutes} នាទី</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border-2 border-transparent bg-surfaceContainerHighest px-4 text-lg font-bold text-onSurface transition-transform active:scale-95 hover:border-outlineVariant"
            onClick={handleListen}
          >
            {appCopy.listen}
          </button>

          <FavoriteButton recipeId={recipe.id} />

          <a
            href={recipe.youtube_url}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-lg font-bold text-onPrimary shadow-[0_4px_12px_rgba(158,61,0,0.4)] transition-transform active:scale-95"
            onClick={() => {
              void fetch("/api/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event_name: "fallback_used",
                  recipe_id: recipe.id,
                  category_id: recipe.category_id,
                  device_type: getDeviceType()
                })
              });
            }}
          >
            <PlayIcon />
            {appCopy.openYoutube}
          </a>
        </div>
      </div>
    </main>
  );
};

export default RecipePage;
