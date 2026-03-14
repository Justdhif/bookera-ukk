"use client";

import Link from "next/link";

import { Book } from "@/types/book";

function getAuthorLabel(book: Book) {
  if (book.authors && book.authors.length > 0) {
    return book.authors.map((a) => a.name).join(", ");
  }
  return book.author || "";
}

export default function BooksGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/books/${book.slug}`}
          className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted"
          aria-label={book.title}
        >
          <img
            src={book.cover_image_url ?? "/placeholder.png"}
            alt={book.title}
            className="w-full aspect-3/4 object-cover transition-transform group-hover:scale-[1.02]"
          />

          <div className="absolute inset-x-0 bottom-0 p-2 bg-linear-to-t from-black/70 via-black/25 to-transparent">
            <div className="text-xs font-semibold text-white truncate">
              {book.title}
            </div>
            <div className="text-[11px] text-white/80 truncate">
              {getAuthorLabel(book)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
