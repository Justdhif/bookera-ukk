"use client";

import { useEffect, useState } from "react";
import BookSearchBar from "./BookSearchBar";
import CategoryBubble from "./CategoryBubble";
import BookList from "./BookList";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";

export default function PublicPageClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const fetchBooks = async () => {
    setLoading(true);

    const res = await bookService.getAll({
      search,
      category_id: categoryId ?? undefined,
      status: "active",
    });

    setBooks(res.data.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, [search, categoryId]);

  return (
    <div className="container space-y-6">
      <BookSearchBar
        search={search}
        onSearch={setSearch}
        onRefresh={fetchBooks}
      />

      <CategoryBubble active={categoryId} onChange={setCategoryId} />

      <BookList books={books} loading={loading} />
    </div>
  );
}
