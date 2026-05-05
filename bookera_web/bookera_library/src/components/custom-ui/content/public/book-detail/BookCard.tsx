"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Bookmark, CalendarDays, Building2, Star, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import DetailButton from "@/components/custom-ui/button/DetailButton";

export interface BookCardProps {
  book: Book;
  size?: "sm" | "md";
  showCheckbox?: boolean;
  isChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

import { FadeUp } from "@/components/custom-ui/motion";

export default function BookCard({
  book,
  size = "md",
  showCheckbox = false,
  isChecked = false,
  onCheckedChange,
}: BookCardProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const isSmall = size === "sm";

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

  const visibleCategories = book.categories?.slice(0, isSmall ? 1 : 2) ?? [];
  const genreNames =
    book.genres && book.genres.length > 0
      ? book.genres.map((genre) => genre.name).join(", ")
      : null;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onCheckedChange) {
      onCheckedChange(!isChecked);
    }
  };

  return (
    <FadeUp>
      <div
        className={cn(
          "border rounded-lg flex flex-col relative transition-colors duration-200 hover:border-border h-full",
          isSmall ? "p-2 gap-1.5 w-[160px]" : "p-3 gap-2",
          showCheckbox && onCheckedChange && "cursor-pointer",
          isChecked ? "border-brand-primary bg-brand-primary/5" : "border-border",
        )}
        onClick={() => {
          if (showCheckbox && onCheckedChange) {
            onCheckedChange(!isChecked);
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        role={showCheckbox && onCheckedChange ? "button" : undefined}
        tabIndex={showCheckbox && onCheckedChange ? 0 : undefined}
      >
        {showCheckbox && (
          <div
            className={cn(
              "absolute z-10 flex items-center justify-center cursor-pointer",
              isSmall ? "top-3 left-3" : "top-5 left-5"
            )}
            onClick={handleCheckboxClick}
          >
            <Checkbox
              checked={isChecked}
              variant="circle"
              className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary pointer-events-none"
            />
          </div>
        )}
        <div className="relative group overflow-hidden rounded-lg">
          <Image
            src={book.cover_image ?? "/placeholder.png"}
            className="aspect-3/4 object-cover rounded w-full transition-transform duration-500 group-hover:scale-105"
            alt={book.title}
            width={isSmall ? 160 : 300}
            height={isSmall ? 213 : 400}
            unoptimized
          />
          
          {/* Available Copies Badge */}
          <div className={cn("absolute z-20", isSmall ? "top-1 right-1" : "top-2 right-2")}>
            <Badge
              variant="default"
              className={cn(
                "px-1.5 py-0 h-auto font-bold shadow-lg border-none backdrop-blur-md",
                isSmall ? "text-[8px]" : "text-[10px]",
                (book.available_copies ?? 0) > 0
                  ? "bg-emerald-500/90 text-white"
                  : "bg-rose-500/90 text-white"
              )}
            >
              {(book.available_copies ?? 0) > 0 ? (
                <div className="flex items-center gap-1">
                  <span>{book.available_copies}</span>
                  <span className="opacity-80 font-medium ml-0.5">{isSmall ? "" : tCommon("available")}</span>
                </div>
              ) : (
                isSmall ? "X" : t("outOfStock")
              )}
            </Badge>
          </div>
          {visibleCategories.length > 0 && (
            <div className={cn("absolute z-10 flex max-w-[calc(100%-1rem)] flex-wrap gap-1", isSmall ? "bottom-1 left-1" : "bottom-2 left-2")}>
              {visibleCategories.map((cat) => (
                <Badge
                  key={`category-${cat.id}`}
                  variant="default"
                  className={cn("px-1.5 py-0 h-4 font-normal shadow-sm backdrop-blur-sm", isSmall ? "text-[8px]" : "text-[10px]")}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div ref={containerRef} className="overflow-hidden">
          <motion.span
            ref={textRef}
            className={cn("font-semibold whitespace-nowrap inline-block", isSmall ? "text-xs" : "text-sm")}
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
        {genreNames && (
          <div className={cn("flex items-center gap-1 text-muted-foreground", isSmall ? "text-[10px]" : "text-xs")}>
            <Bookmark className={cn("shrink-0", isSmall ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span className="truncate">{genreNames}</span>
          </div>
        )}
        {authorNames && (
          <div className={cn("flex items-center gap-1 text-muted-foreground", isSmall ? "text-[10px]" : "text-xs")}>
            <BookOpen className={cn("shrink-0", isSmall ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span className="truncate">{authorNames}</span>
          </div>
        )}
        {publisherName && (
          <div className={cn("flex items-center gap-1 text-muted-foreground", isSmall ? "text-[10px]" : "text-xs")}>
            <Building2 className={cn("shrink-0", isSmall ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span className="truncate">{publisherName}</span>
          </div>
        )}
        {book.publication_year && (
          <div className={cn("flex items-center gap-1 text-muted-foreground", isSmall ? "text-[10px]" : "text-xs")}>
            <CalendarDays className={cn("shrink-0", isSmall ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span>{book.publication_year}</span>
          </div>
        )}
        <div className={cn("mt-auto flex flex-col pt-2", isSmall ? "gap-2" : "gap-3")}>
          <div className={cn("flex items-center justify-between border-t border-border", isSmall ? "pt-2" : "pt-3")}>
            {!isSmall && (
              <div className="flex items-center">
                <AvatarGroup>
                  {book.reviews && book.reviews.length > 0 ? (
                    book.reviews.slice(0, 3).map((review) => (
                      <Avatar 
                        key={review.id} 
                        size="sm"
                        className="border-2 border-background shadow-sm"
                      >
                        <AvatarImage 
                          src={review.user?.profile?.avatar} 
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-muted text-[8px] font-bold">
                          {review.user?.profile?.full_name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  ) : (
                    <Avatar size="sm" className="border-2 border-background bg-muted flex items-center justify-center">
                      <AvatarFallback className="text-[10px] text-muted-foreground">?</AvatarFallback>
                    </Avatar>
                  )}
                  {book.reviews && book.reviews.length > 3 && (
                    <AvatarGroupCount className="size-6 text-[8px]">
                      +{book.reviews.length - 3}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
                <span className="text-[10px] text-muted-foreground ml-2">
                  {book.reviews_count || 0} {t("reviewsTotal")}
                </span>
              </div>
            )}
            <div className={cn("flex items-center gap-2 font-bold text-foreground", isSmall ? "text-[10px] w-full justify-end" : "text-xs")}>
              <div className="flex items-center gap-1">
                <Star className={cn("fill-yellow-400 text-yellow-400", isSmall ? "h-2.5 w-2.5" : "h-3 w-3")} />
                <span>{book.average_rating ? Number(book.average_rating).toFixed(1) : "0.0"}</span>
              </div>
            </div>
          </div>
          <Link href={`/books/${book.slug}`} onClick={(e) => e.stopPropagation()}>
            <DetailButton 
              label={t("detail.detail")} 
              className={cn("w-full gap-1", isSmall ? "h-7 text-[10px]" : "h-8")} 
            />
          </Link>
        </div>
      </div>
    </FadeUp>
  );
}
