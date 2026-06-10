"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("admin_access_token");
      if (!token) {
        setError("Please log in first.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          setError("Failed to load categories.");
          return;
        }
        const json = (await response.json()) as { data: Category[] };
        setCategories(json.data);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-[800px] bg-surface pb-[100px]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-surface/90 px-4 backdrop-blur-md">
        <h1 className="m-0 text-xl font-bold text-onSurface">Admin Categories</h1>
        <div className="flex gap-2 flex-wrap justify-end">
          <Link className="inline-flex h-10 items-center justify-center rounded-full bg-surfaceContainer px-4 text-sm font-semibold text-primary transition-colors hover:bg-surfaceContainerHigh" href="/admin/recipes">
            Recipes
          </Link>
          <Link className="inline-flex h-10 items-center justify-center rounded-full bg-surfaceContainer px-4 text-sm font-semibold text-primary transition-colors hover:bg-surfaceContainerHigh" href="/admin/images">
            Images
          </Link>
          <Link className="inline-flex h-10 items-center justify-center rounded-full bg-surfaceContainer px-4 text-sm font-semibold text-primary transition-colors hover:bg-surfaceContainerHigh" href="/admin/import">
            Import
          </Link>
          <Link className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-onPrimary shadow-sm transition-colors hover:bg-primary/90" href="/admin/categories/new">
            + New
          </Link>
        </div>
      </header>

      <div className="grid gap-4 px-4 py-4">
        <section className="flex items-center justify-between rounded-2xl bg-surfaceContainer px-4 py-3 shadow-sm">
          <h2 className="m-0 text-lg font-bold text-onSurface">Manage Categories</h2>
          <span className="rounded-full bg-secondaryContainer px-3 py-1 text-sm font-bold text-onSecondaryContainer">{categories.length} Total</span>
        </section>

        {error ? (
          <section className="rounded-2xl bg-errorContainer p-4 shadow-sm">
            <p className="m-0 font-bold text-error">{error}</p>
          </section>
        ) : null}

        {loading ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div className="rounded-2xl bg-surfaceContainerLow p-4 shadow-sm" key={i}>
                <div className="mb-3 h-[150px] w-full animate-pulse rounded-xl bg-surfaceContainerHighest" />
                <div className="h-6 w-3/4 animate-pulse rounded-md bg-surfaceContainerHighest" />
              </div>
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <article className="overflow-hidden rounded-2xl border border-outlineVariant/30 bg-surfaceContainerLowest shadow-sm" key={category.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.cover_image_url} alt={category.name_km} className="h-[150px] w-full object-cover" />
                <div className="grid gap-3 p-4">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-onSurface">{category.name_km}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-surfaceContainer px-2 py-1 text-xs font-semibold text-onSurfaceVariant">{category.slug}</span>
                      <span className="rounded-md bg-surfaceContainer px-2 py-1 text-xs font-semibold text-onSurfaceVariant">Order {category.display_order}</span>
                      {!category.is_active ? (
                        <span className="rounded-md bg-errorContainer px-2 py-1 text-xs font-bold text-error">Inactive</span>
                      ) : null}
                    </div>
                  </div>
                  <Link className="mt-2 rounded-xl bg-surfaceContainerHighest px-4 py-3 text-center font-bold text-primary transition-colors hover:bg-surfaceContainerHigh" href={`/admin/categories/${category.id}/edit`}>
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminCategoriesPage;
