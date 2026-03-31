"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginatedContentProps {
  currentPage: number;
  lastPage: number;
  total: number;
  from?: number;
  to?: number;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
}

function getPageNumbers(current: number, last: number): (number | "...")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  const half = 2;

  let start = Math.max(2, current - half);
  let end = Math.min(last - 1, current + half);

  if (current - half <= 1) end = Math.min(last - 1, 5);
  if (current + half >= last) start = Math.max(2, last - 4);

  pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < last - 1) pages.push("...");
  pages.push(last);

  return pages;
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function PaginatedContent({
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  children,
}: PaginatedContentProps) {
  const prevPageRef = useRef(currentPage);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setDirection(currentPage > prevPageRef.current ? 1 : -1);
    prevPageRef.current = currentPage;
  }, [currentPage]);

  const pages = getPageNumbers(currentPage, lastPage);

  return (
    <div className="space-y-4">
      {lastPage > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {from != null && to != null ? (
              <>
                Showing <span className="font-medium">{from}</span>–
                <span className="font-medium">{to}</span> of{" "}
                <span className="font-medium">{total}</span> results
              </>
            ) : (
              <>
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{lastPage}</span>
              </>
            )}
          </p>

          <Pagination className="w-auto mx-0 justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(currentPage - 1)}
                  aria-disabled={currentPage <= 1}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {pages.map((p, i) =>
                p === "..." ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === currentPage}
                      onClick={() => onPageChange(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(currentPage + 1)}
                  aria-disabled={currentPage >= lastPage}
                  className={currentPage >= lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

