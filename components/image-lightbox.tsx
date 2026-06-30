"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export type ImageRef = {
  url: string;
  alt: string;
  title?: string;
};

type ImageLightboxProps = {
  image: ImageRef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ImageLightbox = ({ image, open, onOpenChange }: ImageLightboxProps) => {
  if (!image) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        />
        <Dialog.Content
          aria-describedby={undefined}
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-90 data-[state=closed]:duration-200"
        >
          {image.title ? (
            <Dialog.Title
              onClick={(e) => e.stopPropagation()}
              className="absolute left-6 top-6 z-10 max-w-[70vw] truncate rounded-full bg-black/70 px-5 py-2 text-base font-bold text-white shadow-xl backdrop-blur-md border border-white/15 animate-in fade-in slide-in-from-top-4 duration-500"
            >
              {image.title}
            </Dialog.Title>
          ) : (
            <Dialog.Title className="sr-only">{image.alt}</Dialog.Title>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full w-full max-h-[85vh] max-w-[90vw] items-center justify-center select-none"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="100vw"
              priority
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-300"
            />
          </div>

          <Dialog.Close
            aria-label="Close"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-6 top-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white shadow-xl backdrop-blur-md border border-white/15 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 animate-in fade-in slide-in-from-top-4 duration-500"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ImageLightbox;
