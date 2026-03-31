"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmptyState from "@/components/custom-ui/EmptyState";
import BookCard from "@/components/custom-ui/content/book/BookCard";
import { Button } from "@/components/ui/button";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import { Skeleton } from "@/components/ui/skeleton";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import RelatedRows from "./RelatedRows";
import RelevantSkeleton from "./RelevantSkeleton";

const relatedVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function SearchPageClient() {
  const t = useTranslations("public.search");
  const tPublic = useTranslations("public");
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const relatedMeasureRef = useRef<HTMLDivElement | null>(null);
  const relatedFooterRef = useRef<HTMLDivElement | null>(null);

  const [relatedPage, setRelatedPage] = useState(0);
  const prevRelatedPageRef = useRef(relatedPage);
  const [relatedDirection, setRelatedDirection] = useState(0);
  const [isLarge, setIsLarge] = useState(false);
  const [relatedPerPage, setRelatedPerPage] = useState(5);

  const [moreBooks, setMoreBooks] = useState<Book[]>([]);
  const [moreBooksLoading, setMoreBooksLoading] = useState(true);
  const [moreBooksPage, setMoreBooksPage] = useState(1);
  const [moreBooksTotalPages, setMoreBooksTotalPages] = useState(1);
  const [loadingMoreBooks, setLoadingMoreBooks] = useState(false);

  const { mostRelevant, relatedAll } = useMemo(() => {
    const most = books[0] ?? null;
    const related = books.slice(1);
    return { mostRelevant: most, relatedAll: related };
  }, [books]);

  const relatedTotalPages = useMemo(() => {
    if (!relatedAll.length) return 1;
    return Math.max(1, Math.ceil(relatedAll.length / relatedPerPage));
  }, [relatedAll.length, relatedPerPage]);

  const relatedRows = useMemo(() => {
    const start = relatedPage * relatedPerPage;
    return relatedAll.slice(start, start + relatedPerPage);
  }, [relatedAll, relatedPage, relatedPerPage]);

  useEffect(() => {
    setRelatedPage(0);
  }, [query]);

  useEffect(() => {
    setRelatedDirection(relatedPage > prevRelatedPageRef.current ? 1 : -1);
    prevRelatedPageRef.current = relatedPage;
  }, [relatedPage]);

  useEffect(() => {
    if (relatedPage > relatedTotalPages - 1) {
      setRelatedPage(Math.max(0, relatedTotalPages - 1));
    }
  }, [relatedPage, relatedTotalPages]);

  useEffect(() => {
    const update = () => {
      setIsLarge(window.innerWidth >= 1024);
      setRelatedPerPage(window.innerWidth < 640 ? 3 : 5);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!query) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await bookService.getAll({
          search: query,
          status: "active",
          per_page: 100,
        });
        if (!cancelled) {
          setBooks(res.data.data.data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchBooks();
    return () => {
      cancelled = true;
    };
  }, [query, router]);

  useEffect(() => {
    let cancelled = false;
    const fetchMoreBooks = async () => {
      setMoreBooksLoading(true);
      try {
        const res = await bookService.getAll({
          status: "active",
          per_page: 12,
          page: 1,
        });
        if (!cancelled) {
          setMoreBooks(res.data.data.data);
          setMoreBooksTotalPages(res.data.data.last_page);
        }
      } catch (error) {
        console.error("Failed to fetch more books", error);
      } finally {
        if (!cancelled) {
          setMoreBooksLoading(false);
        }
      }
    };
    fetchMoreBooks();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMoreBooks = async () => {
    if (moreBooksPage >= moreBooksTotalPages) return;
    setLoadingMoreBooks(true);
    try {
      const nextPage = moreBooksPage + 1;
      const res = await bookService.getAll({
        status: "active",
        per_page: 12,
        page: nextPage,
      });
      setMoreBooks((prev) => [...prev, ...res.data.data.data]);
      setMoreBooksPage(nextPage);
    } catch (error) {
      console.error("Failed to load more books", error);
    } finally {
      setLoadingMoreBooks(false);
    }
  };

  if (!query) return null;

  return (
    <div className="container space-y-6 px-4">
      <ContentHeader
        title={t("title")}
        description={
          <>
            {t("showingResultsFor")}
            <span className="font-semibold text-foreground ml-1">
              &quot;{query}&quot;
            </span>
          </>
        }
        className="pb-4"
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{t("mostRelevant")}</h2>
          {loading ? (
            <Skeleton className="h-4 w-28" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("booksFound", { count: books.length })}
            </p>
          )}
        </div>

        {loading ? (
          <RelevantSkeleton />
        ) : books.length === 0 ? (
          <EmptyState
            icon={<Search />}
            title={tPublic("notFound")}
            description={tPublic("notFoundDesc")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <div ref={leftCardRef}>
                {mostRelevant && <BookCard book={mostRelevant} />}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              {relatedAll.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {t("noRelated")}
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden bg-background lg:h-[665px]">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-hidden">
                      <div
                        className="relative overflow-hidden"
                        ref={relatedMeasureRef}
                      >
                        <AnimatePresence mode="wait" custom={relatedDirection}>
                          <motion.div
                            key={relatedPage}
                            custom={relatedDirection}
                            variants={relatedVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <RelatedRows
                              books={relatedRows}
                              detailLabel={t("detail")}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>

                    {relatedTotalPages > 1 && (
                      <div
                        ref={relatedFooterRef}
                        className="flex items-center justify-end gap-2 p-2 border-t bg-background"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setRelatedPage((p) => Math.max(0, p - 1))
                          }
                          disabled={relatedPage === 0}
                          aria-label={t("previous")}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setRelatedPage((p) =>
                              Math.min(relatedTotalPages - 1, p + 1),
                            )
                          }
                          disabled={relatedPage >= relatedTotalPages - 1}
                          aria-label={t("next")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3 pt-8 pb-4">
        <h2 className="text-xl font-bold border-l-4 border-brand-primary pl-3">
          {t("moreResults")}
        </h2>

        {moreBooksLoading && moreBooks.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {moreBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {moreBooksPage < moreBooksTotalPages && (
              <div className="flex justify-center pt-8 pb-4">
                <LoadMoreButton
                  onClick={loadMoreBooks}
                  loading={loadingMoreBooks}
                  className="px-8 py-2.5 rounded-full border-2 border-brand-primary text-brand-primary font-semibold hover:bg-brand-primary hover:text-white transition disabled:opacity-50"
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
