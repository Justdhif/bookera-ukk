"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import { bookService } from "@/services/book.service";
import BookCard from "./BookCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BookListSkeleton from "./BookListSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";

interface Props {
  category: Category;
}

const variants = {
  enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function CategoryBookRow({ category }: Props) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [displayedPage, setDisplayedPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const direction = useRef(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const update = () => setItemsPerPage(window.innerWidth < 640 ? 2 : 5);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!inView) return;
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await bookService.getAll({
          category_ids: [category.id],
          status: "active",
          per_page: itemsPerPage,
          page,
        });
        setBooks(res.data.data.data);
        setTotalPages(res.data.data.last_page);
        setDisplayedPage(page);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [category.id, page, itemsPerPage, inView]);

  const goNext = () => {
    if (page < totalPages) {
      direction.current = 1;
      setPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (page > 1) {
      direction.current = -1;
      setPage((p) => p - 1);
    }
  };

  if (!loading && books.length === 0) return null;

  return (
    <div ref={ref}>
      <section className="space-y-3">
        <h2 className="text-xl font-bold border-l-4 border-brand-primary pl-3">
          {category.name}
        </h2>
        {loading && books.length === 0 ? (
          <BookListSkeleton />
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction.current}>
                <motion.div
                  key={displayedPage}
                  custom={direction.current}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={`grid grid-cols-2 sm:grid-cols-5 gap-4 py-2 px-1 transition-opacity duration-300 ${
                    loading ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            {page > 1 && (
              <Button
                disabled={loading}
                onClick={goPrev}
                variant="outline"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 p-2 h-10 w-10 rounded-full border bg-brand-primary text-white shadow-lg hover:bg-brand-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {page < totalPages && (
              <Button
                disabled={loading}
                onClick={goNext}
                variant="outline"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 p-2 h-10 w-10 rounded-full border bg-brand-primary text-white shadow-lg hover:bg-brand-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
