"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DinnerIcon, LunchIcon, PlayIcon, SparkIcon } from "@/components/icons";
import { mealSlotCopy } from "@/lib/khmer-labels";
import type { Category, MealSlot, Recipe } from "@/lib/types";
import { speakKhmerLabel, speakRecipe } from "@/lib/voice/speak";

type MealPickerProps = {
  categories: Category[];
  recipes: Recipe[];
};

type PublicMealSlot = Exclude<MealSlot, "breakfast">;

const publicMealSlots: PublicMealSlot[] = ["lunch", "dinner", "any"];

const mealSlotIcons: Record<PublicMealSlot, React.ReactNode> = {
  lunch: <LunchIcon />,
  dinner: <DinnerIcon />,
  any: <SparkIcon />
};

const getRandomRecipe = (items: Recipe[]) => {
  if (items.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

const MealPicker = ({ categories, recipes }: MealPickerProps) => {
  const [selectedMealSlot, setSelectedMealSlot] = useState<PublicMealSlot>("lunch");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [announceText, setAnnounceText] = useState(mealSlotCopy.lunch.helper);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinTimeoutRef = useRef<number | null>(null);

  const categoryNames = useMemo(() => {
    return categories.reduce<Record<string, string>>((accumulator, category) => {
      accumulator[category.id] = category.name_km;
      return accumulator;
    }, {});
  }, [categories]);

  const candidateRecipes = useMemo(() => {
    if (selectedMealSlot === "any") {
      return recipes;
    }
    return recipes.filter(
      (recipe) => recipe.meal_slot === selectedMealSlot || recipe.meal_slot === "any"
    );
  }, [recipes, selectedMealSlot]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const selectMealSlot = (mealSlot: PublicMealSlot) => {
    setSelectedMealSlot(mealSlot);
    setSelectedRecipe(null);
    setAnnounceText(mealSlotCopy[mealSlot].helper);
    speakKhmerLabel(mealSlotCopy[mealSlot].speech);
  };

  const revealRecipe = () => {
    const recipe = getRandomRecipe(candidateRecipes);
    setSelectedRecipe(recipe);

    if (!recipe) {
      const text = "មិនទាន់មានមុខម្ហូបសម្រាប់ជម្រើសនេះទេ";
      setAnnounceText(text);
      speakKhmerLabel(text);
      return;
    }

    setAnnounceText(recipe.title_km);
    speakRecipe(recipe);
  };

  const handleSpin = () => {
    if (isSpinning || candidateRecipes.length === 0) {
      revealRecipe();
      return;
    }

    setIsSpinning(true);
    setAnnounceText("កំពុងបង្វិល");

    const cycles = Math.min(Math.max(candidateRecipes.length * 2, 6), 14);

    const step = (index: number) => {
      const recipe = candidateRecipes[index % candidateRecipes.length];
      setSelectedRecipe(recipe);

      if (index === cycles) {
        setIsSpinning(false);
        setAnnounceText(recipe.title_km);
        speakRecipe(recipe);
        spinTimeoutRef.current = null;
        return;
      }

      const delay = 90 + index * 25;
      spinTimeoutRef.current = window.setTimeout(() => step(index + 1), delay);
    };

    step(0);
  };

  return (
    <section className="grid gap-4 rounded-3xl border border-outlineVariant/20 bg-surfaceContainer p-5 shadow-sm" aria-labelledby="meal-picker-heading">
      <div className="grid gap-1 text-center">
        <h2 id="meal-picker-heading" className="m-0 text-2xl font-bold text-onSurface">
          ជ្រើសម្ហូបថ្ងៃនេះ
        </h2>
        <p className="m-0 text-base font-semibold text-onSurfaceVariant">{mealSlotCopy[selectedMealSlot].helper}</p>
      </div>

      <div className="grid grid-cols-3 gap-3" role="tablist" aria-label="Meal choices">
        {publicMealSlots.map((mealSlot) => {
          const copy = mealSlotCopy[mealSlot];
          const isActive = selectedMealSlot === mealSlot;
          return (
            <button
              key={mealSlot}
              type="button"
              className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl px-2 text-base font-bold transition-colors ${
                isActive
                  ? "border-2 border-transparent bg-secondaryContainer text-onSecondaryContainer shadow-sm"
                  : "border-2 border-outlineVariant/30 bg-surfaceContainerLowest text-onSurfaceVariant"
              }`}
              aria-pressed={isActive}
              onClick={() => selectMealSlot(mealSlot)}
            >
              {mealSlotIcons[mealSlot]}
              <span>{copy.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="min-h-[64px] rounded-full bg-primary px-5 text-xl font-bold text-onPrimary shadow-[0_4px_12px_rgba(158,61,0,0.3)] transition-transform duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning ? "កំពុងបង្វិល" : mealSlotCopy[selectedMealSlot].spinLabel}
      </button>

      <p className="m-0 text-center text-base font-semibold text-onSurfaceVariant" aria-live="polite">
        {announceText}
      </p>

      {selectedRecipe ? (
        <article className="overflow-hidden rounded-2xl bg-surfaceContainerLowest shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedRecipe.thumbnail_url}
              alt={selectedRecipe.title_km}
              width={720}
              height={440}
              className={`block h-[230px] w-full object-cover transition-all duration-300 ${isSpinning ? "scale-95 blur-[3px] brightness-110" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="m-0 line-clamp-2 text-3xl font-bold leading-tight text-white">{selectedRecipe.title_km}</h3>
              <p className="m-0 mt-1 text-base font-semibold text-white/85">{categoryNames[selectedRecipe.category_id] ?? "ម្ហូប"}</p>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <button
              type="button"
              className="flex min-h-[56px] items-center justify-center rounded-full border-2 border-primary bg-surfaceContainerLowest px-5 text-lg font-bold text-primary transition-transform active:scale-95"
              onClick={handleSpin}
              disabled={isSpinning}
            >
              បង្វិលម្ដងទៀត
            </button>
            <Link
              href={`/recipe/${selectedRecipe.id}`}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-primary px-5 text-lg font-bold text-onPrimary shadow-sm transition-transform active:scale-95"
            >
              <PlayIcon />
              មើលវិធីធ្វើ
            </Link>
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-outlineVariant/30 bg-surfaceContainerLowest p-6 text-center">
          <p className="m-0 text-base font-semibold text-onSurfaceVariant">ចុចបង្វិលដើម្បីជ្រើសម្ហូប</p>
        </div>
      )}
    </section>
  );
};

export default MealPicker;
