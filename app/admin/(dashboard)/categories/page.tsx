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
    <main className="max-w-[800px] w-full mx-auto min-h-screen pb-[100px]">
      <div className="grid gap-4 px-4 py-4">
        <section className="bg-surfaceContainer px-4 py-3 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-onSurface m-0">Categories</h2>
            <span className="bg-secondaryContainer text-onSecondaryContainer font-bold text-sm px-3 py-1 rounded-full">{categories.length} Total</span>
          </div>
          <Link className="inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-bold text-onPrimary bg-primary hover:bg-primary/90 transition-colors shadow-sm" href="/admin/categories/new">
            + New Category
          </Link>
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
