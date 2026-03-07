"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export default function BookCard({ book }: { book: Book }) {
    const t = useTranslations("public");
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const overflow =
        textRef.current.scrollWidth - containerRef.current.clientWidth;
      setScrollOffset(overflow > 0 ? overflow : 0);
    }
  }, [book.title]);

  return (
    <div
      className="border rounded-lg p-3 space-y-3"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative">
        <img
          src={book.cover_image_url ?? "/placeholder.png"}
          className="aspect-3/4 object-cover rounded w-full"
        />
        {book.total_copies !== undefined && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge
              variant={
                book.available_copies && book.available_copies > 0
                  ? "default"
                  : "secondary"
              }
              className={
                book.available_copies && book.available_copies > 0
                  ? "bg-brand-primary hover:bg-brand-primary-dark text-white text-xs"
                  : "text-xs"
              }
            >
              {book.available_copies || 0}/{book.total_copies} {t("available")}
            </Badge>
          </div>
        )}
      </div>

      <div>
        <div ref={containerRef} className="overflow-hidden">
          <motion.span
            ref={textRef}
            className="font-semibold whitespace-nowrap inline-block"
            animate={
              isHovering && scrollOffset > 0
                ? { x: [0, 0, -scrollOffset, -scrollOffset, 0] }
                : { x: 0 }
            }
            transition={(() => {
              if (isHovering && scrollOffset > 0) {
                const scrollDuration = Math.max(1.5, scrollOffset / 50);
                const pauseDuration = 2;
                const returnDuration = Math.max(0.5, scrollDuration * 0.4);
                const total =
                  pauseDuration +
                  scrollDuration +
                  pauseDuration +
                  returnDuration;
                return {
                  duration: total,
                  times: [
                    0,
                    pauseDuration / total,
                    (pauseDuration + scrollDuration) / total,
                    (pauseDuration + scrollDuration + pauseDuration) / total,
                    1,
                  ],
                  ease: ["linear", "linear", "linear", "easeInOut"],
                  repeat: Infinity,
                  repeatType: "loop" as const,
                };
              }
              return { duration: 0.2 };
            })()}
          >
            {book.title}
          </motion.span>
        </div>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </div>

      <Link href={`/books/${book.slug}`} className="block">
        <Button size="sm" variant="outline" className="w-full">
          {t("detail.detail")}
        </Button>
      </Link>
    </div>
  );
}
