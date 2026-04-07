"use client";

import { useTranslations } from "next-intl";
import { Book } from "@/types/book";
import BookReviewSection from "./BookReviewSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookReviewDialogProps {
  book: Book;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmit: () => void;
}

export default function BookReviewDialog({ book, isOpen, onOpenChange, onReviewSubmit }: BookReviewDialogProps) {
  const t = useTranslations("public");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle>{t("reviewsTitle")}</DialogTitle>
          <DialogDescription>{t("reviewsDesc")}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pb-6">
          <BookReviewSection book={book} onReviewSubmit={onReviewSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
