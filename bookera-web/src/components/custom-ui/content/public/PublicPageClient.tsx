"use client";

import { useEffect, useState } from "react";
import CategoryBubble from "./CategoryBubble";
import BookList from "./BookList";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import SavesList from "./SavesList";

export default function PublicPageClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryId, setCategoryId] = useState<number | null>(null);

  const fetchBooks = async () => {
    setLoading(true);

    const res = await bookService.getAll({
      category_id: categoryId ?? undefined,
      status: "active",
    });

    setBooks(res.data.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, [categoryId]);

  return (
    <div className="space-y-6">
      <div className="lg:hidden mb-6">
        <SavesList mode="horizontal" />
      </div>
      <CategoryBubble active={categoryId} onChange={setCategoryId} />

      <BookList books={books} loading={loading} />
    </div>
  );
}
