import type { MealSlot } from "@/lib/types";

export const appCopy = {
  appName: "ផ្ទះបាយម៉ាក់",
  homePrompt: "ជ្រើសរើសម្ហូប ឬ ចុចបង្វិលសម្រាប់ថ្ងៃនេះ",
  todayMenu: "មុខម្ហូបថ្ងៃនេះ",
  categories: "ប្រភេទម្ហូប",
  favorites: "ម្ហូបចូលចិត្ត",
  openRecipe: "មើលវិធីធ្វើ",
  watchVideo: "មើលវីដេអូ",
  openYoutube: "បើក YouTube",
  listen: "ស្តាប់",
  backHome: "ត្រឡប់ទៅដើម",
  noRecipes: "មិនទាន់មានមុខម្ហូបទេ",
  noCategories: "មិនទាន់មានប្រភេទម្ហូបទេ"
} as const;

export const mealSlotCopy: Record<Exclude<MealSlot, "breakfast">, { label: string; spinLabel: string; helper: string; speech: string }> = {
  lunch: {
    label: "ថ្ងៃត្រង់",
    spinLabel: "បង្វិលម្ហូបថ្ងៃត្រង់",
    helper: "ជ្រើសម្ហូបសម្រាប់ថ្ងៃត្រង់",
    speech: "ជ្រើសម្ហូបថ្ងៃត្រង់"
  },
  dinner: {
    label: "ពេលល្ងាច",
    spinLabel: "បង្វិលម្ហូបពេលល្ងាច",
    helper: "ជ្រើសម្ហូបសម្រាប់ពេលល្ងាច",
    speech: "ជ្រើសម្ហូបពេលល្ងាច"
  },
  any: {
    label: "អ្វីក៏បាន",
    spinLabel: "បង្វិលម្ហូប",
    helper: "អោយកម្មវិធីជ្រើសមួយ",
    speech: "ជ្រើសម្ហូបអ្វីក៏បាន"
  }
};

export const adminMealSlotLabels: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch / ថ្ងៃត្រង់",
  dinner: "Dinner / ពេលល្ងាច",
  any: "Any meal / អ្វីក៏បាន"
};
