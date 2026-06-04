"use client";

import { SpeakerIcon } from "@/components/icons";
import { speakKhmerLabel } from "@/lib/voice/speak";

type AudioButtonProps = {
  label: string;
  text: string;
  className?: string;
};

const AudioButton = ({ label, text, className = "" }: AudioButtonProps) => {
  return (
    <button
      type="button"
      className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-primary transition-colors hover:bg-surfaceContainerHigh ${className}`}
      aria-label={label}
      onClick={() => speakKhmerLabel(text)}
    >
      <SpeakerIcon />
    </button>
  );
};

export default AudioButton;
