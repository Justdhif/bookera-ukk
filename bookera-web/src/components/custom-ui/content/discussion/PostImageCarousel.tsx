"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscussionPostImage } from "@/types/discussion";

interface Props {
  images: DiscussionPostImage[];
  className?: string;
  fillHeight?: boolean;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function PostImageCarousel({ images, className, fillHeight = false }: Props) {
  const [[current, direction], setPage] = useState([0, 0]);

  if (!images.length) return null;

  const paginate = (newIndex: number) => setPage([newIndex, newIndex > current ? 1 : -1]);
  const prev = () => paginate(current === 0 ? images.length - 1 : current - 1);
  const next = () => paginate(current === images.length - 1 ? 0 : current + 1);

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
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[current].image_path}
              alt={`Gambar ${current + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none z-10">
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}
