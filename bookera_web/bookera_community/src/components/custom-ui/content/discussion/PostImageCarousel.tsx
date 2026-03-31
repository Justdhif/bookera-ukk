"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DiscussionPostImage } from "@/types/discussion";

type CarouselImage = Pick<DiscussionPostImage, "image_path">;

interface Props {
  images: CarouselImage[];
  className?: string;
  fillHeight?: boolean;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function PostImageCarousel({
  images,
  className,
  fillHeight = false,
  currentIndex,
  onIndexChange,
}: Props) {
  const isControlled = typeof currentIndex === "number";
  const [internalIndex, setInternalIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const current = isControlled ? (currentIndex as number) : internalIndex;
  const safeCurrent = useMemo(() => {
    if (!images.length) return 0;
    return Math.min(Math.max(current, 0), images.length - 1);
  }, [current, images.length]);

  const prevIndexRef = useRef(safeCurrent);

  useEffect(() => {
    if (!isControlled) return;
    const prev = prevIndexRef.current;
    if (prev === safeCurrent) return;
    setDirection(safeCurrent > prev ? 1 : -1);
    prevIndexRef.current = safeCurrent;
  }, [isControlled, safeCurrent]);

  const setIndex = (newIndex: number) => {
    setDirection(newIndex > safeCurrent ? 1 : -1);
    if (onIndexChange) onIndexChange(newIndex);
    if (!isControlled) setInternalIndex(newIndex);
  };

  const paginate = (newIndex: number) => setIndex(newIndex);
  const prev = () => paginate(safeCurrent === 0 ? images.length - 1 : safeCurrent - 1);
  const next = () => paginate(safeCurrent === images.length - 1 ? 0 : safeCurrent + 1);

  useEffect(() => {
    if (!images.length) return;
    if (current < 0) {
      setDirection(0);
      if (onIndexChange) onIndexChange(0);
      if (!isControlled) setInternalIndex(0);
      return;
    }
    if (current >= images.length) {
      const clamped = images.length - 1;
      setDirection(0);
      if (onIndexChange) onIndexChange(clamped);
      if (!isControlled) setInternalIndex(clamped);
    }
  }, [current, images.length, isControlled, onIndexChange]);

  if (!images.length) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black",
        fillHeight ? "h-full w-full" : "rounded-xl",
        className,
      )}
    >
      <div className={fillHeight ? "h-full relative" : "aspect-square md:aspect-4/3 relative"}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={safeCurrent}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[safeCurrent].image_path}
              alt={`Gambar ${safeCurrent + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 700px"
              unoptimized={images[safeCurrent].image_path.startsWith("blob:")}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <>
          <Button
            type="button"
            onClick={prev}
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all z-10"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={next}
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all z-10"
            aria-label="Berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <Button
                key={i}
                type="button"
                onClick={() => paginate(i)}
                variant="ghost"
                className={cn(
                  "min-w-0 p-0 h-1.5 rounded-full transition-all hover:bg-transparent",
                  i === safeCurrent ? "w-4 bg-white" : "w-1.5 bg-white/50",
                )}
                aria-label={`Ke gambar ${i + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none z-10">
            {safeCurrent + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}
