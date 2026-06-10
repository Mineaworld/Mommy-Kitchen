"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type StorageImage = {
  name: string;
  size: number;
  updated_at: string;
  public_url: string;
};

type UploadProgress = {
  filename: string;
  status: "pending" | "uploading" | "done" | "error";
  message?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AdminImagesPage = () => {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = (): string | null => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setError("Please log in first.");
      return null;
    }
    return token;
  };

  const loadImages = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch("/api/admin/images", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setError("Failed to load images.");
        return;
      }
      const json = (await response.json()) as { data: StorageImage[] };
      setImages(json.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" — Invalid format. Use JPG, PNG, or WebP.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" — Too large (${formatBytes(file.size)}). Max 5MB.`);
        continue;
      }
      valid.push(file);
    }

    return { valid, errors };
  };

  const uploadFiles = async (files: File[]) => {
    const { valid, errors: validationErrors } = validateFiles(files);

    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
    }

    if (valid.length === 0) return;

    const token = getToken();
    if (!token) return;

    const progressItems: UploadProgress[] = valid.map((f) => ({
      filename: f.name,
      status: "pending" as const,
    }));
    setUploads(progressItems);
    setError("");

    const formData = new FormData();
    for (const file of valid) {
      formData.append("files", file);
    }

    // Mark all as uploading
    setUploads(valid.map((f) => ({ filename: f.name, status: "uploading" })));

    try {
      const response = await fetch("/api/admin/images", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const json = (await response.json()) as { error?: { message?: string } };
        setUploads(valid.map((f) => ({ filename: f.name, status: "error", message: json.error?.message ?? "Upload failed" })));
        return;
      }

      const json = (await response.json()) as { data: { uploaded: number; errors: string[] } };

      setUploads(
        valid.map((f) => ({
          filename: f.name,
          status: "done" as const,
        }))
      );

      if (json.data.errors.length > 0) {
        setError(json.data.errors.join("\n"));
      }

      // Refresh the image list
      await loadImages();

      // Clear upload progress after a delay
      setTimeout(() => setUploads([]), 3000);
    } catch {
      setUploads(valid.map((f) => ({ filename: f.name, status: "error", message: "Network error" })));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void uploadFiles(Array.from(files));
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    void uploadFiles(Array.from(files));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDelete = async (filename: string) => {
    const confirmed = confirm(`Delete "${filename}"? This cannot be undone.`);
    if (!confirmed) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch("/api/admin/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        setError("Failed to delete image.");
        return;
      }

      setImages((prev) => prev.filter((img) => img.name !== filename));
    } catch {
      setError("Network error during delete.");
    }
  };

  const handleCopyFilename = async (filename: string) => {
    try {
      await navigator.clipboard.writeText(filename);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <main className="max-w-[800px] mx-auto min-h-screen bg-surface pb-[100px]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-16 bg-surface/90 backdrop-blur-md">
        <h1 className="text-xl font-bold text-onSurface m-0">Image Manager</h1>
        <div className="flex gap-2">
          <Link
            className="inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-semibold text-primary bg-surfaceContainer hover:bg-surfaceContainerHigh transition-colors"
            href="/admin/recipes"
          >
            Recipes
          </Link>
          <Link
            className="inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-semibold text-primary bg-surfaceContainer hover:bg-surfaceContainerHigh transition-colors"
            href="/admin/import"
          >
            Import
          </Link>
        </div>
      </header>

      <div className="px-4 py-4 grid gap-4">
        {/* Stats */}
        <section className="bg-surfaceContainer px-4 py-3 rounded-2xl flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-bold text-onSurface m-0">Uploaded Images</h2>
          <span className="bg-secondaryContainer text-onSecondaryContainer font-bold text-sm px-3 py-1 rounded-full">
            {images.length} Total
          </span>
        </section>

        {/* Error Banner */}
        {error ? (
          <section className="bg-errorContainer p-4 rounded-2xl shadow-sm">
            <p className="text-error font-bold m-0 whitespace-pre-line">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-error/70 text-sm font-semibold mt-2 underline"
            >
              Dismiss
            </button>
          </section>
        ) : null}

        {/* Upload Zone */}
        <section>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
              ${isDragOver
                ? "border-primary bg-primaryFixed/30 scale-[1.01]"
                : "border-outlineVariant bg-surfaceContainerLowest hover:border-primary/50 hover:bg-surfaceContainerLow"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              onChange={handleFileSelect}
              className="sr-only"
            />
            <div className="flex flex-col items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-colors ${isDragOver ? "text-primary" : "text-onSurfaceVariant"}`}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-onSurface font-bold text-lg m-0">
                {isDragOver ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-onSurfaceVariant text-sm m-0">
                or click to browse • JPG, PNG, WebP • Max 5MB each
              </p>
            </div>
          </div>
        </section>

        {/* Upload Progress */}
        {uploads.length > 0 ? (
          <section className="bg-surfaceContainerLowest p-4 rounded-2xl shadow-sm border border-outlineVariant/30">
            <h3 className="text-base font-bold text-onSurface mb-3 m-0">Upload Progress</h3>
            <div className="flex flex-col gap-2">
              {uploads.map((item) => (
                <div key={item.filename} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-onSurface truncate m-0">{item.filename}</p>
                    {item.status === "uploading" ? (
                      <div className="w-full h-1.5 bg-surfaceContainerHighest rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
                      </div>
                    ) : null}
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${
                      item.status === "done"
                        ? "bg-secondaryContainer text-onSecondaryContainer"
                        : item.status === "error"
                          ? "bg-errorContainer text-error"
                          : item.status === "uploading"
                            ? "bg-primaryFixed text-onPrimaryFixed"
                            : "bg-surfaceContainer text-onSurfaceVariant"
                    }`}
                  >
                    {item.status === "done"
                      ? "✓ Done"
                      : item.status === "error"
                        ? "✗ Error"
                        : item.status === "uploading"
                          ? "Uploading…"
                          : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Loading Skeleton */}
        {loading ? (
          <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="bg-surfaceContainerLow rounded-2xl p-3 shadow-sm" key={i}>
                <div className="w-full aspect-square bg-surfaceContainerHighest rounded-xl mb-2 animate-pulse" />
                <div className="h-4 w-3/4 bg-surfaceContainerHighest rounded-md animate-pulse" />
              </div>
            ))}
          </section>
        ) : images.length === 0 ? (
          /* Empty State */
          <section className="bg-surfaceContainerLowest p-8 rounded-2xl shadow-sm border border-outlineVariant/30 text-center">
            <p className="text-onSurfaceVariant font-bold text-lg m-0">No images uploaded yet</p>
            <p className="text-onSurfaceVariant text-sm mt-2 m-0">
              Upload your recipe photos here before importing CSV data.
            </p>
          </section>
        ) : (
          /* Image Grid */
          <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                className="bg-surfaceContainerLowest rounded-2xl overflow-hidden shadow-sm border border-outlineVariant/30 flex flex-col"
                key={image.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.public_url}
                  alt={image.name}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <p
                    className="text-sm font-semibold text-onSurface truncate m-0 cursor-pointer hover:text-primary transition-colors"
                    title={`Click to copy: ${image.name}`}
                    onClick={() => void handleCopyFilename(image.name)}
                  >
                    {image.name}
                  </p>
                  <p className="text-xs text-onSurfaceVariant m-0">{formatBytes(image.size)}</p>
                  <button
                    type="button"
                    onClick={() => void handleDelete(image.name)}
                    className="w-full text-center font-bold text-error bg-errorContainer hover:bg-errorContainer/80 px-3 py-2 rounded-xl transition-colors text-sm mt-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminImagesPage;
