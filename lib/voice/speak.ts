import type { Category, Recipe } from "@/lib/types";

/**
 * Creates a function that speaks a Khmer label using the Web Speech API.
 * Returns a callable function to be triggered by user gesture (tap).
 */
export const createKhmerSpeaker = (text: string): (() => void) => {
  return () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "km-KH";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };
};

/**
 * Directly speaks a Khmer label. Use createKhmerSpeaker for gesture-triggered speech.
 */
export const speakKhmerLabel = (text: string) => {
  const speak = createKhmerSpeaker(text);
  speak();
};

export const speakRecipe = (recipe: Pick<Recipe, "title_km">) => {
  speakKhmerLabel(recipe.title_km);
};

export const speakCategory = (category: Pick<Category, "name_km">) => {
  speakKhmerLabel(category.name_km);
};
