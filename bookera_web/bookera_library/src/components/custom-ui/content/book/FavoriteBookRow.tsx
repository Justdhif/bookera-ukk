"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Book } from "@/types/book";
import { favoriteService } from "@/services/favorite.service";
import BookCard from "./BookCard";
import BookListSkeleton from "./BookListSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useAuthStore } from "@/store/auth.store";

const variants = {
  enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function FavoriteBookRow() {
  const t = useTranslations("public");
  const { isAuthenticated } = useAuthStore();
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const update = () => setItemsPerPage(window.innerWidth < 640 ? 2 : 5);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!inView || !isAuthenticated) {
      if (!isAuthenticated) setLoading(false);
      return;
    }
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await favoriteService.getAll({
          per_page: itemsPerPage,
          page: 1,
        });
        const favoriteBooks = res.data.data.data
          .map((fav) => fav.book!)
          .filter(Boolean);
        setBooks(favoriteBooks);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [itemsPerPage, inView, isAuthenticated]);

  if (!isAuthenticated || (!loading && books.length === 0)) return null;

  return (
    <div ref={ref}>
      <section className="space-y-3">
        <div className="flex items-center justify-between border-l-4 border-brand-primary pl-3">
          <h2 className="text-xl font-bold">{t("favorites.title")}</h2>
          {!loading && books.length > 0 && (
            <Link
              href="/favorites"
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              {t("favorites.viewAll")}
            </Link>
          )}
        </div>
        {loading && books.length === 0 ? (
          <BookListSkeleton />
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key="favorites-row"
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
          </div>
        )}
      </section>
    </div>
  );
}
