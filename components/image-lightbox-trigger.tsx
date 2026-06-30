"use client";

import { ExpandIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type ImageLightboxTriggerProps = {
  onActivate: () => void;
  label?: string;
  className?: string;
};

const DEFAULT_LABEL = "មើលរូបភាពពេញអេក្រង់";

const ImageLightboxTrigger = ({
  onActivate,
  label = DEFAULT_LABEL,
  className,
}: ImageLightboxTriggerProps) => {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onActivate();
      }}
      aria-label={label}
      className={cn(
        "absolute right-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        className,
      )}
    >
      <ExpandIcon className="h-5 w-5" />
    </button>
  );
};

export default ImageLightboxTrigger;
