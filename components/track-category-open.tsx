"use client";

import { useEffect } from "react";

type TrackCategoryOpenProps = {
  categoryId: string;
};

const TrackCategoryOpen = ({ categoryId }: TrackCategoryOpenProps) => {
  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "category_opened",
        category_id: categoryId,
        device_type: navigator.userAgent
      })
    });
  }, [categoryId]);

  return null;
};

export default TrackCategoryOpen;
