"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import EmptyState from "@/components/custom-ui/EmptyState";
import BookCard from "@/components/custom-ui/content/public/book/BookCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";

import BooksGrid from "./BooksGrid";
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
  const [rightHeight, setRightHeight] = useState<number | null>(null);
  const [relatedPerPage, setRelatedPerPage] = useState(5);

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
    const update = () => setIsLarge(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!isLarge) {
      setRightHeight(null);
      setRelatedPerPage(window.innerWidth < 640 ? 3 : 5);
      return;
    }

    const leftEl = leftCardRef.current;
    if (!leftEl) return;

    const compute = () => {
      const h = leftEl.offsetHeight;
      setRightHeight(h);

      const rowEl =
        relatedMeasureRef.current?.querySelector<HTMLElement>(
          "[data-related-row]",
        );
      const rowHeight = rowEl?.offsetHeight ?? 104;

      const footerHeight = relatedFooterRef.current?.offsetHeight ?? 0;
      const usable = Math.max(0, h - footerHeight);

      const per = Math.max(1, Math.min(8, Math.floor(usable / rowHeight)));
      setRelatedPerPage(per);
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(leftEl);
    return () => ro.disconnect();
  }, [isLarge, mostRelevant, loading, relatedTotalPages]);

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

  if (!query) return null;

  return (
    <div className="container space-y-6 px-4">
      <div className="flex items-center gap-3 pb-4 border-b">
        <Search className="h-6 w-6 text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("showingResultsFor")}{" "}
            <span className="font-semibold text-foreground">
              &quot;{query}&quot;
            </span>
          </p>
        </div>
      </div>

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
                <div
                  className="rounded-lg border overflow-hidden"
                  style={
                    isLarge && rightHeight ? { height: rightHeight } : undefined
                  }
                >
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

      {!loading && books.length > 1 && (
        <section className="space-y-3 pt-2">
          <h2 className="text-base font-semibold">{t("moreResults")}</h2>
          <BooksGrid books={books.slice(1)} />
        </section>
      )}
    </div>
  );
}
