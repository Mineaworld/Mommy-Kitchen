"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Checkbox } from "@/components/ui/checkbox";
import { getAdminToken } from "@/lib/admin-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = (): string | null => {
    const token = getAdminToken();
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

    // Mark all as uploading/compressing
    setUploads(valid.map((f) => ({ filename: f.name, status: "uploading" })));

    // Compression settings: Max 100KB, max 1080p, convert to WebP
    const options = {
      maxSizeMB: 0.15, // Targeting ~150KB maximum
      maxWidthOrHeight: 1080,
      useWebWorker: true,
      fileType: "image/webp",
    };

    const compressedFiles = await Promise.all(
      valid.map(async (file) => {
        try {
          const compressedBlob = await imageCompression(file, options);
          // Rename extension to .webp
          const newName = file.name.replace(/\.[^/.]+$/, ".webp");
          return new File([compressedBlob], newName, { type: "image/webp" });
        } catch (error) {
          console.error("Compression failed for", file.name, error);
          return file; // fallback to original file if it fails
        }
      })
    );

    const formData = new FormData();
    for (const file of compressedFiles) {
      formData.append("files", file);
    }

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

  const toggleSelectAll = () => {
    if (selectedImages.size === images.length && images.length > 0) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((img) => img.name)));
    }
  };

  const toggleSelectImage = (filename: string) => {
    const newSet = new Set(selectedImages);
    if (newSet.has(filename)) {
      newSet.delete(filename);
    } else {
      newSet.add(filename);
    }
    setSelectedImages(newSet);
  };

  const executeDelete = async () => {
    const token = getToken();
    if (!token || deleteTargets.length === 0) return;

    setIsDeleting(true);

    try {
      // Delete sequentially or parallel. Sequential is safer if API doesn't support bulk.
      for (const filename of deleteTargets) {
        const response = await fetch("/api/admin/images", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ filename }),
        });

        if (!response.ok) {
          setError(`Failed to delete ${filename}.`);
        }
      }

      setImages((prev) => prev.filter((img) => !deleteTargets.includes(img.name)));
      
      // Remove from selected if they were deleted
      const newSelected = new Set(selectedImages);
      deleteTargets.forEach((t) => newSelected.delete(t));
      setSelectedImages(newSelected);
      
    } catch {
      setError("Network error during delete.");
    } finally {
      setDeleteTargets([]);
      setIsDeleting(false);
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
    <main className="w-full mx-auto min-h-screen pb-[100px]">
      <div className="px-4 lg:px-6 py-4 lg:py-6 grid gap-4">
        {/* Stats */}
        <section className="bg-surfaceContainer px-4 py-3 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-onSurface m-0">Image Manager</h2>
            <span className="bg-secondaryContainer text-onSecondaryContainer font-bold text-sm px-3 py-1 rounded-full">
              {images.length} Total
            </span>
          </div>

          <div className="flex items-center gap-3">
            {images.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={images.length > 0 && selectedImages.size === images.length}
                  onCheckedChange={toggleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-semibold text-onSurface cursor-pointer select-none"
                >
                  Select All
                </label>
              </div>
            )}
            
            {selectedImages.size > 0 && (
              <button
                type="button"
                onClick={() => setDeleteTargets(Array.from(selectedImages))}
                className="bg-error text-onError px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                Delete Selected ({selectedImages.size})
              </button>
            )}
          </div>
        </section>

        {/* Error Banner */}
        {error ? (
          <section className="bg-errorContainer p-4 rounded-2xl shadow-sm" role="alert">
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
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                className={`bg-surfaceContainerLowest rounded-2xl overflow-hidden shadow-sm border flex flex-col relative transition-all ${
                  selectedImages.has(image.name) ? "border-primary ring-2 ring-primary/20" : "border-outlineVariant/30"
                }`}
                key={image.name}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10 bg-surfaceContainerLowest/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
                  <Checkbox
                    checked={selectedImages.has(image.name)}
                    onCheckedChange={() => toggleSelectImage(image.name)}
                  />
                </div>

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
                    onClick={() => setDeleteTargets([image.name])}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTargets.length > 0} onOpenChange={(open) => !open && !isDeleting && setDeleteTargets([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You are about to permanently delete{" "}
              <strong className="text-onSurface">{deleteTargets.length}</strong> image
              {deleteTargets.length > 1 ? "s" : ""}. This will remove the file
              {deleteTargets.length > 1 ? "s" : ""} from your Supabase storage bucket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void executeDelete();
              }}
              disabled={isDeleting}
              className="bg-error text-onError hover:bg-error/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default AdminImagesPage;
