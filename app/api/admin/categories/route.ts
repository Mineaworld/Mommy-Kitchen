import { NextRequest, NextResponse } from "next/server";
import { CategoryRepository } from "@/lib/repositories/CategoryRepository";
import { verifyBearerToken } from "@/lib/supabase/auth";
import { categoryInputSchema } from "@/lib/validation/category";

export const GET = async (request: NextRequest) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } }, { status: 401 });
  }

  const categories = await CategoryRepository.getAllForAdmin();
  return NextResponse.json({ data: categories });
};

export const POST = async (request: NextRequest) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = categoryInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid payload", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const existing = await CategoryRepository.getAllForAdmin();
  if (existing.some((category) => category.slug === parsed.data.slug)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Category slug already exists", fields: { slug: ["Category slug already exists"] } } },
      { status: 400 }
    );
  }

  const created = await CategoryRepository.create(parsed.data);
  return NextResponse.json({ data: created }, { status: 201 });
};
