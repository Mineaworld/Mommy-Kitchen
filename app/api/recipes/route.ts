import { NextRequest, NextResponse } from "next/server";
import { RecipeRepository } from "@/lib/repositories/RecipeRepository";
import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/types";

export const GET = async (request: NextRequest) => {
  const categoryId = request.nextUrl.searchParams.get("categoryId");
  const mealSlot = request.nextUrl.searchParams.get("mealSlot");

  let data;
  if (categoryId) {
    data = await RecipeRepository.getByCategory(categoryId);
  } else if (mealSlot && MEAL_SLOT_VALUES.includes(mealSlot as MealSlot)) {
    data = await RecipeRepository.getByMealSlot(mealSlot as MealSlot);
  } else {
    data = await RecipeRepository.getAll();
  }

  return NextResponse.json({ data }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
};
