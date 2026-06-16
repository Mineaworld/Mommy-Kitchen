import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/supabase/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { listStorageImages, deleteStorageImage, getPublicImageUrl } from "@/lib/supabase/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export const GET = async (request: NextRequest) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } }, { status: 401 });
  }

  let images: Awaited<ReturnType<typeof listStorageImages>>;
  try {
    images = await listStorageImages();
  } catch (err) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: err instanceof Error ? err.message : "Storage unavailable" } },
      { status: 503 }
    );
  }

  const withUrls = images.map((img) => ({
    name: img.name,
    size: img.size,
    updated_at: img.updated_at,
    public_url: getPublicImageUrl(img.name),
  }));

  return NextResponse.json({ data: withUrls });
};

export const POST = async (request: NextRequest) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } }, { status: 401 });
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Storage is not configured" } },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("files");

  const errors: string[] = [];
  const validEntries: File[] = [];

  for (const entry of files) {
    if (!(entry instanceof File)) {
      errors.push("Invalid entry: not a file");
      continue;
    }

    if (!ALLOWED_TYPES.includes(entry.type)) {
      errors.push(`${entry.name}: unsupported type "${entry.type}". Allowed: ${ALLOWED_TYPES.join(", ")}`);
      continue;
    }

    if (entry.size > MAX_SIZE) {
      errors.push(`${entry.name}: file too large (${entry.size} bytes). Max: ${MAX_SIZE} bytes`);
      continue;
    }

    validEntries.push(entry);
  }

  const results = await Promise.all(
    validEntries.map(async (entry) => {
      const buffer = Buffer.from(await entry.arrayBuffer());
      const { error } = await client.storage.from("recipe-images").upload(entry.name, buffer, {
        contentType: entry.type,
        upsert: true,
      });
      return { name: entry.name, error };
    })
  );

  let uploaded = 0;
  for (const result of results) {
    if (result.error) {
      errors.push(`${result.name}: upload failed — ${result.error.message}`);
    } else {
      uploaded++;
    }
  }

  return NextResponse.json({ data: { uploaded, errors } }, { status: 201 });
};

export const DELETE = async (request: NextRequest) => {
  const auth = request.headers.get("authorization") ?? "";
  const isValidToken = await verifyBearerToken(auth);
  if (!isValidToken) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } }, { status: 401 });
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Storage is not configured" } },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const filename = body?.filename;
  if (!filename || typeof filename !== "string") {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Missing required field: filename" } },
      { status: 400 }
    );
  }

  const deleted = await deleteStorageImage(filename);
  if (!deleted) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Image "${filename}" not found or could not be deleted` } },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
};
