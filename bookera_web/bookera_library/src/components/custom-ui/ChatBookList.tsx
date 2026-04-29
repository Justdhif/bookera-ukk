"use client";

import { useEffect, useState } from "react";
import { Book } from "@/types/book";
import { publicService } from "@/services/public.service";
import BookCard from "@/components/custom-ui/content/public/book-detail/BookCard";
import DataLoading from "@/components/custom-ui/DataLoading";

interface ChatBookListProps {
  slugs: string[];
}

export default function ChatBookList({ slugs }: ChatBookListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const results = await Promise.all(
          slugs.map(slug => publicService.getBookBySlug(slug))
        );
        setBooks(results.map(res => res.data.data));
      } catch (err) {
        console.error("Failed to fetch books for chat list:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slugs.length > 0) {
      fetchBooks();
    }
  }, [slugs]);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-hide -mx-4 px-4">
        <div className="w-[160px] shrink-0">
          <DataLoading variant="card" size="sm" />
        </div>
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-hide -mx-4 px-4 mask-fade-right">
      {books.map((book) => (
        <div key={book.id} className="shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <BookCard book={book} size="sm" />
        </div>
      ))}
    </div>
  );
}
