"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Building2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";

function getAuthorLabel(book: Book) {
  if (book.authors && book.authors.length > 0) {
    return book.authors.map((a) => a.name).join(", ");
  }
  return book.author || "";
}

function getPublisherLabel(book: Book) {
  if (book.publishers && book.publishers.length > 0) {
    return book.publishers.map((p) => p.name).join(", ");
  }
  return book.publisher || "";
}

export default function RelatedRows({
  books,
  detailLabel,
}: {
  books: Book[];
  detailLabel: string;
}) {
  return (
    <div className="divide-y">
      {books.map((book) => (
        <div
          key={book.id}
          className="flex items-center gap-4 p-4"
          data-related-row
        >
          <Image
            src={book.cover_image}
            alt={book.title}
            className="h-16 w-12 rounded object-cover shrink-0"
            width={300}
            height={400}
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 font-semibold truncate">
              {book.title}
              {book.publication_year && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <span>/</span>
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  <span className="truncate">{book.publication_year}</span>
                </div>
              )}
            </div>
            {getAuthorLabel(book) && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                <BookOpen className="h-3 w-3 shrink-0" />
                <span className="truncate">{getAuthorLabel(book)}</span>
              </div>
            )}
            {getPublisherLabel(book) && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{getPublisherLabel(book)}</span>
              </div>
            )}
            {(book.categories?.length ?? 0) > 0 && (
              <div className="mt-2 flex items-center gap-1 overflow-hidden">
                {(book.categories ?? []).slice(0, 2).map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="default"
                    className="text-[10px] px-1.5 py-0 h-4 font-normal"
                  >
                    {cat.name}
                  </Badge>
                ))}
                {(book.categories?.length ?? 0) > 2 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 font-normal"
                  >
                    +{(book.categories?.length ?? 0) - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            {book.total_copies !== undefined && (
              <Badge
                variant={
                  book.available_copies && book.available_copies > 0
                    ? "default"
                    : "secondary"
                }
                className={
                  book.available_copies && book.available_copies > 0
                    ? "bg-brand-primary hover:bg-brand-primary-dark text-white text-xs"
                    : "text-xs"
                }
              >
                {book.available_copies || 0}/{book.total_copies}
              </Badge>
            )}
            <Link
              href={`/books/${book.slug}`}
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              {detailLabel}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
