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
import { BookOpen, CalendarDays, Building2, Eye, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface BookCardProps {
  book: Book;
  showCheckbox?: boolean;
  isChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export default function BookCard({
  book,
  showCheckbox = false,
  isChecked = false,
  onCheckedChange,
}: BookCardProps) {
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

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onCheckedChange) {
      onCheckedChange(!isChecked);
    }
  };

  return (
    <div
      className={cn(
        "border rounded-lg p-3 flex flex-col gap-2 relative transition-colors duration-200 hover:border-border",
        isChecked ? "border-brand-primary bg-brand-primary/5" : "border-border",
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {showCheckbox && (
        <div
          className="absolute top-5 left-5 z-10 bg-background/90 rounded-[4px] shadow-sm flex items-center justify-center p-0.5 cursor-pointer"
          onClick={handleCheckboxClick}
        >
          <Checkbox
            checked={isChecked}
            className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary pointer-events-none"
          />
        </div>
      )}
      <div className="relative">
        <Image
          src={book.cover_image ?? "/placeholder.png"}
          className="aspect-3/4 object-cover rounded w-full"
          alt={book.title}
          width={300}
          height={400}
          unoptimized
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
      {visibleCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visibleCategories.map((cat) => (
            <Badge
              key={cat.id}
              variant="default"
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
      {authorNames && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate">{authorNames}</span>
        </div>
      )}
      {publisherName && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{publisherName}</span>
        </div>
      )}
      {book.publication_year && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span>{book.publication_year}</span>
        </div>
      )}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between border-t border-border pt-3">
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
          <div className="flex items-center gap-1 text-xs font-bold text-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {book.average_rating ? Number(book.average_rating).toFixed(1) : "0.0"}
          </div>
        </div>
        <Link href={`/books/${book.slug}`} className="block">
          <Button size="sm" variant="outline" className="w-full gap-1">
            <Eye className="h-3.5 w-3.5" />
            {t("detail.detail")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
