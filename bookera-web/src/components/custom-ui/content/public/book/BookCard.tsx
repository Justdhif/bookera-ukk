"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarDays, Building2, Eye } from "lucide-react";

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

  const authorNames =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => a.name).join(", ")
      : book.author || null;

  const publisherName =
    book.publishers && book.publishers.length > 0
      ? book.publishers[0].name
      : book.publisher || null;

  const visibleCategories = book.categories?.slice(0, 2) ?? [];

  return (
    <div
      className="border rounded-lg p-3 flex flex-col gap-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Cover */}
      <div className="relative">
        <img
          src={book.cover_image ?? "/placeholder.png"}
          className="aspect-3/4 object-cover rounded w-full"
          alt={book.title}
        />
        {book.total_copies !== undefined && (
          <div className="absolute top-2 right-2">
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
              {book.available_copies || 0}/{book.total_copies}
            </Badge>
          </div>
        )}
      </div>

      {/* Categories */}
      {visibleCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visibleCategories.map((cat) => (
            <Badge
              key={cat.id}
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {cat.name}
            </Badge>
          ))}
          {(book.categories?.length ?? 0) > 2 && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              +{book.categories!.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Title */}
      <div ref={containerRef} className="overflow-hidden">
        <motion.span
          ref={textRef}
          className="font-semibold text-sm whitespace-nowrap inline-block"
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
                pauseDuration + scrollDuration + pauseDuration + returnDuration;
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

      {/* Author */}
      {authorNames && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate">{authorNames}</span>
        </div>
      )}

      {/* Publisher */}
      {publisherName && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{publisherName}</span>
        </div>
      )}

      {/* Year */}
      {book.publication_year && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span>{book.publication_year}</span>
        </div>
      )}

      {/* CTA */}
      <Link href={`/books/${book.slug}`} className="block mt-auto">
        <Button size="sm" variant="outline" className="w-full gap-1">
          <Eye className="h-3.5 w-3.5" />
          {t("detail.detail")}
        </Button>
      </Link>
    </div>
  );
}
