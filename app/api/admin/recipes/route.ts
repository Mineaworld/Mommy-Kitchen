import { NextRequest, NextResponse } from "next/server";
import { recipeInputSchema } from "@/lib/validation/recipe";
import { RecipeRepository } from "@/lib/repositories/RecipeRepository";
import { verifyBearerToken } from "@/lib/supabase/auth";

export const GET = async (request: NextRequest) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } }, { status: 401 });
  }

  const recipes = await RecipeRepository.getAllForAdmin();
  return NextResponse.json({ data: recipes });
};

export const POST = async (request: NextRequest) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = recipeInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid payload", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const created = await RecipeRepository.create(parsed.data);
  return NextResponse.json({ data: created }, { status: 201 });
};
