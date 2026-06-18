"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MealPicker = dynamic(() => import("@/components/meal-picker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-outlineVariant/20 bg-surfaceContainer p-5 shadow-sm">
      <div className="grid gap-4">
        <Skeleton className="mx-auto h-8 w-48 rounded-md" />
        <Skeleton className="mx-auto h-5 w-64 rounded-md" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-[92px] rounded-2xl" />
          <Skeleton className="h-[92px] rounded-2xl" />
          <Skeleton className="h-[92px] rounded-2xl" />
        </div>
        <Skeleton className="h-[64px] rounded-full" />
      </div>
    </div>
  ),
});

export default MealPicker;
