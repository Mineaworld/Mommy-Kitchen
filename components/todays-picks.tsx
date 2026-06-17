import Image from "next/image";
import Link from "next/link";
import { getServerDailyPicks } from "@/lib/daily-pick";
import { mealSlotCopy } from "@/lib/khmer-labels";
import type { Category, Recipe } from "@/lib/types";

type TodaysPicksProps = {
  recipes: Recipe[];
  categories: Category[];
};

type PublicMealSlot = "lunch" | "dinner" | "any";

const SLOTS: PublicMealSlot[] = ["lunch", "dinner", "any"];

const TodaysPicks = ({
  recipes,
  categories,
}: TodaysPicksProps) => {
  const picks = getServerDailyPicks(recipes);
  const categoryNames = new Map(
    categories.map((c) => [c.id, c.name_km])
  );

  const pickEntries = SLOTS.map((slot) => ({
    slot,
    recipe: picks[slot],
  })).filter(
    (entry): entry is { slot: PublicMealSlot; recipe: Recipe } =>
      entry.recipe !== null
  );

  if (pickEntries.length === 0) return null;

  return (
    <section className="grid gap-4" aria-labelledby="todays-picks-heading">
      <h2
        id="todays-picks-heading"
        className="m-0 text-2xl font-bold text-onSurface"
      >
        មុខម្ហូបថ្ងៃនេះ
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {pickEntries.map(({ slot, recipe }) => (
          <Link
            key={slot}
            href={`/recipe/${recipe.id}`}
            className="group relative block overflow-hidden rounded-2xl border border-outlineVariant bg-surfaceContainerLowest shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="relative h-[180px] overflow-hidden bg-surfaceContainerLow sm:h-[200px]">
              <Image
                src={recipe.thumbnail_url}
                alt={recipe.title_km}
                width={400}
                height={240}
                sizes="(max-width: 640px) 100vw, 33vw"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Meal slot badge */}
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
                {mealSlotCopy[slot].label}
              </div>

              {/* Recipe title */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="m-0 line-clamp-2 text-xl font-bold leading-snug text-white sm:text-lg">
                  {recipe.title_km}
                </h3>
                {categoryNames.get(recipe.category_id) && (
                  <p className="m-0 mt-0.5 text-sm font-semibold text-white/80">
                    {categoryNames.get(recipe.category_id)}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TodaysPicks;
