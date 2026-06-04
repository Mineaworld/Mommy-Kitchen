import { NextResponse } from "next/server";
import { RecipeRepository } from "@/lib/repositories/RecipeRepository";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export const GET = async (_request: Request, { params }: RouteProps) => {
  const { id } = await params;
  const recipe = await RecipeRepository.getById(id);

  if (!recipe) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Recipe not found" } }, { status: 404 });
  }

  return NextResponse.json({ data: recipe });
};
