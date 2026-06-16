"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { MEAL_SLOT_VALUES, type Category, type MealSlot } from "@/lib/types";
import { getAdminToken } from "@/lib/admin-auth";

type StorageImage = {
  name: string;
  public_url: string;
};

type CsvRow = {
  title_km: string;
  image_filename: string;
  youtube_url: string;
  category_slug: string;
  meal_slot: string;
  duration_minutes: string;
};

type ValidatedRow = CsvRow & {
  rowIndex: number;
  isValid: boolean;
  errors: string[];
};

type ImportResult = {
  created: number;
  errors: { row: number; message: string }[];
};

const VALID_MEAL_SLOTS: readonly string[] = MEAL_SLOT_VALUES;

const AdminImportPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageNames, setImageNames] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = (): string | null => {
    const token = getAdminToken();
    if (!token) {
      setParseError("Please log in first.");
      return null;
    }
    return token;
  };

  // Load categories and image names for validation
  const loadDependencies = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoadingDeps(false);
        return;
      }

      const [catRes, imgRes] = await Promise.all([
        fetch("/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/images", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (catRes.ok) {
        const catJson = (await catRes.json()) as { data: Category[] };
        setCategories(catJson.data);
      } else {
        setParseError(`Failed to load categories (${catRes.status}). ${catRes.status === 401 ? "Please log in again." : "Please try again."}`);
        setLoadingDeps(false);
        return;
      }

      if (imgRes.ok) {
        const imgJson = (await imgRes.json()) as { data: StorageImage[] };
        setImageNames(new Set(imgJson.data.map((img) => img.name)));
      } else {
        setParseError(`Failed to load images (${imgRes.status}). ${imgRes.status === 401 ? "Please log in again." : "Please try again."}`);
        setLoadingDeps(false);
        return;
      }
    } catch {
      setParseError("Failed to load categories or images.");
    } finally {
      setLoadingDeps(false);
    }
  }, []);

  useEffect(() => {
    loadDependencies().catch(() => {});
  }, [loadDependencies]);

  const validateRow = (raw: CsvRow, index: number): ValidatedRow => {
    const errors: string[] = [];

    if (!raw.title_km || raw.title_km.trim().length === 0) {
      errors.push("Title is required");
    }

    if (!raw.image_filename || raw.image_filename.trim().length === 0) {
      errors.push("Image filename is required");
    } else if (!imageNames.has(raw.image_filename.trim())) {
      errors.push(`Image "${raw.image_filename}" not found in storage`);
    }

    if (!raw.category_slug || raw.category_slug.trim().length === 0) {
      errors.push("Category slug is required");
    } else {
      const found = categories.some((c) => c.slug === raw.category_slug.trim());
      if (!found) {
        errors.push(`Category "${raw.category_slug}" not found`);
      }
    }

    if (raw.meal_slot && raw.meal_slot.trim().length > 0) {
      if (!VALID_MEAL_SLOTS.includes(raw.meal_slot.trim())) {
        errors.push(`Invalid meal slot "${raw.meal_slot}". Must be: ${VALID_MEAL_SLOTS.join(", ")}`);
      }
    }

    if (raw.youtube_url && raw.youtube_url.trim().length > 0) {
      try {
        const url = new URL(raw.youtube_url.trim());
        if (!url.hostname.includes("youtube.com") && !url.hostname.includes("youtu.be")) {
          errors.push("YouTube URL must be from youtube.com or youtu.be");
        }
      } catch {
        errors.push("Invalid YouTube URL format");
      }
    }

    if (raw.duration_minutes && raw.duration_minutes.trim().length > 0) {
      const trimmed = raw.duration_minutes.trim();
      if (!/^\d+$/.test(trimmed)) {
        errors.push("Duration must be a positive integer (digits only)");
      } else {
        const num = parseInt(trimmed, 10);
        if (num < 1) {
          errors.push("Duration must be a positive integer");
        }
      }
    }

    return {
      ...raw,
      rowIndex: index + 1,
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParseError("");
    setImportResult(null);
    setRows([]);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(
            `CSV parsing errors:\n${results.errors.map((e) => `Row ${e.row}: ${e.message}`).join("\n")}`
          );
          return;
        }

        if (results.data.length === 0) {
          setParseError("CSV file is empty — no data rows found.");
          return;
        }

        // Validate required headers
        const headers = Object.keys(results.data[0] ?? {});
        const required = ["title_km", "image_filename", "category_slug"];
        const missing = required.filter((h) => !headers.includes(h));
        if (missing.length > 0) {
          setParseError(`Missing required columns: ${missing.join(", ")}`);
          return;
        }

        const validated = results.data.map((raw, i) => validateRow(raw, i));
        setRows(validated);
      },
      error: (err) => {
        setParseError(`Failed to parse CSV: ${err.message}`);
      },
    });

    // Reset input
    event.target.value = "";
  };

  const validCount = rows.filter((r) => r.isValid).length;
  const errorCount = rows.filter((r) => !r.isValid).length;
  const canImport = validCount > 0 && !importing;

  const handleImport = async () => {
    const token = getToken();
    if (!token) return;

    setImporting(true);
    setImportResult(null);

    try {
      // Build the import payload from validated rows
      const importRows = rows
        .filter((r) => r.isValid)
        .map((r) => ({
          title_km: r.title_km.trim(),
          image_filename: r.image_filename.trim(),
          youtube_url: r.youtube_url?.trim() ?? "",
          category_slug: r.category_slug.trim(),
          meal_slot: (r.meal_slot?.trim() as MealSlot) || "any",
          duration_minutes: r.duration_minutes?.trim() && /^\d+$/.test(r.duration_minutes.trim())
            ? parseInt(r.duration_minutes.trim(), 10)
            : undefined,
        }));

      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows: importRows }),
      });

      if (!response.ok) {
        const json = (await response.json()) as { error?: { message?: string } };
        setParseError(json.error?.message ?? "Import failed.");
        return;
      }

      const json = (await response.json()) as { data: ImportResult };
      setImportResult(json.data);
    } catch {
      setParseError("Network error during import.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <main className="w-full mx-auto min-h-screen pb-[100px]">
      <div className="px-4 lg:px-6 py-4 lg:py-6 grid gap-4">
        {/* Title */}
        <section className="bg-surfaceContainer px-4 py-3 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-onSurface m-0">Bulk Import</h2>
        </section>
        {/* Step 1 Banner */}
        <Link
          href="/admin/images"
          className="bg-primaryFixed p-4 rounded-2xl shadow-sm flex items-center justify-between hover:bg-primaryFixedDim transition-colors group"
        >
          <div>
            <p className="text-onPrimaryFixed font-bold text-base m-0">Step 1: Upload Images First</p>
            <p className="text-onPrimaryFixedVariant text-sm m-0 mt-1">
              Upload recipe photos before importing CSV data.
              {imageNames.size > 0 ? ` (${imageNames.size} images available)` : ""}
            </p>
          </div>
          <span className="text-onPrimaryFixed text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        {/* CSV Upload */}
        <section className="bg-surfaceContainerLowest p-6 rounded-2xl shadow-sm border border-outlineVariant/30">
          <h2 className="text-lg font-bold text-onSurface mb-1 m-0">Step 2: Upload CSV File</h2>
          <p className="text-onSurfaceVariant text-sm mb-4 m-0">
            Required columns: <code className="bg-surfaceContainer px-1 py-0.5 rounded text-xs">title_km</code>,{" "}
            <code className="bg-surfaceContainer px-1 py-0.5 rounded text-xs">image_filename</code>,{" "}
            <code className="bg-surfaceContainer px-1 py-0.5 rounded text-xs">category_slug</code>
            <br />
            Optional: <code className="bg-surfaceContainer px-1 py-0.5 rounded text-xs">youtube_url</code>,{" "}
            <code className="bg-surfaceContainer px-1 py-0.5 rounded text-xs">meal_slot</code>,{" "}
            <code className="bg-surfaceContainer px-1 py-0.5 rounded text-xs">duration_minutes</code>
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loadingDeps}
            className="w-full bg-primary text-onPrimary font-bold rounded-full min-h-[56px] text-lg px-4 flex items-center justify-center transition-transform active:scale-95 shadow-sm disabled:opacity-50"
          >
            {loadingDeps ? "Loading..." : "Choose CSV File"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="sr-only"
            aria-label="Choose CSV file to import"
          />
        </section>

        {/* Error Banner */}
        {parseError ? (
          <section className="bg-errorContainer p-4 rounded-2xl shadow-sm" role="alert">
            <p className="text-error font-bold m-0 whitespace-pre-line">{parseError}</p>
            <button
              type="button"
              onClick={() => setParseError("")}
              className="text-error/70 text-sm font-semibold mt-2 underline"
            >
              Dismiss
            </button>
          </section>
        ) : null}

        {/* Import Result */}
        {importResult ? (
          <section className="bg-secondaryContainer p-4 rounded-2xl shadow-sm">
            <p className="text-onSecondaryContainer font-bold text-lg m-0">
              ✅ Import Complete
            </p>
            <p className="text-onSecondaryContainer font-semibold mt-2 m-0">
              Created {importResult.created} recipe{importResult.created !== 1 ? "s" : ""} successfully.
            </p>
            {importResult.errors.length > 0 ? (
              <div className="mt-3 bg-errorContainer/50 p-3 rounded-xl">
                <p className="text-error font-bold text-sm m-0">
                  {importResult.errors.length} row{importResult.errors.length !== 1 ? "s" : ""} skipped:
                </p>
                <ul className="mt-1 ml-4 list-disc">
                  {importResult.errors.map((e) => (
                    <li key={e.row} className="text-error text-sm">
                      Row {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex gap-3 mt-4">
              <Link
                href="/admin/recipes"
                className="flex-1 text-center font-bold text-primary bg-surfaceContainerLowest px-4 py-2.5 rounded-xl transition-colors"
              >
                View Recipes
              </Link>
              <button
                type="button"
                onClick={() => {
                  setImportResult(null);
                  setRows([]);
                }}
                className="flex-1 text-center font-bold text-onSecondaryContainer bg-secondaryFixedDim px-4 py-2.5 rounded-xl transition-colors"
              >
                Import More
              </button>
            </div>
          </section>
        ) : null}

        {/* Preview Table */}
        {rows.length > 0 && !importResult ? (
          <>
            {/* Summary Stats */}
            <section className="bg-surfaceContainer px-4 py-3 rounded-2xl flex justify-between items-center shadow-sm flex-wrap gap-2">
              <h2 className="text-base font-bold text-onSurface m-0">Preview ({rows.length} rows)</h2>
              <div className="flex gap-2">
                <span className="bg-secondaryContainer text-onSecondaryContainer font-bold text-sm px-3 py-1 rounded-full">
                  {validCount} Valid
                </span>
                {errorCount > 0 ? (
                  <span className="bg-errorContainer text-error font-bold text-sm px-3 py-1 rounded-full">
                    {errorCount} Errors
                  </span>
                ) : null}
              </div>
            </section>

            {/* Data Table */}
            <section className="bg-surfaceContainerLowest rounded-2xl shadow-sm border border-outlineVariant/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surfaceContainer text-onSurface">
                      <th className="px-3 py-3 text-left font-bold">#</th>
                      <th className="px-3 py-3 text-left font-bold">Title</th>
                      <th className="px-3 py-3 text-left font-bold">Image</th>
                      <th className="px-3 py-3 text-left font-bold">Category</th>
                      <th className="px-3 py-3 text-left font-bold">Meal</th>
                      <th className="px-3 py-3 text-left font-bold">YouTube</th>
                      <th className="px-3 py-3 text-left font-bold">Min</th>
                      <th className="px-3 py-3 text-center font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.rowIndex}
                        className={`border-t border-outlineVariant/20 ${
                          row.isValid
                            ? "hover:bg-surfaceContainerLow"
                            : "bg-errorContainer/20"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-onSurfaceVariant font-semibold">{row.rowIndex}</td>
                        <td className="px-3 py-2.5 text-onSurface font-semibold max-w-[160px] truncate">
                          {row.title_km || <span className="text-error italic">empty</span>}
                        </td>
                        <td className="px-3 py-2.5 text-onSurfaceVariant max-w-[120px] truncate">
                          {row.image_filename || <span className="text-error italic">empty</span>}
                        </td>
                        <td className="px-3 py-2.5 text-onSurfaceVariant">{row.category_slug || "—"}</td>
                        <td className="px-3 py-2.5 text-onSurfaceVariant">{row.meal_slot || "any"}</td>
                        <td className="px-3 py-2.5 text-onSurfaceVariant max-w-[80px] truncate">
                          {row.youtube_url ? "✓" : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-onSurfaceVariant">{row.duration_minutes || "—"}</td>
                        <td className="px-3 py-2.5 text-center">
                          {row.isValid ? (
                            <span className="text-secondary font-bold text-base" title="Valid">✅</span>
                          ) : (
                            <span
                              className="text-error font-bold text-base cursor-help"
                              title={row.errors.join("; ")}
                            >
                              ❌
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Error Details */}
            {errorCount > 0 ? (
              <section className="bg-errorContainer/30 p-4 rounded-2xl border border-error/20">
                <h3 className="text-error font-bold text-base mb-2 m-0">Row Errors</h3>
                <div className="flex flex-col gap-1">
                  {rows
                    .filter((r) => !r.isValid)
                    .map((r) => (
                      <p key={r.rowIndex} className="text-error text-sm m-0">
                        <strong>Row {r.rowIndex}:</strong> {r.errors.join("; ")}
                      </p>
                    ))}
                </div>
              </section>
            ) : null}

            {/* Import Button */}
            <button
              type="button"
              onClick={() => { handleImport().catch(() => {}); }}
              disabled={!canImport}
              className="w-full bg-primary text-onPrimary font-bold rounded-full min-h-[56px] text-lg px-4 flex items-center justify-center transition-transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing
                ? `Importing ${validCount} recipe${validCount !== 1 ? "s" : ""}...`
                : `Import ${validCount} Valid Recipe${validCount !== 1 ? "s" : ""}`}
            </button>
          </>
        ) : null}
      </div>
    </main>
  );
};

export default AdminImportPage;
