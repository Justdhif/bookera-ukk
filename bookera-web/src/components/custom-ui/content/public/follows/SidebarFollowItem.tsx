"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronRight, User2, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FollowedAuthor, FollowedPublisher } from "@/types/follow";

type FollowItem = FollowedAuthor | FollowedPublisher;

interface SidebarFollowItemProps {
  item: FollowItem;
  type: "author" | "publisher";
}

export default function SidebarFollowItem({
  item,
  type,
}: SidebarFollowItemProps) {
  const t = useTranslations("public");
  const href = type === "author" ? `/follows/authors/${item.slug}` : `/follows/publishers/${item.slug}`;
  const FallbackIcon = type === "author" ? User2 : Building2;

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const overflow = textRef.current.scrollWidth - containerRef.current.clientWidth;
      setScrollOffset(overflow > 0 ? overflow : 0);
    }
  }, [item.name]);

  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-xl p-2.5 transition-all bg-muted/40 dark:bg-white/8 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 border border-border dark:border-white/10 hover:border-brand-primary/30 dark:hover:border-brand-primary/30 hover:shadow-sm"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="w-12 h-12 rounded-full shrink-0 shadow-sm ring-1 ring-border dark:ring-white/15 overflow-hidden bg-muted flex items-center justify-center">
        <img
          src={item.photo}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div ref={containerRef} className="overflow-hidden">
          <motion.span
            ref={textRef}
            className="font-medium text-foreground dark:text-white text-[13px] whitespace-nowrap inline-block leading-snug"
            animate={
              isHovering && scrollOffset > 0
                ? { x: [0, 0, -scrollOffset, -scrollOffset, 0] }
                : { x: 0 }
            }
            transition={(() => {
              if (isHovering && scrollOffset > 0) {
                const scrollDuration = Math.max(1.5, scrollOffset / 50);
                const pauseDuration = 1.5;
                const returnDuration = Math.max(0.5, scrollDuration * 0.4);
                const total = pauseDuration + scrollDuration + pauseDuration + returnDuration;
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
            {item.name}
          </motion.span>
        </div>
        <p className="text-[11px] text-muted-foreground dark:text-white/55">
          {item.books_count} {item.books_count === 1 ? t("book") : t("books")}
        </p>
      </div>

      <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-3.5 w-3.5 text-brand-primary dark:text-brand-primary-light" />
      </div>
    </Link>
  );
}

interface CollapsedFollowItemProps {
  item: FollowItem;
  type: "author" | "publisher";
}

export function CollapsedFollowItem({ item, type }: CollapsedFollowItemProps) {
  const t = useTranslations("public");
  const href = type === "author" ? `/follows/authors/${item.slug}` : `/follows/publishers/${item.slug}`;
  const FallbackIcon = type === "author" ? User2 : Building2;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className="w-10 h-10 rounded-full overflow-hidden shrink-0 block hover:ring-2 hover:ring-primary transition-all bg-muted"
        >
          <img
              src={item.photo}
              alt={item.name}
              className="w-full h-full object-cover"
            />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex flex-col gap-1 py-2">
        <p className="font-semibold text-sm">{item.name}</p>
        <p className="text-xs text-primary-foreground/75">
          {item.books_count} {item.books_count === 1 ? t("book") : t("books")}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
