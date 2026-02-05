"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import BookCopyList from "./BookCopyList";

export default function BookDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await bookService.showBySlug(slug);
      setBook(res.data.data);
    } catch (error) {
      console.error("Error fetching book details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetchBook();
  }, [slug]);

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
