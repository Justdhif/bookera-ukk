"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Book } from "@/types/book";
import BookCard from "./BookCard";
import EmptyState from "@/components/custom-ui/EmptyState";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import BookListSkeleton from "./BookListSkeleton";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  books: Book[];
  loading: boolean;
}

const variants = {
  enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function BookList({ books, loading }: Props) {
    const t = useTranslations("public");
  const [page, setPage] = useState(0);
  const direction = useRef(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const update = () => setItemsPerPage(window.innerWidth < 640 ? 2 : 5);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [books, itemsPerPage]);

  if (loading) return <BookListSkeleton />;

  if (!books.length) {
    return (
      <EmptyState
        title={t("notFound")}
        description={t("notFoundDesc")}
        icon={<BookOpen className="h-10 w-10" />}
      />
    );
  }

  const totalPages = Math.ceil(books.length / itemsPerPage);
  const visibleBooks = books.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const goNext = () => {
    if (page < totalPages - 1) {
      direction.current = 1;
      setPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (page > 0) {
      direction.current = -1;
      setPage((p) => p - 1);
    }
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction.current}>
          <motion.div
            key={page}
            custom={direction.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-4"
          >
            {visibleBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {page > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-2 rounded-full border bg-brand-primary text-white shadow hover:bg-brand-primary-dark transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {page < totalPages - 1 && (
        <button
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-2 rounded-full border bg-brand-primary text-white shadow hover:bg-brand-primary-dark transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
