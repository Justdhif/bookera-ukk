"use client";

import { useEffect, useState } from "react";
import CategoryBubble from "./CategoryBubble";
import BookList from "./BookList";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import MyLoanHighlight from "./MyLoanHighlight";
import { useTranslations } from "next-intl";

export default function PublicPageClient() {
  const t = useTranslations('header');
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
    <div className="container space-y-6">
      <MyLoanHighlight />
      
      {/* Category Section with Title */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {t('categories').toUpperCase()}
          </h2>
        </div>
        <CategoryBubble active={categoryId} onChange={setCategoryId} />
      </div>

      <BookList books={books} loading={loading} />
    </div>
  );
}
