"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { reviewService } from "@/services/review.service";
import { PaginatedReviewResponse } from "@/types/review";
import { Book } from "@/types/book";
import LoadMoreButton from "@/components/custom-ui/button/LoadMoreButton";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import DataLoading from "@/components/custom-ui/DataLoading";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import CroissantBadge from "@/components/custom-ui/badge/CroissantBadge";
import MemberBadge from "@/components/custom-ui/badge/MemberBadge";

interface BookReviewSectionProps {
  book: Book;
  onReviewSubmit?: () => void;
}

import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function BookReviewSection({
  book,
  onReviewSubmit,
}: BookReviewSectionProps) {
  const t = useTranslations("public");
  const locale = useLocale();
  const dateLocale = locale === "id" ? id : enUS;

  const [reviews, setReviews] = useState<PaginatedReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchReviews = async (pageToFetch = 1) => {
    try {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await reviewService.getByBookId(book.id, {
        page: pageToFetch,
        per_page: 5,
      });

      if (pageToFetch === 1) {
        setReviews(res.data.data);
      } else if (reviews) {
        setReviews({
          ...res.data.data,
          data: [...reviews.data, ...res.data.data.data],
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (book?.id) {
      fetchReviews();
    }
  }, [book.id]);

  const renderStars = (starCount: number, displayRating: number) => {
    const stars = [];
    for (let i = 1; i <= starCount; i++) {
      const isFilled = i <= displayRating;
      const isHalf = !isFilled && i - 0.5 <= displayRating;

      stars.push(
        <Star
          key={i}
          className={cn(
            "h-5 w-5",
            isFilled
              ? "fill-yellow-400 text-yellow-400"
              : isHalf
                ? "fill-yellow-200 text-yellow-400"
                : "fill-gray-100 text-gray-300 dark:fill-gray-800 dark:text-gray-700",
          )}
        />,
      );
    }
    return stars;
  };

  const hasMore = reviews ? reviews.current_page < reviews.last_page : false;

  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-xl">{t("latestReviews")}</h3>

        {loading ? (
          <DataLoading size="md" className="py-12" />
        ) : !reviews?.data.length ? (
          <FadeUp>
            <div className="text-center py-12 px-4 border rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
              <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-muted-foreground">{t("noReviewsYet")}</p>
            </div>
          </FadeUp>
        ) : (
          <StaggerContainer className="space-y-4">
            {reviews.data.map((r, idx) => (
              <FadeUp key={r.id} delay={idx * 0.05}>
                <div
                  className="flex gap-4 p-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors"
                >
                  <Link
                    href={`/${r.user?.slug}/profile`}
                    className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-primary/10 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={
                        r.user?.profile?.avatar ||
                        "/assets/images/default-avatar.png"
                      }
                      width={40}
                      height={40}
                      alt="User"
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          href={`/${r.user?.slug}/profile`}
                          className="font-medium text-sm truncate hover:text-brand-primary transition-colors"
                        >
                          {r.user?.profile?.full_name || ""}
                        </Link>
                        <div className="flex items-center gap-1 shrink-0">
                          {r.user?.role === "admin" && <AdminBadge />}
                          {r.user?.role === "member" && <MemberBadge />}
                          {r.user?.profile?.gender === "croissant" && (
                            <CroissantBadge />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(r.created_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {renderStars(5, r.rating)}
                    </div>
                    {r.review && (
                      <p
                        className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed block overflow-hidden"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        "{r.review}"
                      </p>
                    )}
                  </div>
                </div>
              </FadeUp>
            ))}

            {hasMore && (
              <FadeUp delay={reviews.data.length * 0.05}>
                <div className="flex justify-center mt-6">
                  <LoadMoreButton
                    variant="outline"
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      fetchReviews(nextPage);
                    }}
                    loading={loadingMore}
                  />
                </div>
              </FadeUp>
            )}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
