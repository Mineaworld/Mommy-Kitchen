"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DinnerIcon, LunchIcon, PlayIcon, SparkIcon } from "@/components/icons";
import { getDailyPick, filterByMealSlot } from "@/lib/daily-pick";
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
  any: <SparkIcon />,
};

// ---------------------------------------------------------------------------
// Animation states
// ---------------------------------------------------------------------------

type AnimationPhase = "hidden" | "entering" | "visible" | "bounce";

const MealPicker = ({ categories, recipes }: MealPickerProps) => {
  const [selectedMealSlot, setSelectedMealSlot] = useState<PublicMealSlot>("lunch");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [announceText, setAnnounceText] = useState(mealSlotCopy.lunch.helper);
  const [isSpinning, setIsSpinning] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimationPhase>("hidden");
  const spinTimeoutRef = useRef<number | null>(null);
  const voiceTimeoutRef = useRef<number | null>(null);

  const categoryNames = useMemo(() => {
    return categories.reduce<Record<string, string>>((accumulator, category) => {
      accumulator[category.id] = category.name_km;
      return accumulator;
    }, {});
  }, [categories]);

  const candidateRecipes = useMemo(() => {
    return filterByMealSlot(recipes, selectedMealSlot);
  }, [recipes, selectedMealSlot]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) window.clearTimeout(spinTimeoutRef.current);
      if (voiceTimeoutRef.current) window.clearTimeout(voiceTimeoutRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Auto-show animation helper
  // ---------------------------------------------------------------------------

  const autoShowRecipe = useCallback(
    (recipe: Recipe | null) => {
      if (!recipe) {
        setSelectedRecipe(null);
        setAnimPhase("hidden");
        if (candidateRecipes.length === 0) {
          const text = "គ្មានមុខម្ហូប";
          setAnnounceText(text);
        }
        return;
      }

      // Start hidden, then animate in
      setAnimPhase("hidden");
      setSelectedRecipe(recipe);
      setAnnounceText(recipe.title_km);

      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimPhase("entering");

          // Transition to fully visible after animation
          setTimeout(() => setAnimPhase("visible"), 400);

          // Voice fires 300ms after card appears
          if (voiceTimeoutRef.current) window.clearTimeout(voiceTimeoutRef.current);
          voiceTimeoutRef.current = window.setTimeout(() => {
            speakRecipe(recipe);
            voiceTimeoutRef.current = null;
          }, 300);
        });
      });
    },
    [candidateRecipes.length]
  );

  // ---------------------------------------------------------------------------
  // Auto-show on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (selectedRecipe !== null) return;

    if (candidateRecipes.length === 0) {
      setAnnounceText("គ្មានមុខម្ហូប");
      return;
    }

    if (candidateRecipes.length === 1) {
      autoShowRecipe(candidateRecipes[0]);
      return;
    }

    const pick = getDailyPick(recipes, selectedMealSlot);
    autoShowRecipe(pick);
  }, [candidateRecipes, recipes, selectedMealSlot, autoShowRecipe, selectedRecipe]);

  // ---------------------------------------------------------------------------
  // Meal slot selection
  // ---------------------------------------------------------------------------

  const selectMealSlot = (mealSlot: PublicMealSlot) => {
    if (isSpinning) return;
    setSelectedMealSlot(mealSlot);
    speakKhmerLabel(mealSlotCopy[mealSlot].speech);

    const slotRecipes = filterByMealSlot(recipes, mealSlot);

    if (slotRecipes.length === 0) {
      setSelectedRecipe(null);
      setAnimPhase("hidden");
      setAnnounceText("គ្មានមុខម្ហូប");
      return;
    }

    if (slotRecipes.length === 1) {
      autoShowRecipe(slotRecipes[0]);
      return;
    }

    const pick = getDailyPick(recipes, mealSlot);
    autoShowRecipe(pick);
  };

  // ---------------------------------------------------------------------------
  // Spin animation (re-spin with Math.random)
  // ---------------------------------------------------------------------------

  const handleSpin = () => {
    if (isSpinning) return;

    if (candidateRecipes.length === 0) {
      const text = "គ្មានមុខម្ហូប";
      setAnnounceText(text);
      speakKhmerLabel(text);
      return;
    }

    // Single recipe — auto-select, no spin
    if (candidateRecipes.length === 1) {
      autoShowRecipe(candidateRecipes[0]);
      return;
    }

    setIsSpinning(true);
    setAnnounceText("កំពុងបង្វិល");
    setAnimPhase("visible"); // Keep card area visible during spin

    const cycles = Math.min(Math.max(candidateRecipes.length * 3, 12), 20);

    const step = (index: number) => {
      const recipe = candidateRecipes[index % candidateRecipes.length];
      setSelectedRecipe(recipe);

      if (index === cycles) {
        // Final frame — bounce animation
        setAnimPhase("bounce");
        setAnnounceText(recipe.title_km);

        // Reset bounce after 300ms
        spinTimeoutRef.current = window.setTimeout(() => {
          setAnimPhase("visible");
          setIsSpinning(false);
          speakRecipe(recipe);
          spinTimeoutRef.current = null;
        }, 300);
        return;
      }

      // Ease-out curve: starts at 60ms, ends at ~560ms
      const progress = index / cycles;
      const delay = 60 + Math.pow(progress, 2.5) * 500;
      spinTimeoutRef.current = window.setTimeout(() => step(index + 1), delay);
    };

    // Pick a random starting index to avoid always starting at 0
    const startIndex = Math.floor(Math.random() * candidateRecipes.length);
    step(startIndex);
  };

  // ---------------------------------------------------------------------------
  // Animation styles
  // ---------------------------------------------------------------------------

  const getCardStyle = (): React.CSSProperties => {
    switch (animPhase) {
      case "hidden":
        return {
          opacity: 0,
          transform: "scale(0.9)",
          transition: "none",
        };
      case "entering":
        return {
          opacity: 1,
          transform: "scale(1)",
          transition: "opacity 400ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        };
      case "bounce":
        return {
          opacity: 1,
          transform: "scale(1.05)",
          transition: "transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        };
      case "visible":
      default:
        return {
          opacity: 1,
          transform: "scale(1)",
          transition: "transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease",
        };
    }
  };

  const spinDisabled = isSpinning || candidateRecipes.length <= 1;

  return (
    <section className="grid gap-4 rounded-3xl border border-outlineVariant bg-surfaceContainer p-5 shadow-sm" aria-labelledby="meal-picker-heading">
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
                  : "border-2 border-outlineVariant bg-surfaceContainerLowest text-onSurfaceVariant"
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
        disabled={spinDisabled}
      >
        {isSpinning ? "កំពុងបង្វិល" : mealSlotCopy[selectedMealSlot].spinLabel}
      </button>

      <p className="m-0 text-center text-base font-semibold text-onSurfaceVariant" aria-live="polite">
        {announceText}
      </p>

      {selectedRecipe ? (
        <article
          className="overflow-hidden rounded-2xl bg-surfaceContainerLowest shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          style={getCardStyle()}
        >
          <div className="relative">
            <Image
              src={selectedRecipe.thumbnail_url}
              alt={selectedRecipe.title_km}
              width={720}
              height={440}
              sizes="(max-width: 800px) 100vw, 800px"
              className={`block h-[230px] w-full object-cover transition-all duration-300 ${isSpinning ? "scale-95 blur-[3px] brightness-110" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3
                className="m-0 line-clamp-2 text-3xl font-bold leading-tight text-white transition-opacity duration-200"
                style={{ opacity: isSpinning ? 0.5 : 1 }}
              >
                {selectedRecipe.title_km}
              </h3>
              <p className="m-0 mt-1 text-base font-semibold text-white/85">{categoryNames[selectedRecipe.category_id] ?? "ម្ហូប"}</p>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <button
              type="button"
              className="flex min-h-[56px] items-center justify-center rounded-full border-2 border-primary bg-surfaceContainerLowest px-5 text-lg font-bold text-primary transition-transform active:scale-95"
              onClick={handleSpin}
              disabled={spinDisabled}
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
      ) : candidateRecipes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-outlineVariant bg-surfaceContainerLowest p-6 text-center">
          <p className="m-0 text-base font-semibold text-onSurfaceVariant">គ្មានមុខម្ហូប</p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-outlineVariant bg-surfaceContainerLowest p-6 text-center">
          <p className="m-0 text-base font-semibold text-onSurfaceVariant">ចុចបង្វិលដើម្បីជ្រើសម្ហូប</p>
        </div>
      )}
    </section>
  );
};

export default MealPicker;
