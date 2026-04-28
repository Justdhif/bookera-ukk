"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, XCircle } from "lucide-react";

interface ImageCarouselProps {
  images: { id: number; image_path: string }[];
  aspectRatio?: string;
}

export function LightboxModal({
  images,
  index,
  onClose,
}: {
  images: { id: number; image_path: string }[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const total = images.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current].image_path}
            alt={`Image ${current + 1}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5"
          />
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute -left-4 sm:left-4 top-1/2 -translate-y-1/2 h-14 w-14 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/15 transition-all border border-white/10 backdrop-blur-md group"
            >
              <ChevronLeft className="h-7 w-7 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={next}
              className="absolute -right-4 sm:right-4 top-1/2 -translate-y-1/2 h-14 w-14 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/15 transition-all border border-white/10 backdrop-blur-md group"
            >
              <ChevronRight className="h-7 w-7 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        <div className="absolute top-0 right-0 p-6 flex items-center gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
            <span className="text-white/70 text-[10px] font-black tracking-[0.2em] uppercase">
              {current + 1} / {total}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-1"
          >
            <XCircle className="h-8 w-8" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ImageCarousel({
  images,
  aspectRatio = "16/9",
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const total = images.length;

  if (total === 0) return null;
  if (total === 1) {
    return (
      <div className="relative group">
        <div
          className="relative w-full overflow-hidden rounded-[2rem] border border-muted/30 cursor-zoom-in shadow-2xl transition-all duration-500 group-hover:shadow-brand-primary/5"
          style={{ aspectRatio }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={images[0].image_path}
            alt="carousel image"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        {lightbox && (
          <LightboxModal
            images={images}
            index={0}
            onClose={() => setLightbox(false)}
          />
        )}
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <div className="relative group space-y-4">
      <div
        className="relative w-full overflow-hidden rounded-[2rem] border border-muted/30 shadow-2xl"
        style={{ aspectRatio }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current].image_path}
            alt={`carousel image ${current + 1}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setLightbox(true)}
          />
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="h-12 w-12 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-brand-primary transition-all backdrop-blur-xl border border-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="h-12 w-12 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-brand-primary transition-all backdrop-blur-xl border border-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="absolute bottom-6 right-6 bg-black/30 backdrop-blur-xl text-white text-[10px] font-black px-4 py-2 rounded-full border border-white/10 tracking-[0.2em] shadow-lg">
          {current + 1} / {total}
        </div>
      </div>

      {/* Thumbnails indicator */}
      <div className="flex justify-center gap-2 px-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              current === i
                ? "w-8 bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary),0.5)]"
                : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>

      {lightbox && (
        <LightboxModal
          images={images}
          index={current}
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  );
}
