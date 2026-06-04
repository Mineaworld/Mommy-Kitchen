import { NextRequest, NextResponse } from "next/server";
import { recipeInputSchema } from "@/lib/validation/recipe";
import { RecipeRepository } from "@/lib/repositories/RecipeRepository";
import { verifyBearerToken } from "@/lib/supabase/auth";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export const PUT = async (request: NextRequest, { params }: RouteProps) => {
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

  const { id } = await params;
  const updated = await RecipeRepository.updateById(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Recipe not found" } }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
};

export const DELETE = async (request: NextRequest, { params }: RouteProps) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await RecipeRepository.deleteById(id);
  if (!deleted) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Recipe not found" } }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
};
