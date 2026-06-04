import { NextRequest, NextResponse } from "next/server";
import { RecipeRepository } from "@/lib/repositories/RecipeRepository";
import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/types";

export const GET = async (request: NextRequest) => {
  const categoryId = request.nextUrl.searchParams.get("categoryId");
  const mealSlot = request.nextUrl.searchParams.get("mealSlot");
  if (categoryId) {
    const filtered = await RecipeRepository.getByCategory(categoryId);
    return NextResponse.json({ data: filtered });
  }

  if (mealSlot && MEAL_SLOT_VALUES.includes(mealSlot as MealSlot)) {
    const filtered = await RecipeRepository.getByMealSlot(mealSlot as MealSlot);
    return NextResponse.json({ data: filtered });
  }

  const data = await RecipeRepository.getAll();
  return NextResponse.json({ data });
};
