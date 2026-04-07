"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { BorrowRequest } from "@/types/borrow-request";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BorrowRequestBooksCardProps {
  request: BorrowRequest;
}

export default function BorrowRequestBooksCard({
  request,
}: BorrowRequestBooksCardProps) {
  const t = useTranslations("borrow-request");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {t("requestedBooks")} ({request.borrow_request_details.length})
        </CardTitle>
        <CardDescription>{t("bookListHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {request.borrow_request_details.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              {t("noBooksInRequest")}
            </div>
          ) : (
            request.borrow_request_details.map((detail) => (
              <div
                key={detail.id}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
              >
                {detail.book?.cover_image ? (
                  <Image
                    src={detail.book.cover_image}
                    alt={detail.book.title}
                    className="h-12 w-9 rounded object-cover"
                    width={300}
                    height={400}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-12 w-9 items-center justify-center rounded bg-muted">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium">{detail.book?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {detail.book?.author}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
