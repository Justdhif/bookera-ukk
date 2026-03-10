"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscussionPostImage } from "@/types/discussion";

interface Props {
  images: DiscussionPostImage[];
}

export default function PostImagesCarousel({ images }: Props) {
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL ?? "";

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-muted">
      {/* Image */}
      <div className="relative w-full aspect-square sm:aspect-4/3">
        <Image
          src={`${storageUrl}/${images[current].image_path}`}
          alt={`Post image ${current + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
          priority={current === 0}
        />
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
