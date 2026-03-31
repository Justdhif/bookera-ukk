"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { reviewService } from "@/services/review.service";
import { useAuthStore } from "@/store/auth.store";
import { BookReview, PaginatedReviewResponse } from "@/types/review";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import { Textarea } from "@/components/ui/textarea";
import { Star, MoreVertical, Trash, Edit, StarHalf } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface BookReviewSectionProps {
  book: Book;
  onReviewSubmit?: () => void;
}

export default function BookReviewSection({
  book,
  onReviewSubmit,
}: BookReviewSectionProps) {
  const t = useTranslations("public");
  const locale = useLocale();
  const dateLocale = locale === "id" ? id : enUS;
  const { isAuthenticated, user } = useAuthStore();

  const [reviews, setReviews] = useState<PaginatedReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [userReview, setUserReview] = useState<BookReview | null>(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const fetchUserReview = async () => {
    try {
      if (!isAuthenticated) return;
      const res = await reviewService.check(book.id);
      if (res.data.data.review) {
        setUserReview(res.data.data.review);
      } else {
        setUserReview(null);
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
    }
  };

  useEffect(() => {
    if (book?.id) {
      fetchReviews();
      fetchUserReview();
    }
  }, [book.id, isAuthenticated]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error(t("reviewRequiredRating"));
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.submit({
        book_id: book.id,
        rating,
        review: reviewText,
      });

      toast.success(t("reviewSubmitted"));
      setIsEditing(false);
      fetchUserReview();
      fetchReviews(1);
      if (onReviewSubmit) onReviewSubmit();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("actionFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await reviewService.remove(book.id);
      toast.success(t("reviewDeleted"));
      setUserReview(null);
      setRating(0);
      setReviewText("");
      fetchReviews(1);
      if (onReviewSubmit) onReviewSubmit();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("actionFailed"));
    }
  };

  const renderStars = (
    starCount: number,
    displayRating: number,
    interactive: boolean = false,
    onClick?: (i: number) => void,
    onMouseEnter?: (i: number) => void,
    onMouseLeave?: () => void,
  ) => {
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
            interactive
              ? "cursor-pointer transition-transform hover:scale-125 h-10 w-10"
              : "h-5 w-5",
          )}
          onClick={() => interactive && onClick && onClick(i)}
          onMouseEnter={() => interactive && onMouseEnter && onMouseEnter(i)}
          onMouseLeave={() => interactive && onMouseLeave && onMouseLeave()}
        />,
      );
    }
    return stars;
  };

  const hasMore = reviews ? reviews.current_page < reviews.last_page : false;

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {isAuthenticated ? (
          <div className="flex-1 w-full bg-card rounded-xl border p-5">
            {!userReview || isEditing ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {isEditing ? t("editReview") : t("writeReview")}
                </h4>
                <div className="flex flex-col items-center justify-center py-6 border-b border-border mb-6 space-y-4">
                  <div className="flex items-center gap-3">
                    {renderStars(
                      5,
                      hoverRating || rating,
                      true,
                      (i) => setRating(i),
                      (i) => setHoverRating(i),
                      () => setHoverRating(0),
                    )}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm font-semibold text-brand-primary animate-in fade-in slide-in-from-bottom-1 capitalize">
                      {rating === 5
                        ? t("excellent")
                        : rating === 4
                          ? t("good")
                          : rating === 3
                            ? t("average")
                            : rating === 2
                              ? t("poor")
                              : t("veryPoor")}
                    </p>
                  )}
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t("reviewPlaceholder")}
                  className="min-h-[120px] bg-background resize-none border-gray-200 dark:border-gray-800 transition-all focus:ring-brand-primary/20"
                />
                <div className="flex gap-2 justify-end">
                  {isEditing && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setRating(userReview?.rating || 0);
                        setReviewText(userReview?.review || "");
                      }}
                    >
                      {t("cancel")}
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || rating === 0}
                    variant="submit"
                    loading={submitting}
                  >
                    {submitting ? t("submittingBtn") : t("submit")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{t("yourReview")}</h4>
                    <div className="flex gap-0.5">
                      {renderStars(5, userReview?.rating || 0)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -m-2"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          if (userReview) {
                            setRating(userReview.rating);
                            setReviewText(userReview.review || "");
                            setIsEditing(true);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDeleteReview}
                        className="text-red-500 hover:text-red-600 focus:text-red-600"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {userReview?.review && (
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                    "{userReview.review}"
                  </p>
                )}
                {userReview?.updated_at && (
                  <span className="text-xs text-muted-foreground block">
                    {formatDistanceToNow(new Date(userReview.updated_at), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 w-full bg-card rounded-xl border p-5 flex flex-col items-center justify-center text-center gap-3">
            <Star className="h-10 w-10 text-muted-foreground/30" />
            <div>
              <h4 className="font-semibold">{t("loginToReview")}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {t("loginToReviewDesc")}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-xl">{t("latestReviews")}</h3>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !reviews?.data.length ? (
          <div className="text-center py-12 px-4 border rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
            <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("noReviewsYet")}</p>
            {!userReview && isAuthenticated && (
              <p className="text-sm text-muted-foreground mt-1">
                {t("beTheFirstToReview")}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.data.map((r) => (
              <div
                key={r.id}
                className="flex gap-4 p-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-primary/10">
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
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="font-medium text-sm truncate">
                      {r.user?.profile?.full_name || ""}
                      {userReview?.id === r.id && (
                        <span className="ml-2 text-xs text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full font-normal">
                          {t("you")}
                        </span>
                      )}
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
            ))}

            {hasMore && (
              <div className="flex justify-center mt-6">
                <LoadMoreButton
                  variant="outline"
                  onClick={() => {
                    setPage((p) => p + 1);
                    fetchReviews(page + 1);
                  }}
                  loading={loadingMore}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
