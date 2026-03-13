"use client";

import { useTranslations } from "next-intl";
import { BookCopy } from "@/types/book-copy";
import BookCopyStatusBadge from "@/components/custom-ui/badge/BookCopyStatusBadge";
import { BookOpen } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";

export default function BookCopyList({ copies }: { copies: BookCopy[] }) {
    const t = useTranslations("public");
  if (!copies || copies.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen />}
        description="No book copies available"
        variant="compact"
      />
    );
  }

  return (
    <div className="space-y-3">
      {copies.map((copy) => (
        <div
          key={copy.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{"Copy Code"}: {copy.copy_code}</p>
              <BookCopyStatusBadge status={copy.status} />
            </div>
            {copy.status && (
              <p className="text-sm text-muted-foreground">
                {"Book Condition"}:{" "}
                {copy.status === "available"
                  ? t("available")
                  : copy.status === "borrowed"
                  ? t("borrowed")
                  : copy.status === "lost"
                  ? "Lost"
                  : copy.status === "damaged"
                  ? "Damaged"
                  : copy.status}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
