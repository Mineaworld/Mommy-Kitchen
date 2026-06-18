import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  mulberry32,
  hashSeedString,
  getServerDailyPicks,
  filterByMealSlot,
  dailyShuffle,
  getTodayDateStr,
  getDailyPick,
} from "@/lib/daily-pick";
import type { Recipe } from "@/lib/types";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const makeRecipe = (
  id: string,
  title: string,
  mealSlot: "lunch" | "dinner" | "any" | "breakfast" = "any"
): Recipe => ({
  id,
  title_km: title,
  thumbnail_url: `https://example.com/${id}.jpg`,
  category_id: "cat-1",
  meal_slot: mealSlot,
  youtube_url: "https://youtube.com/watch?v=test",
  youtube_video_id: "test",
  duration_minutes: 15,
  is_published: true,
});

const RECIPES: Recipe[] = [
  makeRecipe("r1", "សម្លការី", "lunch"),
  makeRecipe("r2", "ឆាបន្លែ", "lunch"),
  makeRecipe("r3", "បាយឆា", "dinner"),
  makeRecipe("r4", "សម្លម្ជូរ", "dinner"),
  makeRecipe("r5", "នំបញ្ចុក", "any"),
  makeRecipe("r6", "ម្ហូបចម្រុះ", "any"),
  makeRecipe("r7", "សាច់ជ្រូកចៀន", "lunch"),
  makeRecipe("r8", "ត្រីចៀន", "dinner"),
  makeRecipe("r9", "បន្លែលាយ", "any"),
  makeRecipe("r10", "អាហារពេលព្រឹក", "breakfast"),
];

// ---------------------------------------------------------------------------
// mulberry32 — Seeded PRNG
// ---------------------------------------------------------------------------

describe("mulberry32", () => {
  it("produces deterministic output for the same seed", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);

    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());

    expect(seq1).toEqual(seq2);
  });

  it("produces different output for different seeds", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(99);

    const val1 = rng1();
    const val2 = rng2();

    expect(val1).not.toEqual(val2);
  });

  it("returns values between 0 and 1", () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

// ---------------------------------------------------------------------------
// hashSeedString
// ---------------------------------------------------------------------------

describe("hashSeedString", () => {
  it("is deterministic", () => {
    const hash1 = hashSeedString("2026-06-17-lunch-v1");
    const hash2 = hashSeedString("2026-06-17-lunch-v1");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", () => {
    const hash1 = hashSeedString("2026-06-17-lunch-v1");
    const hash2 = hashSeedString("2026-06-17-dinner-v1");
    expect(hash1).not.toBe(hash2);
  });

  it("produces different hashes for different dates", () => {
    const hash1 = hashSeedString("2026-06-17-lunch-v1");
    const hash2 = hashSeedString("2026-06-18-lunch-v1");
    expect(hash1).not.toBe(hash2);
  });
});

// ---------------------------------------------------------------------------
// filterByMealSlot
// ---------------------------------------------------------------------------

describe("filterByMealSlot", () => {
  it("returns all recipes for 'any' slot", () => {
    const result = filterByMealSlot(RECIPES, "any");
    expect(result).toEqual(RECIPES);
  });

  it("returns lunch + any recipes for 'lunch' slot", () => {
    const result = filterByMealSlot(RECIPES, "lunch");
    const ids = result.map((r) => r.id);
    // Should include lunch recipes and "any" recipes, but not dinner or breakfast
    expect(ids).toContain("r1"); // lunch
    expect(ids).toContain("r2"); // lunch
    expect(ids).toContain("r7"); // lunch
    expect(ids).toContain("r5"); // any
    expect(ids).toContain("r6"); // any
    expect(ids).toContain("r9"); // any
    expect(ids).not.toContain("r3"); // dinner
    expect(ids).not.toContain("r10"); // breakfast
  });

  it("returns dinner + any recipes for 'dinner' slot", () => {
    const result = filterByMealSlot(RECIPES, "dinner");
    const ids = result.map((r) => r.id);
    expect(ids).toContain("r3"); // dinner
    expect(ids).toContain("r4"); // dinner
    expect(ids).toContain("r8"); // dinner
    expect(ids).toContain("r5"); // any
    expect(ids).not.toContain("r1"); // lunch
    expect(ids).not.toContain("r10"); // breakfast
  });
});

// ---------------------------------------------------------------------------
// getServerDailyPicks
// ---------------------------------------------------------------------------

describe("getServerDailyPicks", () => {
  it("returns same picks for the same date", () => {
    const picks1 = getServerDailyPicks(RECIPES, "2026-06-17");
    const picks2 = getServerDailyPicks(RECIPES, "2026-06-17");

    expect(picks1.lunch?.id).toBe(picks2.lunch?.id);
    expect(picks1.dinner?.id).toBe(picks2.dinner?.id);
    expect(picks1.any?.id).toBe(picks2.any?.id);
  });

  it("returns different picks for different dates", () => {
    // Test across many dates to ensure at least some differ
    const dates = Array.from({ length: 30 }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return `2026-06-${day}`;
    });

    const lunchPicks = dates.map(
      (d) => getServerDailyPicks(RECIPES, d).lunch?.id
    );

    // Should not all be the same
    const uniquePicks = new Set(lunchPicks);
    expect(uniquePicks.size).toBeGreaterThan(1);
  });

  it("returns null for slots with no matching recipes", () => {
    const lunchOnlyRecipes = RECIPES.filter((r) => r.meal_slot === "lunch");
    const picks = getServerDailyPicks(lunchOnlyRecipes, "2026-06-17");

    expect(picks.lunch).not.toBeNull();
    // Dinner slot has no matching recipes (no dinner and no "any")
    expect(picks.dinner).toBeNull();
  });

  it("returns picks for all 3 slots", () => {
    const picks = getServerDailyPicks(RECIPES, "2026-06-17");

    expect(picks.lunch).not.toBeNull();
    expect(picks.dinner).not.toBeNull();
    expect(picks.any).not.toBeNull();
  });

  it("returns null for all slots with empty recipes", () => {
    const picks = getServerDailyPicks([], "2026-06-17");

    expect(picks.lunch).toBeNull();
    expect(picks.dinner).toBeNull();
    expect(picks.any).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// dailyShuffle
// ---------------------------------------------------------------------------

describe("dailyShuffle", () => {
  it("returns all items (no loss)", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = dailyShuffle(items, "2026-06-17");

    expect(shuffled).toHaveLength(items.length);
    expect(shuffled.sort()).toEqual(items.sort());
  });

  it("is deterministic for the same date", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffle1 = dailyShuffle(items, "2026-06-17");
    const shuffle2 = dailyShuffle(items, "2026-06-17");

    expect(shuffle1).toEqual(shuffle2);
  });

  it("produces different order for different dates", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffle1 = dailyShuffle(items, "2026-06-17");
    const shuffle2 = dailyShuffle(items, "2026-06-18");

    // Very unlikely to be the same order
    expect(shuffle1).not.toEqual(shuffle2);
  });

  it("does not mutate the original array", () => {
    const items = [1, 2, 3, 4, 5];
    const original = [...items];
    dailyShuffle(items, "2026-06-17");

    expect(items).toEqual(original);
  });

  it("handles empty array", () => {
    expect(dailyShuffle([], "2026-06-17")).toEqual([]);
  });

  it("handles single item", () => {
    expect(dailyShuffle([42], "2026-06-17")).toEqual([42]);
  });
});

// ---------------------------------------------------------------------------
// getTodayDateStr
// ---------------------------------------------------------------------------

describe("getTodayDateStr", () => {
  it("returns YYYY-MM-DD format", () => {
    const dateStr = getTodayDateStr();
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ---------------------------------------------------------------------------
// getDailyPick (client-side with localStorage mock)
// ---------------------------------------------------------------------------

describe("getDailyPick", () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      },
    });
  });

  it("returns a recipe for a valid slot", () => {
    const pick = getDailyPick(RECIPES, "lunch", "2026-06-17");
    expect(pick).not.toBeNull();
    expect(pick!.meal_slot === "lunch" || pick!.meal_slot === "any").toBe(true);
  });

  it("returns same pick for same date and slot", () => {
    const pick1 = getDailyPick(RECIPES, "lunch", "2026-06-17");
    const pick2 = getDailyPick(RECIPES, "lunch", "2026-06-17");
    expect(pick1?.id).toBe(pick2?.id);
  });

  it("returns null for empty recipe list", () => {
    const pick = getDailyPick([], "lunch", "2026-06-17");
    expect(pick).toBeNull();
  });

  it("returns the only recipe when pool has one item", () => {
    const singleRecipe = [makeRecipe("single", "តែមួយ", "lunch")];
    const pick = getDailyPick(singleRecipe, "lunch", "2026-06-17");
    expect(pick?.id).toBe("single");
  });
});
