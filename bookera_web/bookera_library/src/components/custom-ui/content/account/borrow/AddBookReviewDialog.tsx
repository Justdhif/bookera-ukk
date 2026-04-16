"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, MessageSquarePlus } from "lucide-react";
import { reviewService } from "@/services/review.service";
import { toast } from "sonner";

interface AddBookReviewDialogProps {
  bookId: number;
  bookTitle: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AddBookReviewDialog({
  bookId,
  bookTitle,
  onSuccess,
  trigger,
}: AddBookReviewDialogProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t("review.ratingRequired") || "Rating is required");
      return;
    }

    setLoading(true);
    try {
      await reviewService.submit({
        book_id: bookId,
        rating,
        review,
      });
      toast.success(t("review.submitSuccess"));
      setOpen(false);
      setReview("");
      setRating(5);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("review.submitError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            {t("addReview")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            {t("review.writeReview")}
          </DialogTitle>
          <DialogDescription>
            {t("review.reviewingBook", { title: bookTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t("review.yourRating") || "Your Rating"}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      (hoveredRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm font-bold text-primary italic">
              {rating === 5 && (t("review.rating5") || "Excellent!")}
              {rating === 4 && (t("review.rating4") || "Very Good")}
              {rating === 3 && (t("review.rating3") || "Good")}
              {rating === 2 && (t("review.rating2") || "Fair")}
              {rating === 1 && (t("review.rating1") || "Poor")}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
              {t("review.yourReview") || "Your Review"}
            </span>
            <Textarea
              placeholder={t("review.placeholder") || "Share your thoughts about this book..."}
              className="min-h-[120px] resize-none focus:ring-primary/20"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            {tCommon("cancel")}
          </Button>
          <Button variant="submit" onClick={handleSubmit} disabled={loading} loading={loading} className="gap-2">
            {t("review.submitBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
