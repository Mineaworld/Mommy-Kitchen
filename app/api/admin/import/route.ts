import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/supabase/auth";
import { RecipeRepository } from "@/lib/repositories/RecipeRepository";
import { CategoryRepository } from "@/lib/repositories/CategoryRepository";
import { listStorageImages, getPublicImageUrl } from "@/lib/supabase/storage";
import { bulkImportRowSchema } from "@/lib/validation/bulk-import";
import type { RecipeInput } from "@/lib/types";

export const POST = async (request: NextRequest) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Missing token" } },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const rows = body?.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "rows must be a non-empty array" } },
      { status: 400 }
    );
  }

  // Build lookup maps
  const categories = await CategoryRepository.getAllForAdmin();
  const categoryMap = new Map<string, string>(
    categories.map((c) => [c.slug, c.id])
  );

  let storageImages: Awaited<ReturnType<typeof listStorageImages>>;
  try {
    storageImages = await listStorageImages();
  } catch (err) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: err instanceof Error ? err.message : "Storage unavailable" } },
      { status: 503 }
    );
  }
  const imageSet = new Set<string>(storageImages.map((img) => img.name));

  const errors: Array<{ row: number; message: string }> = [];
  let created = 0;

  // Process rows sequentially
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const parsed = bulkImportRowSchema.safeParse(row);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message).join(", ");
      errors.push({ row: rowNum, message: `Validation: ${messages}` });
      continue;
    }

    if (!categoryMap.has(parsed.data.category_slug)) {
      errors.push({ row: rowNum, message: `Category slug "${parsed.data.category_slug}" not found` });
      continue;
    }

    if (!imageSet.has(parsed.data.image_filename)) {
      errors.push({ row: rowNum, message: `Image "${parsed.data.image_filename}" not found in storage` });
      continue;
    }

    const publicUrl = getPublicImageUrl(parsed.data.image_filename);
    if (!publicUrl) {
      errors.push({ row: rowNum, message: `Could not resolve public URL for image "${parsed.data.image_filename}"` });
      continue;
    }

    const recipeInput: RecipeInput = {
      title_km: parsed.data.title_km,
      thumbnail_url: publicUrl,
      category_id: categoryMap.get(parsed.data.category_slug)!,
      meal_slot: parsed.data.meal_slot ?? "any",
      youtube_url: parsed.data.youtube_url || "",
      duration_minutes:
        typeof parsed.data.duration_minutes === "number"
          ? parsed.data.duration_minutes
          : undefined,
      is_published: true,
    };

    try {
      await RecipeRepository.create(recipeInput);
      created++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push({ row: rowNum, message: `Create failed: ${message}` });
    }
  }

  return NextResponse.json({ data: { created, errors } });
};
