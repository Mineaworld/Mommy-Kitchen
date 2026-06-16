"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { List, Clock, Moon, Sun, Sunrise, Utensils } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SpeakerIcon } from "@/components/icons";
import { speakRecipe } from "@/lib/voice/speak";
import type { Category, MealSlot, Recipe } from "@/lib/types";

type TabValue = "all" | MealSlot;

interface Tab {
  label: string;
  value: TabValue;
  icon: ReactNode;
}

const TABS: Tab[] = [
  { label: "ទាំងអស់", value: "all", icon: <List className="w-4 h-4" /> },
  { label: "អាហារពេលព្រឹក", value: "breakfast", icon: <Sunrise className="w-4 h-4" /> },
  { label: "អាហារថ្ងៃត្រង់", value: "lunch", icon: <Sun className="w-4 h-4" /> },
  { label: "អាហារពេលល្ងាច", value: "dinner", icon: <Moon className="w-4 h-4" /> },
];

/** Deterministic PRNG seeded by an integer. */
const seededRandom = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
};

/** Shuffle array items using a date-based seed — same date = same order. */
const dailyShuffle = <T,>(items: T[]): T[] => {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const rng = seededRandom(seed);
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const filterRecipes = (recipes: Recipe[], tab: TabValue): Recipe[] => {
  if (tab === "all") return recipes;
  return recipes.filter(
    (r) => r.meal_slot === tab || r.meal_slot === "any"
  );
};

const MenuCardSkeleton = () => (
  <div className="rounded-2xl bg-surfaceContainerLowest border border-outlineVariant/20 shadow-sm overflow-hidden">
    <Skeleton className="w-full h-[240px] rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-7 w-3/4 rounded-md" />
      <Skeleton className="h-5 w-1/3 rounded-md" />
    </div>
  </div>
);

const EmptyState = ({ totally }: { totally: boolean }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-surfaceContainerLowest rounded-2xl border border-outlineVariant/20 border-dashed mt-4">
    <div className="w-20 h-20 bg-surfaceContainer flex items-center justify-center rounded-full mb-5">
      <Utensils className="w-10 h-10 text-primary/60" />
    </div>
    <p className="text-xl font-bold text-onSurface mb-2">
      {totally
        ? "មិនទាន់មានមុខម្ហូបទេ"
        : "គ្មានមុខម្ហូបសម្រាប់ជម្រើសនេះទេ"}
    </p>
    <p className="text-onSurfaceVariant text-sm max-w-[250px]">
      {totally 
        ? "សូមរង់ចាំការបន្ថែមមុខម្ហូបថ្មីៗឆាប់ៗនេះ។"
        : "សូមសាកល្បងជ្រើសរើសប្រភេទអាហារផ្សេងទៀត។"}
    </p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="bg-errorContainer/50 px-6 py-4 rounded-2xl border border-error/20">
      <p className="text-lg font-bold text-error">{message}</p>
    </div>
  </div>
);

type MenuCardProps = {
  recipe: Recipe;
  categoryName?: string;
};

const MenuCard = ({ recipe, categoryName }: MenuCardProps) => (
  <article className="group rounded-2xl bg-surfaceContainerLowest shadow-sm hover:shadow-md border border-outlineVariant/20 overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]">
    <Link
      href={`/recipe/${recipe.id}`}
      className="block"
    >
      <div className="relative w-full h-[240px] bg-surfaceContainerLow overflow-hidden">
        <Image
          src={recipe.thumbnail_url}
          alt={recipe.title_km}
          width={720}
          height={460}
          sizes="(max-width: 800px) 100vw, 800px"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {categoryName && (
          <div className="absolute top-4 left-4 bg-surface/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm border border-outlineVariant/10">
            {categoryName}
          </div>
        )}
      </div>

      <div className="p-5 pb-0">
        <h3 className="text-[22px] font-bold text-onSurface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {recipe.title_km}
        </h3>
      </div>
    </Link>

    <div className="px-5 pb-5 pt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-medium text-onSurfaceVariant">
          {recipe.duration_minutes !== null ? (
            <span className="flex items-center gap-1.5 bg-surfaceContainerLow px-2.5 py-1.5 rounded-md border border-outlineVariant/20">
              <Clock className="w-4 h-4 text-primary" />
              {recipe.duration_minutes} នាទី
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => speakRecipe(recipe)}
          className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-surfaceContainer text-primary hover:bg-primary hover:text-onPrimary shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label={`ស្តាប់ ${recipe.title_km}`}
        >
          <SpeakerIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </article>
);

const MenuPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categoryNames, setCategoryNames] = useState<Map<string, string>>(
    new Map()
  );
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [recipesRes, categoriesRes] = await Promise.all([
          fetch("/api/recipes"),
          fetch("/api/categories"),
        ]);

        if (!recipesRes.ok || !categoriesRes.ok) {
          setError("បញ្ហាបណ្តាញ");
          return;
        }

        const recipesJson = (await recipesRes.json()) as { data: Recipe[] };
        const categoriesJson = (await categoriesRes.json()) as {
          data: Category[];
        };

        setRecipes(recipesJson.data);
        setCategoryNames(
          new Map(categoriesJson.data.map((c) => [c.id, c.name_km]))
        );
      } catch {
        setError("បញ្ហាបណ្តាញ");
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => {});
  }, []);

  const filteredRecipes = useMemo(
    () => filterRecipes(dailyShuffle(recipes), activeTab),
    [recipes, activeTab]
  );

  const totallyEmpty = !loading && recipes.length === 0;

  return (
    <main className="mx-auto min-h-screen max-w-[800px] bg-surface pb-[100px]">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-surface/80 px-5 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-primary m-0 tracking-tight">មីនុយ</h1>
      </header>

      <div className="sticky top-16 z-10 bg-surface/80 backdrop-blur-xl px-5 py-3 border-b border-outlineVariant/10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 ${
                  isActive
                    ? "bg-primary text-onPrimary shadow-md border-2 border-primary"
                    : "border-2 border-outlineVariant/30 bg-surfaceContainerLowest text-onSurfaceVariant hover:bg-surfaceContainerLow hover:border-outlineVariant/50 hover:text-onSurface"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-6">
        {loading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <MenuCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : totallyEmpty || filteredRecipes.length === 0 ? (
          <EmptyState totally={totallyEmpty} />
        ) : (
          <div className="flex flex-col gap-6">
            {filteredRecipes.map((recipe) => (
              <MenuCard
                key={recipe.id}
                recipe={recipe}
                categoryName={categoryNames.get(recipe.category_id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MenuPage;
