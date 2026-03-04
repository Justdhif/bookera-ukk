"use client";

import { useEffect, useState } from "react";
import CategoryBubble from "./category/CategoryBubble";
import BookList from "./book/BookList";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import SavesList from "./saves/SavesList";
import BannerCarousel from "./BannerCarousel";
import SpeakerMarquee from "./SpeakerMarquee";
import RealTimeClock from "./RealTimeClock";
import QuickNavSection from "./QuickNavSection";

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
    <div className="space-y-8 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-2">
            <BannerCarousel />
            <SpeakerMarquee />
          </div>

          <div className="lg:col-span-1">
            <div className="flex h-full flex-col gap-2">
              <div className="flex-3">
                <RealTimeClock />
              </div>
              <div className="flex-2 pt-2">
                <QuickNavSection />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-6">
        <div className="lg:hidden">
          <SavesList mode="horizontal" />
        </div>
        <CategoryBubble active={categoryId} onChange={setCategoryId} />
        <BookList books={books} loading={loading} />
      </div>
    </div>
  );
}
