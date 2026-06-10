import { getSupabaseAdminClient } from "@/lib/supabase/server";

const BUCKET = "recipe-images";

/**
 * List all files in the recipe-images bucket.
 * Returns array of { name, size, updated_at }.
 */
export async function listStorageImages(): Promise<
  { name: string; size: number; updated_at: string }[]
> {
  const client = getSupabaseAdminClient();
  if (!client) return [];

  const { data, error } = await client.storage.from(BUCKET).list("", {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !data) return [];

  return data
    .filter((file) => file.name !== ".emptyFolderPlaceholder")
    .map((file) => ({
      name: file.name,
      size: file.metadata?.size ?? 0,
      updated_at: file.updated_at ?? "",
    }));
}

/**
 * Delete a file from the bucket by filename.
 */
export async function deleteStorageImage(filename: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client) return false;

  const { error } = await client.storage.from(BUCKET).remove([filename]);

  return !error;
}

/**
 * Get the public URL for a filename.
 */
export function getPublicImageUrl(filename: string): string | null {
  const client = getSupabaseAdminClient();
  if (!client) return null;

  const { data } = client.storage.from(BUCKET).getPublicUrl(filename);

  return data.publicUrl;
}

/**
 * Check if a file exists in the bucket.
 */
export async function checkImageExists(filename: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client) return false;

  const { data, error } = await client.storage.from(BUCKET).list("", {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !data) return false;

  return data.some((file) => file.name === filename);
}
