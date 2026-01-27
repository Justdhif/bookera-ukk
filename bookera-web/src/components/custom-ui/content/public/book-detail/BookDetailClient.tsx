"use client";

import { useEffect, useState } from "react";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import BookCopyList from "./BookCopyList";

export default function BookDetailClient({ id }: { id: number }) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await bookService.show(id);
      setBook(res.data.data);
    } catch (error) {
      console.error("Error fetching book details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || isNaN(id)) return;
    fetchBook();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!book) return null;

  return (
    <div className="container space-y-8">
      {/* INFO */}
      <div className="flex gap-6">
        <img src={book.cover_image_url} className="w-40 rounded" />

        <div>
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-muted-foreground">{book.author}</p>
          <p className="mt-4">{book.description}</p>
        </div>
      </div>

      {/* COPIES */}
      <BookCopyList copies={book.copies} />
    </div>
  );
}
