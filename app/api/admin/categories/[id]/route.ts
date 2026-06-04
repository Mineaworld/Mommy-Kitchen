import { NextRequest, NextResponse } from "next/server";
import { CategoryRepository } from "@/lib/repositories/CategoryRepository";
import { verifyBearerToken } from "@/lib/supabase/auth";
import { categoryInputSchema } from "@/lib/validation/category";

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
  const parsed = categoryInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid payload", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const { id } = await params;
  const existing = await CategoryRepository.getAllForAdmin();
  if (existing.some((category) => category.slug === parsed.data.slug && category.id !== id)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Category slug already exists", fields: { slug: ["Category slug already exists"] } } },
      { status: 400 }
    );
  }

  const updated = await CategoryRepository.updateById(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, { status: 404 });
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
  const result = await CategoryRepository.deleteOrDeactivateById(id);
  if (!result) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, { status: 404 });
  }

  return NextResponse.json({ data: { result } });
};
