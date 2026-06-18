"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, CategoryInput } from "@/lib/types";
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

type CategoryFormProps = {
  mode: "create" | "edit";
  categoryId?: string;
};

const defaultPayload: CategoryInput = {
  slug: "",
  name_km: "",
  cover_image_url: "",
  display_order: 0,
  is_active: true
};

export const CategoryForm = ({ mode, categoryId }: CategoryFormProps) => {
  const router = useRouter();
  const [payload, setPayload] = useState<CategoryInput>(defaultPayload);
  const [status, setStatus] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (mode !== "edit" || !categoryId) {
        return;
      }

      const token = getAdminToken();
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        setStatus("Category not found");
        return;
      }
      const json = (await response.json()) as { data: Category[] };
      const category = json.data.find((item) => item.id === categoryId);
      if (!category) {
        setStatus("Category not found");
        return;
      }
      setPayload({
        slug: category.slug,
        name_km: category.name_km,
        cover_image_url: category.cover_image_url,
        display_order: category.display_order,
        is_active: category.is_active
      });
    };

    load().catch(() => {});
  }, [categoryId, mode, router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Saving...");

    const token = getAdminToken();
    if (!token) {
      setStatus("Please log in first.");
      setIsSubmitting(false);
      return;
    }

    const endpoint = mode === "create" ? "/api/admin/categories" : `/api/admin/categories/${categoryId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const json = (await response.json()) as { error?: { message?: string } };
      setStatus(json.error?.message ?? "Unable to save.");
      setIsSubmitting(false);
      return;
    }

    setStatus("Saved.");
    router.push("/admin/categories");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!categoryId) return;

    setIsDeleting(true);
    const token = getAdminToken();
    if (!token) {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      router.push("/admin/login");
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        setStatus("Failed to delete category.");
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    } catch {
      setStatus("Network error during delete.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen bg-surface pb-[100px]">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 bg-white/90 px-6 backdrop-blur-md">
        <Link className="inline-flex h-10 w-10 items-center justify-center rounded-full text-onSurfaceVariant hover:text-onSurface hover:bg-surfaceContainerHigh transition-colors" href="/admin/categories" aria-label="Back">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="m-0 text-xl font-bold text-onSurface">{mode === "create" ? "New Category" : "Edit Category"}</h1>
      </header>

      <form className="px-6 py-6" onSubmit={onSubmit}>
        <div className="flex flex-col gap-8 rounded-2xl border border-outlineVariant bg-surfaceContainerLowest p-6 lg:p-8 shadow-sm">
          {/* Name — full width */}
          <div className="flex flex-col gap-2">
            <label htmlFor="category-name" className="admin-label">Khmer name</label>
            <input
              id="category-name"
              name="name_km"
              autoComplete="off"
              value={payload.name_km}
              onChange={(event) => setPayload({ ...payload, name_km: event.target.value })}
              required
              className="admin-input"
            />
          </div>

          {/* 2-column grid for metadata fields on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="category-slug" className="admin-label">Slug</label>
              <input
                id="category-slug"
                name="slug"
                autoComplete="off"
                spellCheck={false}
                placeholder="soup"
                value={payload.slug}
                onChange={(event) => setPayload({ ...payload, slug: event.target.value.toLowerCase() })}
                required
                className="admin-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="category-order" className="admin-label">Display order</label>
              <input
                id="category-order"
                name="display_order"
                type="number"
                inputMode="numeric"
                min={0}
                value={payload.display_order}
                onChange={(event) => setPayload({ ...payload, display_order: Number(event.target.value) })}
                className="admin-input"
              />
            </div>
          </div>

          {/* Cover image — full width with constrained preview */}
          <div className="flex flex-col gap-2">
            <label htmlFor="category-cover" className="admin-label">Cover image URL</label>
            <input
              id="category-cover"
              name="cover_image_url"
              type="url"
              inputMode="url"
              autoComplete="off"
              value={payload.cover_image_url}
              onChange={(event) => setPayload({ ...payload, cover_image_url: event.target.value })}
              required
              className="admin-input"
            />
            {payload.cover_image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={payload.cover_image_url} alt="Category preview" className="mt-2 h-[200px] lg:h-[240px] w-full lg:max-w-md rounded-xl border border-outlineVariant object-cover" />
            ) : null}
          </div>

          {/* Active toggle */}
          <label className="flex cursor-pointer select-none items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={payload.is_active}
                onChange={(event) => setPayload({ ...payload, is_active: event.target.checked })}
                className="sr-only"
              />
              <div className={`block h-8 w-14 rounded-full transition-colors ${payload.is_active ? "bg-primary" : "border-2 border-outlineVariant bg-surfaceContainerHighest"}`} />
              <div className={`absolute left-1.5 top-1.5 h-5 w-5 rounded-full bg-white transition-transform ${payload.is_active ? "translate-x-6" : ""}`} />
            </div>
            <span className="font-bold text-onSurface">Active</span>
          </label>

          {/* Action buttons — side by side on desktop */}
          <div className="mt-2 flex flex-col lg:flex-row gap-3">
            <button type="submit" disabled={isSubmitting} className="flex min-h-[48px] lg:min-h-[44px] w-full lg:w-auto lg:min-w-[200px] items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-onPrimary shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Category" : "Save Changes"}
            </button>
            {mode === "edit" ? (
              <button type="button" className="flex min-h-[48px] lg:min-h-[44px] w-full lg:w-auto lg:min-w-[200px] items-center justify-center rounded-full bg-errorContainer px-6 text-base font-bold text-error shadow-sm transition-transform active:scale-95" onClick={() => setShowDeleteDialog(true)}>
                Delete or Deactivate
              </button>
            ) : null}
          </div>

          {status ? (
            <p className="mt-2 text-center lg:text-left text-sm font-semibold text-onSurfaceVariant" aria-live="polite" role="alert">
              {status}
            </p>
          ) : null}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && !isDeleting && setShowDeleteDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete or deactivate this category. If it has recipes, it will be deactivated instead of deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete().catch(() => {});
              }}
              disabled={isDeleting}
              className="bg-error text-onError hover:bg-error/90"
            >
              {isDeleting ? "Processing..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
