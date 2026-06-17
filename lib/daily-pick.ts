import type { Recipe } from "@/lib/types";

type PublicMealSlot = "lunch" | "dinner" | "any";

type DailyPicks = {
  lunch: Recipe | null;
  dinner: Recipe | null;
  any: Recipe | null;
};

type PickLogEntry = {
  recipeId: string;
  mealSlot: PublicMealSlot;
  dateStr: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PICK_LOG_KEY = "daily-picks-log";
const HISTORY_DAYS = 7;
const MIN_POOL_SIZE = 3;

// ---------------------------------------------------------------------------
// Seeded PRNG — mulberry32
// ---------------------------------------------------------------------------

/**
 * Mulberry32: a fast, high-quality 32-bit seeded PRNG.
 * Same seed always produces the same sequence.
 */
export const mulberry32 = (seed: number): (() => number) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Convert a string into a numeric seed via a simple hash.
 * Deterministic: same string → same number.
 */
export const hashSeedString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
};

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle (seeded)
// ---------------------------------------------------------------------------

const seededShuffle = <T>(items: T[], rng: () => number): T[] => {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns today's date as YYYY-MM-DD in local timezone. */
export const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ---------------------------------------------------------------------------
// Meal slot filtering (shared logic)
// ---------------------------------------------------------------------------

/** Filter recipes to those matching a meal slot. */
export const filterByMealSlot = (
  recipes: Recipe[],
  mealSlot: PublicMealSlot
): Recipe[] => {
  if (mealSlot === "any") {
    return recipes;
  }
  return recipes.filter(
    (r) => r.meal_slot === mealSlot || r.meal_slot === "any"
  );
};

// ---------------------------------------------------------------------------
// localStorage pick history (client-only)
// ---------------------------------------------------------------------------

const readPickLog = (): PickLogEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PICK_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PickLogEntry[]) : [];
  } catch {
    return [];
  }
};

const writePickLog = (log: PickLogEntry[]): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PICK_LOG_KEY, JSON.stringify(log));
  } catch {
    // localStorage full or unavailable — fail silently
  }
};

/**
 * Get recipe IDs picked in the last N days for a given slot.
 * Also prunes entries older than HISTORY_DAYS.
 */
const getRecentPickIds = (
  mealSlot: PublicMealSlot,
  dateStr: string
): Set<string> => {
  const log = readPickLog();
  const cutoffDate = new Date(dateStr);
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_DAYS);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  // Prune old entries while we're reading
  const pruned = log.filter((entry) => entry.dateStr >= cutoffStr);
  if (pruned.length !== log.length) {
    writePickLog(pruned);
  }

  const recentIds = new Set<string>();
  for (const entry of pruned) {
    if (entry.mealSlot === mealSlot && entry.dateStr !== dateStr) {
      recentIds.add(entry.recipeId);
    }
  }
  return recentIds;
};

const savePickToLog = (
  recipeId: string,
  mealSlot: PublicMealSlot,
  dateStr: string
): void => {
  const log = readPickLog();

  // Don't duplicate the same pick for same slot+date
  const exists = log.some(
    (e) =>
      e.recipeId === recipeId &&
      e.mealSlot === mealSlot &&
      e.dateStr === dateStr
  );
  if (exists) return;

  log.push({ recipeId, mealSlot, dateStr });
  writePickLog(log);
};

// ---------------------------------------------------------------------------
// Core pick functions
// ---------------------------------------------------------------------------

/**
 * Pick today's recipe for a meal slot.
 * Client-side: uses localStorage to avoid repeats within 7 days.
 */
export const getDailyPick = (
  recipes: Recipe[],
  mealSlot: PublicMealSlot,
  dateStr?: string
): Recipe | null => {
  const date = dateStr ?? getTodayDateStr();

  // Has it already been picked today?
  const log = readPickLog();
  const todayPick = log.find(
    (e) => e.mealSlot === mealSlot && e.dateStr === date
  );
  if (todayPick) {
    const recipe = recipes.find((r) => r.id === todayPick.recipeId);
    if (recipe) return recipe;
  }

  const slotPool = filterByMealSlot(recipes, mealSlot);

  if (slotPool.length === 0) return null;

  // Exclude recently picked recipes
  const recentIds = getRecentPickIds(mealSlot, date);
  let candidates = slotPool.filter((r) => !recentIds.has(r.id));

  // Fall back if pool too small
  if (candidates.length < MIN_POOL_SIZE) {
    candidates = slotPool;
  }

  // Seed PRNG with date + meal slot
  const seedStr = `${date}-${mealSlot}-v1`;
  const seed = hashSeedString(seedStr);
  const rng = mulberry32(seed);

  // Shuffle and pick first
  const shuffled = seededShuffle(candidates, rng);
  const pick = shuffled[0];

  // Save to history
  savePickToLog(pick.id, mealSlot, date);

  return pick;
};

/**
 * Get daily picks for all 3 slots (client-side with localStorage).
 */
export const getDailyPicks = (
  recipes: Recipe[],
  dateStr?: string
): DailyPicks => {
  return {
    lunch: getDailyPick(recipes, "lunch", dateStr),
    dinner: getDailyPick(recipes, "dinner", dateStr),
    any: getDailyPick(recipes, "any", dateStr),
  };
};

/**
 * Pure server-side daily pick — no localStorage, just date-seeded.
 * Safe for server components and SSR.
 */
const getServerDailyPick = (
  recipes: Recipe[],
  mealSlot: PublicMealSlot,
  dateStr: string
): Recipe | null => {
  const slotPool = filterByMealSlot(recipes, mealSlot);
  if (slotPool.length === 0) return null;

  const seedStr = `${dateStr}-${mealSlot}-v1`;
  const seed = hashSeedString(seedStr);
  const rng = mulberry32(seed);

  const shuffled = seededShuffle(slotPool, rng);
  return shuffled[0];
};

/**
 * Get daily picks for all 3 slots (server-side, pure).
 */
export const getServerDailyPicks = (
  recipes: Recipe[],
  dateStr?: string
): DailyPicks => {
  const date = dateStr ?? getTodayDateStr();
  return {
    lunch: getServerDailyPick(recipes, "lunch", date),
    dinner: getServerDailyPick(recipes, "dinner", date),
    any: getServerDailyPick(recipes, "any", date),
  };
};

/**
 * Clear pick history — dev/debug utility.
 */
export const clearPickHistory = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PICK_LOG_KEY);
};

/**
 * Daily shuffle for a list of items — used by the menu page
 * to show a deterministic order that changes daily.
 */
export const dailyShuffle = <T>(items: T[], dateStr?: string): T[] => {
  const date = dateStr ?? getTodayDateStr();
  const seed = hashSeedString(date);
  const rng = mulberry32(seed);
  return seededShuffle(items, rng);
};
