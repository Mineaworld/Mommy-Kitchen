"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayIcon } from "@/components/icons";
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

const MealPicker = ({ categories, recipes }: MealPickerProps) => {
  const [selectedMealSlot, setSelectedMealSlot] = useState<PublicMealSlot>("lunch");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [spinDisplayRecipe, setSpinDisplayRecipe] = useState<Recipe | null>(null);
  const [spinDegrees, setSpinDegrees] = useState(0);
  const [announceText, setAnnounceText] = useState(mealSlotCopy.lunch.helper);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinTimeoutRef = useRef<number | null>(null);
  const voiceTimeoutRef = useRef<number | null>(null);
  const hasAutoShownRef = useRef(false);

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
  // Auto-show today's pick ONCE on mount
  // ---------------------------------------------------------------------------

  const revealPick = useCallback(
    (recipe: Recipe | null) => {
      if (!recipe) {
        if (candidateRecipes.length === 0) {
          setAnnounceText("គ្មានមុខម្ហូប");
        }
        return;
      }

      setSelectedRecipe(recipe);
      setAnnounceText(recipe.title_km);

      if (voiceTimeoutRef.current) window.clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = window.setTimeout(() => {
        speakRecipe(recipe);
        voiceTimeoutRef.current = null;
      }, 300);
    },
    [candidateRecipes.length],
  );

  // Auto-show on mount — only runs once
  useEffect(() => {
    if (hasAutoShownRef.current) return;
    hasAutoShownRef.current = true;

    if (candidateRecipes.length === 0) {
      setAnnounceText("គ្មានមុខម្ហូប");
      return;
    }

    if (candidateRecipes.length === 1) {
      revealPick(candidateRecipes[0]);
      return;
    }

    const pick = getDailyPick(recipes, selectedMealSlot);
    revealPick(pick);
  }, [candidateRecipes, recipes, selectedMealSlot, revealPick]);

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
      setAnnounceText("គ្មានមុខម្ហូប");
      return;
    }

    if (slotRecipes.length === 1) {
      revealPick(slotRecipes[0]);
      return;
    }

    const pick = getDailyPick(recipes, mealSlot);
    revealPick(pick);
  };

  // ---------------------------------------------------------------------------
  // Spin — original master animation, total ≤ 3s guaranteed
  //   - Cycles through recipes with ease-out curve
  //   - Hard-capped at 3 000 ms via performance.now() guard
  // ---------------------------------------------------------------------------

  const handleSpin = () => {
    if (isSpinning) return;

    if (candidateRecipes.length === 0) {
      const text = "គ្មានមុខម្ហូប";
      setAnnounceText(text);
      speakKhmerLabel(text);
      return;
    }

    if (candidateRecipes.length === 1) {
      revealPick(candidateRecipes[0]);
      return;
    }

    if (spinTimeoutRef.current) window.clearTimeout(spinTimeoutRef.current);

    const spins = 3 + Math.random() * 2; // Randomly 3 to 5 spins
    setSpinDegrees((prev) => prev + spins * 360);

    setIsSpinning(true);
    setSelectedRecipe(null);
    setAnnounceText("កំពុងបង្វិល");

    // Pick a random winner upfront — prefer a different recipe when possible
    const alternatives = candidateRecipes.filter(
      (recipe) => recipe.id !== selectedRecipe?.id,
    );
    const winnerPool = alternatives.length > 0 ? alternatives : candidateRecipes;
    const finalRecipe =
      winnerPool[Math.floor(Math.random() * winnerPool.length)];

    const cycles = Math.min(Math.max(candidateRecipes.length * 4, 15), 25);
    const MAX_MS = 3_000;
    const startedAt = performance.now();

    // Shuffled reel so frames don't march in fixed array order
    const reel = [...candidateRecipes].sort(() => Math.random() - 0.5);

    const step = (index: number) => {
      // Update only the display name during spin — not the image
      const recipe =
        index >= cycles ? finalRecipe : reel[index % reel.length];
      setSpinDisplayRecipe(recipe);

      // Stop when we reached the final cycle OR hit the 3s safety cap
      if (index >= cycles || performance.now() - startedAt >= MAX_MS) {
        setIsSpinning(false);
        setSelectedRecipe(finalRecipe);
        setSpinDisplayRecipe(null);
        setAnnounceText(finalRecipe.title_km);
        speakRecipe(finalRecipe);
        spinTimeoutRef.current = null;
        return;
      }

      // Ease-out curve: starts very fast, dramatically slows toward the end
      const progress = index / cycles;
      const delay = 30 + Math.pow(progress, 3) * 400;
      spinTimeoutRef.current = window.setTimeout(() => step(index + 1), delay);
    };

    step(0);
  };

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const spinDisabled = isSpinning || candidateRecipes.length <= 1;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section
      className="grid gap-6 rounded-[2rem] border-[3px] border-[#62280d] bg-[#fef4c5] p-6 shadow-[4px_4px_0_0_#62280d]"
      aria-labelledby="meal-picker-heading"
    >
      {/* ── Heading ── */}
      <div className="grid gap-1 text-center">
        <h2
          id="meal-picker-heading"
          className="m-0 text-[32px] font-black text-[#e95e29] drop-shadow-[2px_2px_0_#62280d] leading-tight"
        >
          តោះ! ជ្រើសរើសអាហារថ្ងៃនេះ
        </h2>
        <p className="m-0 text-base font-semibold text-onSurfaceVariant">
          {isSpinning ? mealSlotCopy[selectedMealSlot].helper : announceText}
        </p>
      </div>

      {/* ── Screen-reader live region ── */}
      <p className="sr-only" aria-live="assertive" role="status">
        {announceText}
      </p>

      {/* ── Meal slot tabs ── */}
      <div className="grid grid-cols-3 gap-3" role="tablist" aria-label="Meal choices">
        {publicMealSlots.map((mealSlot) => {
          const isActive = selectedMealSlot === mealSlot;
          const bgClass =
            mealSlot === "lunch"
              ? "bg-[#9bd7fa]"
              : mealSlot === "dinner"
                ? "bg-[#ffac8c]"
                : "bg-[#abebb3]";
          const emoji =
            mealSlot === "lunch" ? "🍜" : mealSlot === "dinner" ? "🍛" : "🍢";
          const label =
            mealSlot === "lunch"
              ? "អាហារថ្ងៃត្រង់"
              : mealSlot === "dinner"
                ? "អាហារពេលល្ងាច"
                : "តាមចិត្ត";
          return (
            <button
              key={mealSlot}
              type="button"
              className={`flex min-h-[100px] flex-col items-center justify-center gap-2 px-2 text-[15px] font-black transition-all ${
                isActive
                  ? `${bgClass} rounded-[2rem] rounded-bl-md border-[3px] border-[#62280d] text-[#62280d] shadow-[4px_4px_0_0_#62280d] translate-y-1 scale-105`
                  : "bg-white rounded-[2rem] border-[2px] border-[#62280d] text-[#8b4e2d] shadow-sm hover:scale-105"
              }`}
              aria-pressed={isActive}
              onClick={() => selectMealSlot(mealSlot)}
            >
              <span className="text-4xl">{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Spin button ── */}
      <button
        type="button"
        className="min-h-[72px] rounded-full bg-[#e95e29] border-[4px] border-[#62280d] px-6 text-2xl font-black text-white shadow-[4px_4px_0_0_#62280d] transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0_0_#62280d]"
        onClick={handleSpin}
        disabled={spinDisabled}
      >
        <span className="flex items-center justify-center gap-2">
          {isSpinning ? "កំពុងបង្វិល..." : "តោះ! រកអីញ៉ាំ"}
          {!isSpinning && (
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#fef4c5] text-lg text-[#e95e29] border-2 border-[#62280d] pt-0.5">
              &gt;
            </span>
          )}
        </span>
      </button>

      {/* ── Spinning name reel ── */}
      {isSpinning && spinDisplayRecipe && (
        <div className="rounded-[2rem] border-[4px] border-[#62280d] bg-white p-8 shadow-[4px_4px_0_0_#62280d] text-center">
          <div className="animate-pulse">
            <div className="mx-auto mb-4 h-[180px] w-full rounded-2xl bg-gradient-to-br from-[#faeab1] to-[#ffac8c] flex items-center justify-center overflow-hidden">
              <span 
                className="text-7xl inline-block transition-transform ease-out"
                style={{ transform: `rotate(${spinDegrees}deg)`, transitionDuration: '3000ms' }}
              >
                🍳
              </span>
            </div>
            <h3 className="m-0 text-2xl font-black text-[#62280d] transition-all duration-100">
              {spinDisplayRecipe.title_km}
            </h3>
            <p className="m-0 mt-1 text-base font-semibold text-[#8b4e2d]">
              {categoryNames[spinDisplayRecipe.category_id] ?? "ម្ហូប"}
            </p>
          </div>
        </div>
      )}

      {/* ── Recipe card ── */}
      {!isSpinning && selectedRecipe ? (
        <article className="overflow-hidden rounded-[2rem] border-[4px] border-[#62280d] bg-white shadow-[4px_4px_0_0_#62280d]">
          {/* Image */}
          <div className="relative border-b-[4px] border-[#62280d]">
            <Image
              key={selectedRecipe.id}
              src={selectedRecipe.thumbnail_url}
              alt={selectedRecipe.title_km}
              width={720}
              height={440}
              className="block h-[240px] w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="m-0 line-clamp-2 text-3xl font-bold leading-tight text-white">
                {selectedRecipe.title_km}
              </h3>
              <p className="m-0 mt-1 text-base font-semibold text-white/85">
                {categoryNames[selectedRecipe.category_id] ?? "ម្ហូប"}
              </p>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="grid gap-3 p-5 sm:grid-cols-2 bg-[#fffdf5]">
            <button
              type="button"
              className="flex min-h-[56px] items-center justify-center rounded-full border-[3px] border-[#62280d] bg-[#faeab1] px-5 text-[17px] font-black text-[#62280d] shadow-[2px_2px_0_0_#62280d] transition-all active:translate-y-1 active:shadow-none"
              onClick={handleSpin}
              disabled={spinDisabled}
            >
              បង្វិលម្ដងទៀត
            </button>
            <Link
              href={`/recipe/${selectedRecipe.id}`}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-full border-[3px] border-[#62280d] bg-[#e95e29] px-5 text-[17px] font-black text-white shadow-[2px_2px_0_0_#62280d] transition-all active:translate-y-1 active:shadow-none"
            >
              <PlayIcon />
              មើលវិធីធ្វើ
            </Link>
          </div>
        </article>
      ) : !isSpinning && candidateRecipes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-outlineVariant bg-surfaceContainerLowest p-6 text-center">
          <p className="m-0 text-base font-semibold text-onSurfaceVariant">
            គ្មានមុខម្ហូប
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default MealPicker;
