"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, CategoryInput } from "@/lib/types";

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

  useEffect(() => {
    const load = async () => {
      if (mode !== "edit" || !categoryId) {
        return;
      }

      const token = localStorage.getItem("admin_access_token");
      if (!token) {
        setStatus("Please log in first.");
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

    void load();
  }, [categoryId, mode]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Saving...");

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setStatus("Please log in first.");
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
      return;
    }

    setStatus("Saved.");
    router.push("/admin/categories");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!categoryId) return;
    const confirmed = confirm("Delete this category? If it has recipes, it will be deactivated instead.");
    if (!confirmed) return;

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setStatus("Please log in first.");
      return;
    }

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
  };

  return (
    <div className="mx-auto min-h-screen max-w-[800px] bg-surface pb-[100px]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-surface/90 px-4 backdrop-blur-md">
        <h1 className="m-0 text-xl font-bold text-onSurface">{mode === "create" ? "New Category" : "Edit Category"}</h1>
        <Link className="inline-flex h-10 items-center justify-center rounded-full bg-surfaceContainer px-4 text-sm font-semibold text-primary transition-colors hover:bg-surfaceContainerHigh" href="/admin/categories">
          Back
        </Link>
      </header>

      <form className="px-4 py-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-6 rounded-2xl border border-outlineVariant/30 bg-surfaceContainerLowest p-6 shadow-sm">
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
              <img src={payload.cover_image_url} alt="Category preview" className="mt-2 h-[200px] w-full rounded-xl border border-outlineVariant/30 object-cover" />
            ) : null}
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

          <label className="mt-2 flex cursor-pointer select-none items-center gap-3">
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

          <div className="mt-4 flex flex-col gap-3">
            <button type="submit" className="flex min-h-[56px] w-full items-center justify-center rounded-full bg-primary px-4 text-lg font-bold text-onPrimary shadow-sm transition-transform active:scale-95">
              {mode === "create" ? "Create Category" : "Save Changes"}
            </button>
            {mode === "edit" ? (
              <button type="button" className="flex min-h-[56px] w-full items-center justify-center rounded-full bg-errorContainer px-4 text-lg font-bold text-error shadow-sm transition-transform active:scale-95" onClick={() => void handleDelete()}>
                Delete or Deactivate
              </button>
            ) : null}
          </div>

          {status ? (
            <p className="mt-2 text-center text-sm font-semibold text-onSurfaceVariant" aria-live="polite">
              {status}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
};
